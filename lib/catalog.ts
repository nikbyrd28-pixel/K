// ============================================================================
//  HUBS & BABYDOLL — YOUR PRODUCT LIST
//  This is the ONLY file you need to touch to change prices, wording, or sizes.
// ============================================================================
//
//  💛  TO CHANGE A PRICE
//      Find the product, then change the number after `price:`.  Save the file.
//        { size: '2 oz', price: 15 }   →   { size: '2 oz', price: 18 }
//
//  💛  TO CHANGE A DESCRIPTION
//      Change the words between the quotes on the `description:` line.
//      Keep the quotes and the comma at the end.
//
//  💛  TO MARK SOMETHING SOLD OUT
//      Add  `, soldOut: true`  after the price:
//        { size: '2 oz', price: 15, soldOut: true }
//
//  💛  TO PUT A LITTLE TAG ON A SIZE (like "Most Popular")
//      Add  `, badge: 'Most Popular'`  after the price.
//
//  💛  TO HIDE A PRODUCT FOR NOW
//      Put two slashes  //  at the front of every one of its lines,
//      or ask your helper to remove it.
//
//  ⚠️  Prices with a  `// GUESS`  note are estimates I filled in for you.
//      Change them to your real price whenever you're ready — the site
//      updates the second you save. Everything else (the cart, the checkout
//      total, the product pages) reads its price straight from here.
// ============================================================================

export type CatalogSize = {
  size: string
  price: number
  soldOut?: boolean
  badge?: string
  stock?: number
}

export type CatalogItem = {
  /** The web-address piece for this product — leave this as it is. */
  handle: string
  name: string
  description: string
  /** Photo file inside /public/products — leave this as it is. */
  image: string
  imageAlt: string
  sizes: CatalogSize[]
}

