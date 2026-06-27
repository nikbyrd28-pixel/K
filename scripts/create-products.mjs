import fs from 'fs'
import path from 'path'

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN
const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

if (!storeDomain || !accessToken) {
  console.error('[v0] Error: Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN')
  process.exit(1)
}

const query = `
  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`

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

async function createProducts() {
  console.log('[v0] Starting product creation for Seen & Heard Care store...\n')

  for (const product of products) {
    try {
      const response = await fetch(`https://${storeDomain}/admin/api/2026-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: JSON.stringify({
          query,
          variables: {
            input: product,
          },
        }),
      })

      const result = await response.json()

      if (result.errors) {
        console.error(`[v0] Error creating product ${product.title}:`, result.errors)
      } else if (result.data?.productCreate?.userErrors?.length > 0) {
        console.error(
          `[v0] User error creating product ${product.title}:`,
          result.data.productCreate.userErrors
        )
      } else if (result.data?.productCreate?.product) {
        console.log(`[v0] ✓ Created product: ${result.data.productCreate.product.title}`)
        console.log(`   Handle: ${result.data.productCreate.product.handle}\n`)
      } else {
        console.error(`[v0] Unexpected response for ${product.title}:`, result)
      }
    } catch (error) {
      console.error(`[v0] Error creating product ${product.title}:`, error.message)
    }
  }

  console.log('[v0] Product creation complete!')
}

createProducts()
