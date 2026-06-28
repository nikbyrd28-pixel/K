import { NextResponse } from 'next/server'

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

function normalizeShopDomain(domain: string) {
  return domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export async function GET() {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    console.error('[v0] Missing Shopify product environment variables')
    return NextResponse.json({ error: 'Missing Shopify configuration' }, { status: 500 })
  }

  const shopifyEndpoint = `https://${normalizeShopDomain(SHOPIFY_STORE_DOMAIN)}/api/2024-01/graphql.json`

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
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
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
    const response = await fetch(shopifyEndpoint, {
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