export const CATALOG: CatalogItem[] = [
  // ---- GIFT BOXES ---------------------------------------------------------
  {
    handle: 'heard-bay-rum-box',
    name: 'HEARD Bay Rum Box',
    description:
      'For the man who carries a lot and rarely asks for anything in return. A curated Bay Rum grooming set — body oil, body butter, body bar, and soft-touch cloths — that says, "I see you. You deserve care, too."',
    image: '/products/pro-heard-bay-rum-set.jpg',
    imageAlt: 'HEARD Bay Rum gift box set by Hubs & Babydoll',
    sizes: [{ size: 'Gift box', price: 50 }],
  },
  {
    handle: 'seen-lavender-box',
    name: 'SEEN Lavender Box',
    description:
      'For the woman who gives so much of herself. A soothing Lavender Rose set — oil, body butter, body wash — a gentle reminder to slow down, breathe, and pour a little love back in.',
    image: '/products/pro-seen-lavender-set.jpg',
    imageAlt: 'SEEN Lavender Rose gift box set by Hubs & Babydoll',
    sizes: [{ size: 'Gift box', price: 40 }],
  },
  {
    handle: 'signature-body-box',
    name: 'Signature Body Box',
    description:
      'Our full-experience gift box — hand-poured oil, whipped body butter, and body wash wrapped together in one keepsake box. A complete moment of care, ready to gift or keep.',
    image: '/products/pro-brand-box.jpg',
    imageAlt: 'Signature Hubs & Babydoll gift box',
    sizes: [{ size: 'Gift box', price: 55, badge: 'Best Gift' }], // GUESS
  },

  // ---- BODY OILS (Harmony line) ------------------------------------------
  {
    handle: 'harmony-bay-rum-body-oil',
    name: 'Harmony Bay Rum Body Oil',
    description:
      'A lightweight blend of jojoba, sweet almond, flaxseed, and castor oils with Vitamin E and warm notes of Bay Rum. Nourishes skin and conditions beards without a greasy finish.',
    image: '/products/oil-bay-rum.png',
    imageAlt: 'Harmony Bay Rum Body Oil by Hubs & Babydoll',
    sizes: [
      { size: '2 oz', price: 15 },
      { size: '4 oz', price: 25 },
    ],
  },
  {
    handle: 'harmony-jasmine-gardenia-body-oil',
    name: 'Harmony Jasmine & Gardenia Body Oil',
    description:
      'The timeless elegance of Jasmine & Gardenia in a blend of jojoba, sweet almond, flaxseed, and castor oils with Vitamin E. Melts in to nourish, soften, and reveal a luminous glow.',
    image: '/products/oil-jasmine-gardenia.jpg',
    imageAlt: 'Harmony Jasmine & Gardenia Body Oil by Hubs & Babydoll',
    sizes: [
      { size: '2 oz', price: 15, badge: 'Most Popular' },
      { size: '4 oz', price: 25 },
    ],
  },
  {
    handle: 'harmony-chocolate-body-oil',
    name: 'Harmony Chocolate Body Oil',
    description:
      'A warm, comforting cocoa-kissed body oil in a blend of jojoba, sweet almond, flaxseed, and castor oils with Vitamin E. Sinks in fast for soft, glowing skin.',
    image: '/products/oil-chocolate.jpg',
    imageAlt: 'Harmony Chocolate Body Oil by Hubs & Babydoll',
    sizes: [
      { size: '2 oz', price: 15 }, // GUESS
      { size: '4 oz', price: 25 }, // GUESS
    ],
  },

  // ---- BODY BUTTERS -------------------------------------------------------
  {
    handle: 'jasmine-gardenia-body-butter',
    name: 'Jasmine & Gardenia Body Butter',
    description:
      'Curated shea, mango, and coco butters with jojoba, sweet almond, flaxseed, and castor oils, Vitamin E, and notes of Jasmine & Gardenia. Rich hydration with a balanced, non-greasy finish.',
    image: '/products/butter-jasmine-gardenia.jpg',
    imageAlt: 'Jasmine & Gardenia Body Butter by Hubs & Babydoll',
    sizes: [
      { size: '4 oz', price: 20 }, // GUESS
      { size: '8 oz', price: 35 }, // GUESS
    ],
  },
  {
    handle: 'lavender-rose-body-butter',
    name: 'Lavender Rose Body Butter',
    description:
      'Curated shea, mango, and coco butters with jojoba, sweet almond, flaxseed, and castor oils, Vitamin E, and notes of Lavender & Rose. Calming, romantic, deeply nourishing.',
    image: '/products/butter-lavender-rose.jpg',
    imageAlt: 'Lavender Rose Body Butter by Hubs & Babydoll',
    sizes: [
      { size: '4 oz', price: 20 }, // GUESS
      { size: '8 oz', price: 35 }, // GUESS
    ],
  },
  {
    handle: 'chocolate-body-butter',
    name: 'Chocolate Body Butter',
    description:
      'A rich, cocoa-warm whip of shea, mango, and coco butters with nourishing oils and Vitamin E. Deeply moisturizing with a cozy, comforting scent.',
    image: '/products/butter-chocolate.jpg',
    imageAlt: 'Chocolate Body Butter by Hubs & Babydoll',
    sizes: [
      { size: '4 oz', price: 20 }, // GUESS
      { size: '8 oz', price: 35 }, // GUESS
    ],
  },
  {
    handle: 'peppermint-body-butter',
    name: 'Peppermint Body Butter',
    description:
      'A cool, refreshing whip of shea, mango, and coco butters with nourishing oils and Vitamin E. Uplifting peppermint that leaves skin soft and awake.',
    image: '/products/butter-peppermint.jpg',
    imageAlt: 'Peppermint Body Butter by Hubs & Babydoll',
    sizes: [
      { size: '4 oz', price: 20 }, // GUESS
      { size: '8 oz', price: 35 }, // GUESS
    ],
  },

  // ---- BODY WASH ----------------------------------------------------------
  {
    handle: 'jasmine-gardenia-body-wash',
    name: 'Jasmine & Gardenia Body Wash',
    description:
      'A gentle, sulfate-free body wash with notes of Jasmine & Gardenia. Cleanses without stripping and leaves skin soft, fresh, and lightly scented.',
    image: '/products/wash-jasmine-gardenia.jpg',
    imageAlt: 'Jasmine & Gardenia Body Wash by Hubs & Babydoll',
    sizes: [{ size: '8 oz', price: 18 }], // GUESS
  },
  {
    handle: 'lavender-rose-body-wash',
    name: 'Lavender Rose Body Wash',
    description:
      'A gentle, sulfate-free body wash with calming notes of Lavender & Rose. Cleanses softly and leaves skin nourished and lightly scented.',
    image: '/products/wash-lavender-rose.jpg',
    imageAlt: 'Lavender Rose Body Wash by Hubs & Babydoll',
    sizes: [{ size: '8 oz', price: 18 }], // GUESS
  },

  // ---- BEARD CARE ---------------------------------------------------------
  {
    handle: 'heard-bay-rum-beard-set',
    name: 'HEARD Bay Rum Beard Set',
    description:
      'The complete Bay Rum beard grooming set — beard wash, beard oil, and beard balm — with Moroccan argan, jojoba, sweet almond, pumpkin seed, and castor oils, Vitamin E, and warm notes of Bay Rum.',
    image: '/products/pro-bay-rum-beard-set.jpg',
    imageAlt: 'HEARD Bay Rum beard care gift set by Hubs & Babydoll',
    sizes: [{ size: 'Full set', price: 45 }], // GUESS
  },
  {
    handle: 'bay-rum-beard-oil',
    name: 'Bay Rum Beard Oil',
    description:
      'Jojoba, sweet almond, castor, rosemary, flax, and pumpkin seed oils with Vitamin E and notes of Bay Rum. Softens the beard and conditions the skin beneath.',
    image: '/products/pro-bay-rum-beard-oil.jpg',
    imageAlt: 'Bay Rum Beard Oil by Hubs & Babydoll',
    sizes: [{ size: '2 oz', price: 18 }], // GUESS
  },
  {
    handle: 'bay-rum-beard-balm',
    name: 'Bay Rum Beard Balm',
    description:
      'Shea, mango, and coco butters with beeswax, argan, jojoba, sweet almond, castor, rosemary, and pumpkin seed oils, Vitamin E, and notes of Bay Rum. Tames, shapes, and conditions.',
    image: '/products/pro-bay-rum-beard-balm.jpg',
    imageAlt: 'Bay Rum Beard Balm by Hubs & Babydoll',
    sizes: [{ size: '2 oz', price: 16 }], // GUESS
  },
  {
    handle: 'bay-rum-beard-conditioner',
    name: 'Bay Rum Beard Conditioner',
    description:
      'A softening beard conditioner with argan, jojoba, and pumpkin seed oils and Vitamin E, scented with warm Bay Rum. Detangles, hydrates, and leaves the beard touchably soft.',
    image: '/products/beard-conditioner-bay-rum.jpg',
    imageAlt: 'Bay Rum Beard Conditioner by Hubs & Babydoll',
    sizes: [{ size: '4 oz', price: 18 }], // GUESS
  },
]

