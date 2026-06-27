export type Size = { label: string; price: number; soldOut?: boolean; badge?: string }

export type Merch = {
  order: number
  name: string
  description: string
  sizes: Size[]
  ingredients?: string
}

// Curated merchandising (names, short copy, ounce pricing, badges, order) keyed by
// the stable Shopify product handle. Images + variant IDs still come live from Shopify.
export const MERCHANDISING: Record<string, Merch> = {
  'bay-rum-8-oz-body-box': {
    order: 1,
    name: 'HEARD Bay Rum Box',
    description:
      'The HEARD Gift Box is a curated grooming routine that says, “I hear you. You deserve care, too.”',
    sizes: [
      { label: '4 oz box', price: 35, soldOut: true },
      { label: '8 oz box', price: 50 },
    ],
  },
  'harmony-bay-rum-body-oil': {
    order: 2,
    name: 'Harmony Bay Rum Body Oil',
    description: 'His lightweight blend of essential oils and Vitamin E with notes of Bay Rum.',
    sizes: [
      { label: '4 oz bottle', price: 10 },
      { label: '8 oz box', price: 20 },
    ],
  },
  'moment-body-butter': {
    order: 3,
    name: 'Moment Body Butter',
    description: 'Pure nourishment. No fragrance. No fuss.',
    sizes: [
      { label: '4 oz', price: 10 },
      { label: '8 oz', price: 20 },
    ],
  },
  'jasmine-gardenia-8-oz-body-box': {
    order: 4,
    name: 'SEEN Jasmine & Gardenia Box',
    description:
      'The SEEN Gift Box is a wellness routine that says, “I see you. You deserve care, too.”',
    sizes: [
      { label: '4 oz box', price: 40, badge: 'Most Popular' },
      { label: '8 oz box', price: 55 },
    ],
  },
  'harmony-jasmine-gardenia-body-oil': {
    order: 5,
    name: 'Harmony Jasmine Gardenia Body Oil',
    description:
      'Her delicate blend of essential oils and Vitamin E with notes of Jasmine and Gardenia.',
    sizes: [
      { label: '4 oz bottle', price: 15 },
      { label: '8 oz box', price: 25 },
    ],
  },
  'lavender-4-oz-body-box-inside': {
    order: 6,
    name: 'SEEN Lavender Box',
    description:
      'A gentle reminder to slow down, breathe deeply, and pour a little of that love back in.',
    sizes: [
      { label: '4 oz box', price: 35 },
      { label: '8 oz box', price: 0, soldOut: true },
    ],
  },
}

export interface ProductLike {
  handle: string
  title: string
  description: string
  price: string
}

// Resolve the display name, description, and purchasable sizes for a product,
// falling back to the live Shopify values when no curated entry exists.
export function getMerch(product: ProductLike) {
  const merch = MERCHANDISING[product.handle]
  const sizes: Size[] =
    merch?.sizes ?? [{ label: 'One size', price: parseFloat(product.price) || 0 }]
  return {
    name: merch?.name ?? product.title,
    description: merch?.description ?? product.description,
    sizes,
    order: merch?.order ?? 99,
    badge: sizes.find((s) => s.badge)?.badge,
    allSoldOut: sizes.every((s) => s.soldOut),
    fromPrice: Math.min(...sizes.filter((s) => !s.soldOut).map((s) => s.price)),
  }
}
