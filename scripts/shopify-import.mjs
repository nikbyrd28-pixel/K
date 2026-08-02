/**
 * One-click Shopify product importer for Hubs & Babydoll.
 *
 * Runs in GitHub Actions (which can reach Shopify), NOT locally.
 * Requires two repo secrets:
 *   SHOPIFY_STORE_DOMAIN        e.g. hubs-babydoll.myshopify.com
 *   SHOPIFY_ADMIN_TOKEN         Admin API access token, starts with shpat_ (needs write_products)
 *
 * Creates all products below (with sizes, prices, and photos pulled from this
 * repo), then publishes them to every sales channel so the Storefront API
 * (and the live site) can see them. Safe to re-run: it upserts by handle.
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN
const API = '2024-10'

if (!DOMAIN || !TOKEN) {
  console.error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_TOKEN. Add them under Settings → Secrets and variables → Actions.')
  process.exit(1)
}
if (!TOKEN.startsWith('shpat_')) {
  console.error(`SHOPIFY_ADMIN_TOKEN should start with "shpat_" (an Admin API access token). Got a token starting with "${TOKEN.slice(0, 6)}…". Use the Admin API access token, not the API key or API secret key.`)
  process.exit(1)
}

const host = DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '')
const ENDPOINT = `https://${host}/admin/api/${API}/graphql.json`
const IMG = 'https://raw.githubusercontent.com/nikbyrd28-pixel/K/main/public/products/'

// Beard-care prices (45/15/12) are estimates — change here if needed.
const PRODUCTS = [
  {
    handle: 'bay-rum-8-oz-body-box', title: 'HEARD Bay Rum Box', type: 'Gift Set',
    img: 'pro-heard-bay-rum-set.jpg',
    desc: 'For the man who carries a lot and rarely asks for anything in return. A curated Bay Rum grooming set — body oil, body butter, body bar, and soft-touch cloths — that says, “I see you. You deserve care, too.”',
    variants: [{ price: '50.00' }],
  },
  {
    handle: 'lavender-4-oz-body-box-inside', title: 'SEEN Lavender Box', type: 'Gift Set',
    img: 'pro-seen-lavender-set.jpg',
    desc: 'For the woman who gives so much of herself. A soothing Lavender Rose set — oil, body butter, body wash — a gentle reminder to slow down, breathe, and pour a little love back in.',
    variants: [{ price: '40.00' }],
  },
  {
    handle: 'harmony-bay-rum-body-oil', title: 'Harmony Bay Rum Body Oil', type: 'Body Oil',
    img: 'oil-bay-rum.png', option: 'Size',
    desc: 'A lightweight blend of jojoba, sweet almond, flaxseed, and castor oils with Vitamin E and notes of Bay Rum. Nourishes skin and conditions beards without a greasy finish.',
    variants: [{ opt: '2 oz', price: '15.00' }, { opt: '4 oz', price: '25.00' }],
  },
  {
    handle: 'harmony-jasmine-gardenia-body-oil', title: 'Harmony Jasmine & Gardenia Body Oil', type: 'Body Oil',
    img: 'oil-jasmine-gardenia.jpg', option: 'Size',
    desc: 'The timeless elegance of Jasmine & Gardenia in a blend of jojoba, sweet almond, flaxseed, and castor oils with Vitamin E. Melts in to nourish, soften, and reveal a luminous glow.',
    variants: [{ opt: '2 oz', price: '15.00' }, { opt: '4 oz', price: '25.00' }],
  },
  {
    handle: 'seen-jasmine-gardenia-body-butter', title: 'SEEN Jasmine & Gardenia Body Butter', type: 'Body Butter',
    img: 'butter-jasmine-gardenia.jpg', option: 'Size',
    desc: 'Curated shea, mango, and coco butters with jojoba, sweet almond, flaxseed, and castor oils, Vitamin E, and notes of Jasmine & Gardenia. Rich hydration with a balanced, non-greasy finish.',
    variants: [{ opt: '4 oz', price: '10.00' }, { opt: '8 oz', price: '20.00' }],
  },
  {
    handle: 'seen-lavender-rose-body-butter', title: 'SEEN Lavender Rose Body Butter', type: 'Body Butter',
    img: 'butter-lavender-rose.jpg', option: 'Size',
    desc: 'Curated shea, mango, and coco butters with jojoba, sweet almond, flaxseed, and castor oils, Vitamin E, and notes of Lavender & Rose. Calming, romantic, deeply nourishing.',
    variants: [{ opt: '4 oz', price: '10.00' }, { opt: '8 oz', price: '20.00' }],
  },
  {
    handle: 'heard-bay-rum-beard-set', title: 'HEARD Bay Rum Beard Set', type: 'Beard Care',
    img: 'pro-bay-rum-beard-set.jpg',
    desc: 'The complete Bay Rum beard grooming set — beard wash, beard oil, and beard balm — with Moroccan argan, jojoba, sweet almond, pumpkin seed, and castor oils, Vitamin E, and warm notes of Bay Rum.',
    variants: [{ price: '45.00' }],
  },
  {
    handle: 'bay-rum-beard-oil', title: 'Bay Rum Beard Oil', type: 'Beard Care',
    img: 'pro-bay-rum-beard-oil.jpg',
    desc: 'Jojoba, sweet almond, castor, rosemary, flax, and pumpkin seed oils with Vitamin E and notes of Bay Rum. Softens the beard and conditions the skin beneath.',
    variants: [{ price: '15.00' }],
  },
  {
    handle: 'bay-rum-beard-balm', title: 'Bay Rum Beard Balm', type: 'Beard Care',
    img: 'pro-bay-rum-beard-balm.jpg',
    desc: 'Shea, mango, and coco butters with beeswax, argan, jojoba, sweet almond, castor, rosemary, and pumpkin seed oils, Vitamin E, and notes of Bay Rum. Tames, shapes, and conditions.',
    variants: [{ price: '12.00' }],
  },
]

async function gql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (!res.ok || json.errors) {
    throw new Error(`Shopify API error (${res.status}): ${JSON.stringify(json.errors || json)}`)
  }
  return json.data
}

const PRODUCT_SET = `
  mutation ProductSet($input: ProductSetInput!) {
    productSet(synchronous: true, input: $input) {
      product { id title handle }
      userErrors { field message }
    }
  }`

const PUBLISH = `
  mutation Publish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }`

function buildInput(p) {
  const input = {
    title: p.title,
    handle: p.handle,
    descriptionHtml: p.desc,
    productType: p.type,
    vendor: 'Hubs & Babydoll',
    status: 'ACTIVE',
    files: [{ originalSource: IMG + p.img, contentType: 'IMAGE', alt: p.title }],
  }
  if (p.option) {
    input.productOptions = [{ name: p.option, position: 1, values: p.variants.map((v) => ({ name: v.opt })) }]
    input.variants = p.variants.map((v) => ({
      optionValues: [{ optionName: p.option, name: v.opt }],
      price: v.price,
    }))
  } else {
    input.variants = [{ price: p.variants[0].price }]
  }
  return input
}

async function main() {
  console.log(`Importing ${PRODUCTS.length} products into ${host} …`)

  // Discover sales channels so products become visible to the Storefront API.
  const pubData = await gql(`{ publications(first: 25) { edges { node { id name } } } }`)
  const publications = pubData.publications.edges.map((e) => e.node)
  console.log(`Publishing to channels: ${publications.map((p) => p.name).join(', ') || '(none found)'}`)

  let ok = 0
  for (const p of PRODUCTS) {
    try {
      const data = await gql(PRODUCT_SET, { input: buildInput(p) })
      const errs = data.productSet.userErrors
      if (errs && errs.length) {
        console.error(`✗ ${p.title}: ${errs.map((e) => e.message).join('; ')}`)
        continue
      }
      const product = data.productSet.product
      if (publications.length) {
        await gql(PUBLISH, { id: product.id, input: publications.map((pub) => ({ publicationId: pub.id })) })
      }
      console.log(`✓ ${p.title}  (${product.handle})`)
      ok++
    } catch (err) {
      console.error(`✗ ${p.title}: ${err.message}`)
    }
  }

  console.log(`\nDone — ${ok}/${PRODUCTS.length} products created/updated and published.`)
  if (ok < PRODUCTS.length) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