// ============================================================================
//  The list above is the built-in "safety net." The owner can also edit prices,
//  swap photos, hide products, and add new ones from the Studio page (/admin) —
//  those live edits are saved in the backend and layered on top of this list.
//  mergeCatalog() combines the two so the site always has something to show.
// ============================================================================

/** A product row as saved by the Studio (backend table hb_products). */
export type ProductRow = {
  handle: string
  name: string
  description: string
  image: string
  sizes: CatalogSize[]
  sort: number
  active: boolean
}

export type EffectiveItem = CatalogItem & { active: boolean; sort: number }

/** Layer the owner's saved edits (rows) on top of the built-in CATALOG. */
export function mergeCatalog(rows: ProductRow[] = []): EffectiveItem[] {
  const byHandle = new Map(rows.map((r) => [r.handle, r]))
  const seen = new Set<string>()

  const base: EffectiveItem[] = CATALOG.map((item, i) => {
    seen.add(item.handle)
    const r = byHandle.get(item.handle)
    if (!r) return { ...item, active: true, sort: i }
    return {
      handle: item.handle,
      name: r.name || item.name,
      description: r.description ?? item.description,
      image: r.image || item.image,
      imageAlt: item.imageAlt || r.name || item.name,
      sizes: Array.isArray(r.sizes) && r.sizes.length ? r.sizes : item.sizes,
      active: r.active !== false,
      sort: Number.isFinite(r.sort) ? r.sort : i,
    }
  })

  // Brand-new products the owner added in the Studio (not in the built-in list).
  const extras: EffectiveItem[] = rows
    .filter((r) => !seen.has(r.handle))
    .map((r, j) => ({
      handle: r.handle,
      name: r.name,
      description: r.description,
      image: r.image,
      imageAlt: r.name,
      sizes: Array.isArray(r.sizes) ? r.sizes : [],
      active: r.active !== false,
      sort: Number.isFinite(r.sort) ? r.sort : 100 + j,
    }))

  return [...base, ...extras].sort((a, b) => a.sort - b.sort)
}
