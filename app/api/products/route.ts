import { NextResponse } from 'next/server'

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  throw new Error('Missing required Shopify environment variables')
}

const SHOPIFY_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`

export async function GET() {
  const query = `
    query GetProducts {
      products(first: 10) {
        edges {
          node {
            id
            handle
            title
            description
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch(SHOPIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      console.error('[v0] Shopify API error:', response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (data.errors) {
      console.error('[v0] GraphQL errors:', data.errors)
      return NextResponse.json(
        { error: 'GraphQL error', details: data.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(data.data)
  } catch (error) {
    console.error('[v0] Products API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
