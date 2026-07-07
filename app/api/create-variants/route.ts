import { NextRequest, NextResponse } from 'next/server'

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN

// Product data to create variants for
const productsToUpdate = [
  {
    handle: 'harmony-bay-rum-body-oil',
    productId: 'gid://shopify/Product/7656906833019',
    variants: [
      { title: '2 oz bottle', price: '15.00', sku: 'BAY-RUM-2OZ' },
      { title: '4 oz bottle', price: '25.00', sku: 'BAY-RUM-4OZ' },
    ],
  },
  {
    handle: 'moment-body-butter',
    productId: 'gid://shopify/Product/7656908185627',
    variants: [
      { title: '2 oz', price: '10.00', sku: 'MOMENT-2OZ' },
      { title: '4 oz', price: '20.00', sku: 'MOMENT-4OZ' },
    ],
  },
  {
    handle: 'harmony-jasmine-gardenia-body-oil',
    productId: 'gid://shopify/Product/7656908741707',
    variants: [
      { title: '2 oz bottle', price: '15.00', sku: 'JASMINE-2OZ' },
      { title: '4 oz bottle', price: '25.00', sku: 'JASMINE-4OZ' },
    ],
  },
  {
    handle: 'jasmine-gardenia-8-oz-body-box',
    productId: 'gid://shopify/Product/7656909299867',
    variants: [
      { title: '2 oz box', price: '40.00', sku: 'JASMINE-BOX-2OZ', metafields: [{ namespace: 'custom', key: 'popular', value: 'true', type: 'string' }] },
      { title: '4 oz box', price: '55.00', sku: 'JASMINE-BOX-4OZ' },
    ],
  },
]

export async function POST(request: NextRequest) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Missing Shopify configuration' },
      { status: 500 }
    )
  }

  console.log('[v0] Starting variant creation...')
  const results = []

  for (const product of productsToUpdate) {
    try {
      const query = `
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
        productId: product.productId,
        variants: product.variants.map((v: any) => ({
          title: v.title,
          price: v.price,
          sku: v.sku,
          ...(v.metafields && { metafields: v.metafields }),
        })),
      }

      console.log(`[v0] Creating variants for ${product.handle}...`)

      const response = await fetch(
        `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2026-07/graphql.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, variables }),
        }
      )

      const data = await response.json()

      if (data.errors) {
        console.error(`[v0] GraphQL error for ${product.handle}:`, data.errors)
        results.push({
          handle: product.handle,
          success: false,
          error: data.errors[0]?.message,
          fullError: JSON.stringify(data.errors),
        })
      } else if (data.data?.productVariantsBulkCreate?.userErrors?.length > 0) {
        console.error(`[v0] User errors for ${product.handle}:`, data.data.productVariantsBulkCreate.userErrors)
        results.push({
          handle: product.handle,
          success: false,
          error: data.data.productVariantsBulkCreate.userErrors[0]?.message,
          fullError: JSON.stringify(data.data.productVariantsBulkCreate.userErrors),
        })
      } else {
        const variants = data.data?.productVariantsBulkCreate?.productVariants || []
        console.log(`[v0] Successfully created ${variants.length} variants for ${product.handle}`)
        results.push({
          handle: product.handle,
          success: true,
          variantCount: variants.length,
          variants: variants.map((v: any) => ({ title: v.title, price: v.price, sku: v.sku })),
        })
      }
    } catch (error: any) {
      console.error(`[v0] Error for ${product.handle}:`, error.message)
      results.push({
        handle: product.handle,
        success: false,
        error: error.message,
      })
    }
  }

  return NextResponse.json({ results })
}
