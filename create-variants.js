#!/usr/bin/env node

/**
 * Creates product variants for Hubs & Babydoll products
 * 
 * This script creates proper size variants (2oz, 4oz, etc.) in Shopify
 * to fix the checkout pricing issue where different sizes were being merged.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Get your Shopify Admin API token from https://admin.shopify.com/settings/apps-and-integrations/develop-apps
 * 2. Create a custom app or use an existing one with these scopes:
 *    - write_products
 *    - read_products
 * 3. Copy the Admin API access token
 * 4. Run this script with:
 *    SHOPIFY_STORE_DOMAIN="your-store.myshopify.com" \
 *    SHOPIFY_ADMIN_API_TOKEN="your-access-token" \
 *    node create-variants.js
 */

const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN
const accessToken = process.env.SHOPIFY_ADMIN_API_TOKEN

if (!shopifyDomain || !accessToken) {
  console.error('\n❌ ERROR: Missing required environment variables\n')
  console.error('Usage:')
  console.error('  SHOPIFY_STORE_DOMAIN="your-store.myshopify.com" \\')
  console.error('  SHOPIFY_ADMIN_API_TOKEN="your-access-token" \\')
  console.error('  node create-variants.js\n')
  console.error('Instructions:')
  console.error('  1. Go to https://admin.shopify.com/settings/apps-and-integrations/develop-apps')
  console.error('  2. Create a custom app with "write_products" and "read_products" scopes')
  console.error('  3. Copy the "Admin API access token" and use it above\n')
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
  console.log('\n📦 Starting Shopify variant creation...\n')

  let successCount = 0
  let errorCount = 0

  for (const product of products) {
    process.stdout.write(`Creating variants for ${product.handle}... `)

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
        console.log('❌ FAILED')
        console.error(`   GraphQL Error:`, data.errors)
        errorCount++
      } else if (data.data?.productVariantsBulkCreate?.userErrors?.length > 0) {
        console.log('❌ FAILED')
        const errors = data.data.productVariantsBulkCreate.userErrors
        errors.forEach((err) => {
          console.error(`   ${err.field}: ${err.message}`)
        })
        errorCount++
      } else {
        const variants = data.data?.productVariantsBulkCreate?.productVariants || []
        console.log(`✅ SUCCESS (${variants.length} variants)`)
        variants.forEach((v) => {
          console.log(`   📍 ${v.title}: $${v.price} (${v.sku})`)
        })
        successCount++
      }
    } catch (error) {
      console.log('❌ FAILED')
      console.error(`   Network Error: ${error.message}`)
      errorCount++
    }
  }

  console.log(`\n📊 Summary: ${successCount} successful, ${errorCount} failed\n`)

  if (successCount === products.length) {
    console.log('✨ All variants created successfully!')
    console.log('🎉 Checkout pricing should now work correctly with different sizes!\n')
    process.exit(0)
  } else if (errorCount > 0) {
    console.log('⚠️  Some variants failed. Please check the errors above.\n')
    process.exit(1)
  }
}

createVariants()
