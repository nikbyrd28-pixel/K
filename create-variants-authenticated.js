#!/usr/bin/env node

/**
 * Creates product variants using Shopify Admin API
 */

const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || 'hubsandbabydoll.myshopify.com'
const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN

// Fallback: try to get from .env file
if (!accessToken) {
  console.error('❌ ERROR: SHOPIFY_ADMIN_ACCESS_TOKEN not found in environment')
  process.exit(1)
}

const products = [
  {
    handle: 'harmony-bay-rum-body-oil',
    gid: 'gid://shopify/Product/8305851801883',
    variants: [
      { title: '2 oz bottle', price: '15.00', sku: 'BAY-RUM-2OZ' },
      { title: '4 oz bottle', price: '25.00', sku: 'BAY-RUM-4OZ' },
    ],
  },
  {
    handle: 'moment-body-butter',
    gid: 'gid://shopify/Product/8305854382235',
    variants: [
      { title: '2 oz', price: '10.00', sku: 'MOMENT-2OZ' },
      { title: '4 oz', price: '20.00', sku: 'MOMENT-4OZ' },
    ],
  },
  {
    handle: 'harmony-jasmine-gardenia-body-oil',
    gid: 'gid://shopify/Product/8305856373003',
    variants: [
      { title: '2 oz bottle', price: '15.00', sku: 'JASMINE-2OZ' },
      { title: '4 oz bottle', price: '25.00', sku: 'JASMINE-4OZ' },
    ],
  },
  {
    handle: 'jasmine-gardenia-8-oz-body-box',
    gid: 'gid://shopify/Product/8305857916043',
    variants: [
      { title: '2 oz box', price: '40.00', sku: 'JASMINE-BOX-2OZ', badge: 'Most Popular' },
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
      const url = `https://${shopifyDomain}/admin/api/2026-07/graphql.json`
      console.log(`\n   Calling: ${url}`)
      console.log(`   Token length: ${accessToken.length}`)
      console.log(`   Token type: ${accessToken.substring(0, 10)}...`)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: mutation, variables }),
      })

      const data = await response.json()

      console.log(`   Response status: ${response.status}`)
      console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200))

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
      } else if (data.data?.productVariantsBulkCreate?.productVariants) {
        const variants = data.data.productVariantsBulkCreate.productVariants
        console.log(`✅ SUCCESS (${variants.length} variants)`)
        variants.forEach((v) => {
          console.log(`   📍 ${v.title}: $${v.price} (${v.sku})`)
        })
        successCount++
      } else {
        console.log('❌ FAILED - No variant data in response')
        console.log(`   Response:`, JSON.stringify(data))
        errorCount++
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
