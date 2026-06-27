import { NextResponse } from "next/server"

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
const API_VERSION = "2026-07"

const CUSTOMER_CREATE = `
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      userErrors { field message }
      customer {
        id
        defaultEmailAddress { emailAddress marketingState marketingOptInLevel }
      }
    }
  }
`

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
      console.log("[v0] Waitlist: missing Shopify Admin credentials")
      return NextResponse.json(
        { error: "Signup is not configured yet. Please try again later." },
        { status: 500 },
      )
    }

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: CUSTOMER_CREATE,
          variables: {
            input: {
              email,
              emailMarketingConsent: {
                marketingState: "SUBSCRIBED",
                marketingOptInLevel: "SINGLE_OPT_IN",
              },
              tags: ["waitlist"],
            },
          },
        }),
      },
    )

    const result = await response.json()
    const userErrors = result?.data?.customerCreate?.userErrors ?? []

    if (result.errors) {
      console.log("[v0] Waitlist GraphQL errors:", JSON.stringify(result.errors))
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 })
    }

    if (userErrors.length > 0) {
      // Email already on file — treat as a successful signup, not an error.
      const alreadyExists = userErrors.some((e: { message: string }) =>
        /taken|already/i.test(e.message),
      )
      if (alreadyExists) {
        return NextResponse.json({ success: true, alreadySubscribed: true })
      }
      console.log("[v0] Waitlist userErrors:", JSON.stringify(userErrors))
      return NextResponse.json({ error: userErrors[0].message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.log("[v0] Waitlist route error:", (error as Error).message)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
