import { NextResponse } from 'next/server'

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

function normalizeShopDomain(domain: string) {
  return domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

interface CheckoutLine {
  variantId: string
  quantity: number
}

export async function POST(request: Request) {
  try {
    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      console.error('[v0] Missing Shopify checkout environment variables')
      return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 })
    }

    const shopifyEndpoint = `https://${normalizeShopDomain(SHOPIFY_STORE_DOMAIN)}/api/2024-01/graphql.json`

    const body = await request.json()
    const lines: CheckoutLine[] = body.lines || []

    if (!lines.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const mutation = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        lines: lines.map((line) => ({
          merchandiseId: line.variantId,
          quantity: line.quantity,
        })),
      },
    }

    const response = await fetch(shopifyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: mutation, variables }),
    })

    if (!response.ok) {
      console.error('[v0] Shopify checkout API error:', response.statusText)
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: response.status })
    }

    const data = await response.json()

    if (data.errors) {
      console.error('[v0] GraphQL errors:', data.errors)
      return NextResponse.json({ error: 'GraphQL error', details: data.errors }, { status: 400 })
    }

    const userErrors = data.data?.cartCreate?.userErrors
    if (userErrors && userErrors.length > 0) {
      console.error('[v0] Cart user errors:', userErrors)
      return NextResponse.json({ error: userErrors[0].message }, { status: 400 })
    }

    let checkoutUrl: string | undefined = data.data?.cartCreate?.cart?.checkoutUrl
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
    }

    // Append channel param to bypass the storefront password screen
    const separator = checkoutUrl.includes('?') ? '&' : '?'
    checkoutUrl = `${checkoutUrl}${separator}channel=online_store`

    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    console.error('[v0] Checkout API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
