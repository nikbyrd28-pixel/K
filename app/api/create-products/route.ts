import { NextRequest, NextResponse } from 'next/server'

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
  console.error('[v0] Missing Shopify environment variables')
}

const products = [
  {
    title: 'The SEEN Lavender Set',
    handle: 'the-seen-lavender-set',
    productType: 'Body Care',
    vendor: 'Seen & Heard Care',
    bodyHtml: 'Melt away the mental noise of the day. Formulated with pure Shea Butter, Mango Butter, Jojoba Oil, and therapeutic Lavender Essential Oil, this set deeply hydrates, reduces inflammation, and prepares your mind and body for deep, restorative rest.',
    variants: {
      price: '58.00',
    },
  },
  {
    title: 'The HEARD Bay Rum Experience',
    handle: 'the-heard-bay-rum-experience',
    productType: 'Body Care',
    vendor: 'Seen & Heard Care',
    bodyHtml: 'A grounding, full-body experience designed for rich, masculine or unisex hydration. Utilizing classic West Indian Bay Rum botanicals, it leaves an energetic, crisp finish that keeps skin velvety and vibrant from morning to night.',
    variants: {
      price: '68.00',
    },
  },
  {
    title: 'The SEEN Jasmine & Gardenia Shield',
    handle: 'the-seen-jasmine-gardenia-shield',
    productType: 'Body Care',
    vendor: 'Seen & Heard Care',
    bodyHtml: 'Elevate your daily ritual with a sophisticated, pure floral shield. This blend locks in vital moisture all day long, draping your skin in an intoxicating, delicate floral bouquet that protects against environmental dryness.',
    variants: {
      price: '68.00',
    },
  },
]

const createProductQuery = `
  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        handle
        variants(first: 1) {
          edges {
            node {
              id
              price
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

export async function POST(request: NextRequest) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Missing Shopify configuration' },
      { status: 500 }
    )
  }

  const results = []

  for (const product of products) {
    try {
      const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2026-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: createProductQuery,
          variables: {
            input: product,
          },
        }),
      })

      const result = await response.json()

      if (result.errors) {
        console.error(`[v0] GraphQL Error for ${product.title}:`, result.errors)
        results.push({
          product: product.title,
          status: 'error',
          error: result.errors[0]?.message,
        })
      } else if (result.data?.productCreate?.userErrors?.length > 0) {
        console.error(`[v0] User Error for ${product.title}:`, result.data.productCreate.userErrors)
        results.push({
          product: product.title,
          status: 'error',
          error: result.data.productCreate.userErrors[0]?.message,
        })
      } else if (result.data?.productCreate?.product) {
        console.log(`[v0] Created product: ${result.data.productCreate.product.title}`)
        results.push({
          product: product.title,
          status: 'success',
          id: result.data.productCreate.product.id,
        })
      } else {
        console.error(`[v0] Unexpected response for ${product.title}:`, result)
        results.push({
          product: product.title,
          status: 'error',
          error: 'Unexpected response',
        })
      }
    } catch (error) {
      results.push({
        product: product.title,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({ results })
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to create products for Seen & Heard Care store',
    productsToCreate: products.length,
    products: products.map((p) => ({ title: p.title, price: p.variants.price })),
  })
}
