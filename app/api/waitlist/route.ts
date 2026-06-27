import { NextResponse } from "next/server"

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_ADMIN_ACCESS_TOKEN =
  process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ||
  process.env.SHOPIFY_ACCESS_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID
const GHL_API_VERSION = "2021-07-28"
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL
const GOOGLE_SHEETS_WEBHOOK_SECRET = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET
const API_VERSION = "2026-01"

const CUSTOMER_CREATE = `
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      userErrors { field message }
      customer { id }
    }
  }
`

const CUSTOMER_EMAIL_MARKETING_CONSENT_UPDATE = `
  mutation customerEmailMarketingConsentUpdate($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      userErrors { field message }
      customer { id }
    }
  }
`

const TAGS_ADD = `
  mutation tagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      userErrors { field message }
      node { id }
    }
  }
`

const CUSTOMER_BY_EMAIL = `
  query customerByEmail($query: String!) {
    customers(first: 1, query: $query) {
      nodes { id tags }
    }
  }
`

type CustomerCreateResponse = {
  data?: {
    customerCreate?: {
      userErrors?: Array<{ message: string }>
      customer?: { id: string }
    }
  }
}

type CustomerConsentResponse = {
  data?: {
    customerEmailMarketingConsentUpdate?: {
      userErrors?: Array<{ message: string }>
      customer?: { id: string }
    }
  }
}

type TagsAddResponse = {
  data?: {
    tagsAdd?: {
      userErrors?: Array<{ message: string }>
      node?: { id: string }
    }
  }
}

type CustomerLookupResponse = {
  data?: {
    customers?: {
      nodes?: Array<{ id: string; tags?: string[] }>
    }
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function normalizeShopDomain(domain: string) {
  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

function escapeShopifyQueryValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

async function shopifyGraphQL<T>(query: string, variables: Record<string, unknown>) {
  const response = await fetch(
    `https://${normalizeShopDomain(SHOPIFY_STORE_DOMAIN!)}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
    },
  )

  const result = await response.json()
  return { ok: response.ok, result: result as T & { errors?: unknown } }
}

function firstUserError(errors?: Array<{ message: string }>) {
  return errors?.[0]?.message
}

async function tagCustomer(customerId: string) {
  const { ok, result } = await shopifyGraphQL<TagsAddResponse>(TAGS_ADD, {
    id: customerId,
    tags: ["waitlist", "care-list", "website-signup"],
  })

  const error = firstUserError(result?.data?.tagsAdd?.userErrors)
  if (!ok || result.errors || error) {
    console.log("[v0] Waitlist tagsAdd error:", JSON.stringify(result.errors || error))
    return false
  }

  return true
}

async function subscribeCustomer(customerId: string) {
  const { ok, result } = await shopifyGraphQL<CustomerConsentResponse>(
    CUSTOMER_EMAIL_MARKETING_CONSENT_UPDATE,
    {
      input: {
        customerId,
        emailMarketingConsent: {
          marketingState: "SUBSCRIBED",
          marketingOptInLevel: "SINGLE_OPT_IN",
        },
      },
    },
  )

  const error = firstUserError(result?.data?.customerEmailMarketingConsentUpdate?.userErrors)
  if (!ok || result.errors || error) {
    // Don't fail the whole signup because some shops require a different consent flow.
    // The customer + tags are the actual list storage.
    console.log("[v0] Waitlist marketing consent warning:", JSON.stringify(result.errors || error))
    return false
  }

  return true
}

async function syncGoHighLevelContact(email: string) {
  if (!GHL_PRIVATE_INTEGRATION_TOKEN || !GHL_LOCATION_ID) {
    return { skipped: true }
  }

  try {
    const response = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
        "Content-Type": "application/json",
        Version: GHL_API_VERSION,
      },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        email,
        source: "Hubs & Babydoll website care list",
        tags: ["care-list", "waitlist", "website-signup"],
      }),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      console.log("[v0] GHL waitlist sync warning:", JSON.stringify(result))
      return { skipped: false, success: false }
    }

    return { skipped: false, success: true }
  } catch (error) {
    console.log("[v0] GHL waitlist sync error:", (error as Error).message)
    return { skipped: false, success: false }
  }
}

async function syncGoogleSheetsContact(email: string) {
  if (!GOOGLE_SHEETS_WEBHOOK_URL) {
    return { skipped: true }
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        secret: GOOGLE_SHEETS_WEBHOOK_SECRET,
        email,
        source: "Hubs & Babydoll website care list",
        tags: ["care-list", "waitlist", "website-signup"],
        submittedAt: new Date().toISOString(),
      }),
    })

    const text = await response.text().catch(() => "")
    let result: { success?: boolean; error?: string } | null = null
    try {
      result = text ? JSON.parse(text) : null
    } catch {
      result = null
    }

    if (!response.ok || result?.success === false) {
      console.log("[v0] Google Sheets waitlist sync warning:", text)
      return { skipped: false, success: false }
    }

    return { skipped: false, success: true }
  } catch (error) {
    console.log("[v0] Google Sheets waitlist sync error:", (error as Error).message)
    return { skipped: false, success: false }
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }

    const sheetSync = await syncGoogleSheetsContact(normalizedEmail)

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
      console.log("[v0] Waitlist: missing Shopify Admin credentials")
      if (sheetSync.success) {
        return NextResponse.json({ success: true, storedIn: "google-sheets" })
      }

      return NextResponse.json({ error: "Signup storage is not configured yet." }, { status: 500 })
    }

    const { ok, result } = await shopifyGraphQL<CustomerCreateResponse>(CUSTOMER_CREATE, {
      input: {
        email: normalizedEmail,
      },
    })

    const userErrors = result?.data?.customerCreate?.userErrors ?? []

    if (!ok || result.errors) {
      console.log("[v0] Waitlist GraphQL errors:", JSON.stringify(result.errors))
      return NextResponse.json({ error: "Shopify rejected the signup request." }, { status: 502 })
    }

    if (userErrors.length > 0) {
      // Email already on file — treat as a successful signup, not an error.
      const alreadyExists = userErrors.some((e: { message: string }) =>
        /taken|already/i.test(e.message),
      )
      if (alreadyExists) {
        const lookup = await shopifyGraphQL<CustomerLookupResponse>(CUSTOMER_BY_EMAIL, {
          query: `email:"${escapeShopifyQueryValue(normalizedEmail)}"`,
        })

        const customer = lookup.result?.data?.customers?.nodes?.[0]
        if (customer?.id) {
          await tagCustomer(customer.id)
          await subscribeCustomer(customer.id)
        }

        await syncGoHighLevelContact(normalizedEmail)

        return NextResponse.json({ success: true, alreadySubscribed: true })
      }
      console.log("[v0] Waitlist userErrors:", JSON.stringify(userErrors))
      return NextResponse.json({ error: userErrors[0].message }, { status: 400 })
    }

    const customerId = result?.data?.customerCreate?.customer?.id
    if (!customerId) {
      console.log("[v0] Waitlist missing customer id:", JSON.stringify(result))
      return NextResponse.json({ error: "Shopify did not return a customer record." }, { status: 502 })
    }

    const tagged = await tagCustomer(customerId)
    await subscribeCustomer(customerId)
    await syncGoHighLevelContact(normalizedEmail)

    if (!tagged) {
      return NextResponse.json({ error: "Email saved, but Shopify did not apply the care-list tags." }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.log("[v0] Waitlist route error:", (error as Error).message)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
