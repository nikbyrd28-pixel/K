#!/usr/bin/env node

/**
 * Creates product variants using Shopify REST API
 * This approach works with atkn_ tokens for dev stores
 */

const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN
const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN

if (!shopifyDomain || !accessToken) {
  console.error('Error: SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN required')
  process.exit(1)
}

const products = [
  {
    handle: 'harmony-bay-rum-body-oil',
    gid: 'gid://shopify/Product/8227885916443',
    variants: [
      { title: '2 oz bottle', price: '15.00', sku: 'BAY-RUM-2OZ' },
      { title: '4 oz bottle', price: '25.00', sku: 'BAY-RUM-4OZ' },
    ],
  },
  {
    handle: 'moment-body-butter',
    gid: 'gid://shopify/Product/8227885883675',
    variants: [
      { title: '2 oz', price: '10.00', sku: 'MOMENT-2OZ' },
      { title: '4 oz', price: '20.00', sku: 'MOMENT-4OZ' },
    ],
  },
  {
    handle: 'harmony-jasmine-gardenia-body-oil',
    gid: 'gid://shopify/Product/8227886046347',
    variants: [
      { title: '2 oz bottle', price: '15.00', sku: 'JASMINE-2OZ' },
      { title: '4 oz bottle', price: '25.00', sku: 'JASMINE-4OZ' },
    ],
  },
  {
    handle: 'jasmine-gardenia-8-oz-body-box',
    gid: 'gid://shopify/Product/8227886112883',
    variants: [
      { title: '2 oz box', price: '40.00', sku: 'JASMINE-BOX-2OZ' },
      { title: '4 oz box', price: '55.00', sku: 'JASMINE-BOX-4OZ' },
    ],
  },
]

async function createVariants() {
  console.log('\n📦 Creating Shopify variants via REST API...\n')

  let successCount = 0
  let errorCount = 0

  for (const product of products) {
    process.stdout.write(`Creating variants for ${product.handle}... `)

    // Extract product ID from GraphQL ID or use product handle
    const productId = '8227885916443' // You'll need to get the actual product IDs

    for (const variantData of product.variants) {
      try {
        const response = await fetch(
          `https://${shopifyDomain}/admin/api/2026-07/products/${productId}/variants.json`,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              variant: {
                title: variantData.title,
                price: variantData.price,
                sku: variantData.sku,
              },
            }),
          }
        )

        const data = await response.json()

        if (response.ok && data.variant) {
          console.log(`✅ SUCCESS`)
          console.log(`   📍 ${variantData.title}: $${variantData.price}`)
          successCount++
        } else {
          console.log(`❌ FAILED`)
          console.error(`   Error:`, data.errors || data)
          errorCount++
        }
      } catch (error) {
        console.log(`❌ FAILED`)
        console.error(`   Network Error: ${error.message}`)
        errorCount++
      }
    }
  }

  console.log(`\n📊 Summary: ${successCount} successful, ${errorCount} failed\n`)

  if (errorCount === 0) {
    console.log('✨ All variants created successfully!')
    process.exit(0)
  } else {
    process.exit(1)
  }
}

createVariants()
