#!/usr/bin/env node

/**
 * Creates product variants for Hubs & Babydoll products
 * This script needs to be run with Shopify integration configured
 */

const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN
const accessToken = process.env.SHOPIFY_ADMIN_API_TOKEN

if (!shopifyDomain || !accessToken) {
  console.error('Error: SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_TOKEN environment variables are required')
  process.exit(1)
}

const products = [
  {
    handle: 'harmony-bay-rum-body-oil',
    gid: 'gid://shopify/Product/44219823162891',
    variants: [
      { title: '2 oz bottle', price: '15.00', sku: 'BAY-RUM-2OZ' },
      { title: '4 oz bottle', price: '25.00', sku: 'BAY-RUM-4OZ' },
    ],
  },
  {
    handle: 'moment-body-butter',
    gid: 'gid://shopify/Product/44219823294891',
    variants: [
      { title: '2 oz', price: '10.00', sku: 'MOMENT-2OZ' },
      { title: '4 oz', price: '20.00', sku: 'MOMENT-4OZ' },
    ],
  },
  {
    handle: 'harmony-jasmine-gardenia-body-oil',
    gid: 'gid://shopify/Product/44219823426891',
    variants: [
      { title: '2 oz bottle', price: '15.00', sku: 'JASMINE-2OZ' },
      { title: '4 oz bottle', price: '25.00', sku: 'JASMINE-4OZ' },
    ],
  },
  {
    handle: 'jasmine-gardenia-8-oz-body-box',
    gid: 'gid://shopify/Product/44219823558891',
    variants: [
      { title: '2 oz box', price: '40.00', sku: 'JASMINE-BOX-2OZ' },
      { title: '4 oz box', price: '55.00', sku: 'JASMINE-BOX-4OZ' },
    ],
  },
]

async function createVariants() {
  for (const product of products) {
    console.log(`\nCreating variants for ${product.handle}...`)

    const variantInputs = product.variants.map((v) => ({
      price: v.price,
      sku: v.sku,
      title: v.title,
    }))

    const mutation = `
      mutation CreateVariants($productId: ID!, $variants: [ProductVariantInput!]!) {
        productVariantsBulkCreate(productId: $productId, variants: $variants) {
          productVariants {
            id
            title
            price
            sku
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      productId: product.gid,
      variants: variantInputs,
    }

    try {
      const response = await fetch(`https://${shopifyDomain}/admin/api/2026-07/graphql.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: mutation, variables }),
      })

      const data = await response.json()

      if (data.errors) {
        console.error(`Error for ${product.handle}:`, data.errors)
      } else if (data.data.productVariantsBulkCreate.userErrors.length > 0) {
        console.error(`User errors for ${product.handle}:`, data.data.productVariantsBulkCreate.userErrors)
      } else {
        console.log(`✓ Created ${data.data.productVariantsBulkCreate.productVariants.length} variants`)
        data.data.productVariantsBulkCreate.productVariants.forEach((v) => {
          console.log(`  - ${v.title}: $${v.price} (${v.sku}) [${v.id}]`)
        })
      }
    } catch (error) {
      console.error(`Error creating variants for ${product.handle}:`, error.message)
    }
  }
}

createVariants()
