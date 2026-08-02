import useSWR from 'swr'

export interface Product {
  id: string
  handle: string
  title: string
  description: string
  image: string
  imageAlt: string
  price: string
  variantId: string
  variants: ProductVariant[]
}

export interface ProductVariant {
  id: string
  title: string
  price: string
  currencyCode: string
  availableForSale: boolean
  selectedOptions: Array<{ name: string; value: string }>
}

interface ShopifyProduct {
  id: string
  handle: string
  title: string
  description: string
  images: {
    edges: Array<{
      node: {
        url: string
        altText: string | null
      }
    }>
  }
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        availableForSale: boolean
        selectedOptions: Array<{
          name: string
          value: string
        }>
        price: {
          amount: string
          currencyCode: string
        }
      }
    }>
  }
}

interface ApiResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct
    }>
  }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Words that should stay lowercase in titles (unless first word)
const MINOR_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with'])
// Units that have conventional casing
const UNIT_OVERRIDES: Record<string, string> = { oz: 'oz', ml: 'ml', g: 'g' }

function toTitleCase(input: string): string {
  if (!input) return input
  const words = input.trim().toLowerCase().split(/\s+/)
  return words
    .map((word, i) => {
      // Preserve ampersands and standalone symbols
      if (word === '&') return '&'
      // Keep units lowercase (e.g. 4oz, oz)
      if (UNIT_OVERRIDES[word]) return UNIT_OVERRIDES[word]
      // Words containing digits (e.g. "4oz", "8oz") keep digits, lowercase unit
      if (/\d/.test(word)) return word
      // Minor words stay lowercase unless first word
      if (i !== 0 && MINOR_WORDS.has(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

// Fallback products shown when Shopify isn't connected. These use Hubs & Babydoll's
// real product photos, names, and pricing so the demo mirrors the actual catalog.
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'gid://shopify/Product/1',
    handle: 'bay-rum-8-oz-body-box',
    title: 'HEARD Bay Rum Box',
    description:
      'For the man who carries a lot and rarely asks for anything in return. A curated Bay Rum grooming set — body oil, body butter, body bar, and soft-touch cloths — that says, "I see you. You deserve care, too."',
    image: '/products/pro-heard-bay-rum-set.jpg',
    imageAlt: 'HEARD Bay Rum gift box set by Hubs & Babydoll',
    price: '50.00',
    variantId: 'gid://shopify/ProductVariant/1',
    variants: [],
  },
  {
    id: 'gid://shopify/Product/2',
    handle: 'lavender-4-oz-body-box-inside',
    title: 'SEEN Lavender Box',
    description:
      'For the woman who gives so much of herself. A soothing Lavender Rose set — oil, body butter, body wash — a gentle reminder to slow down, breathe, and pour a little love back in.',
    image: '/products/pro-seen-lavender-set.jpg',
    imageAlt: 'SEEN Lavender Rose gift box set by Hubs & Babydoll',
    price: '40.00',
    variantId: 'gid://shopify/ProductVariant/2',
    variants: [],
  },
  {
    id: 'gid://shopify/Product/3',
    handle: 'harmony-bay-rum-body-oil',
    title: 'Harmony Bay Rum Body Oil',
    description:
      'A lightweight blend of jojoba, sweet almond, flaxseed, and castor oils with Vitamin E and notes of Bay Rum. Nourishes skin and conditions beards without a greasy finish.',
    image: '/products/oil-bay-rum.png',
    imageAlt: 'Harmony Bay Rum Body Oil by Hubs & Babydoll',
    price: '15.00',
    variantId: 'gid://shopify/ProductVariant/3',
    variants: [],
  },
  {
    id: 'gid://shopify/Product/4',
    handle: 'harmony-jasmine-gardenia-body-oil',
    title: 'Harmony Jasmine & Gardenia Body Oil',
    description:
      'The timeless elegance of Jasmine & Gardenia in a blend of jojoba, sweet almond, flaxseed, and castor oils with Vitamin E. Melts in to nourish, soften, and reveal a luminous glow.',
    image: '/products/oil-jasmine-gardenia.jpg',
    imageAlt: 'Harmony Jasmine & Gardenia Body Oil by Hubs & Babydoll',
    price: '15.00',
    variantId: 'gid://shopify/ProductVariant/4',
    variants: [],
  },
  {
    id: 'gid://shopify/Product/5',
    handle: 'seen-jasmine-gardenia-body-butter',
    title: 'SEEN Jasmine & Gardenia Body Butter',
    description:
      'Curated shea, mango, and coco butters with jojoba, sweet almond, flaxseed, and castor oils, Vitamin E, and notes of Jasmine & Gardenia. Rich hydration with a balanced, non-greasy finish.',
    image: '/products/butter-jasmine-gardenia.jpg',
    imageAlt: 'SEEN Jasmine & Gardenia Body Butter by Hubs & Babydoll',
    price: '10.00',
    variantId: 'gid://shopify/ProductVariant/5',
    variants: [],
  },
  {
    id: 'gid://shopify/Product/6',
    handle: 'seen-lavender-rose-body-butter',
    title: 'SEEN Lavender Rose Body Butter',
    description:
      'Curated shea, mango, and coco butters with jojoba, sweet almond, flaxseed, and castor oils, Vitamin E, and notes of Lavender & Rose. Calming, romantic, deeply nourishing.',
    image: '/products/butter-lavender-rose.jpg',
    imageAlt: 'SEEN Lavender Rose Body Butter by Hubs & Babydoll',
    price: '10.00',
    variantId: 'gid://shopify/ProductVariant/6',
    variants: [],
  },
  {
    id: 'gid://shopify/Product/7',
    handle: 'heard-bay-rum-beard-set',
    title: 'HEARD Bay Rum Beard Set',
    description:
      'The complete Bay Rum beard grooming set — beard wash, beard oil, and beard balm — with Moroccan argan, jojoba, sweet almond, pumpkin seed, and castor oils, Vitamin E, and warm notes of Bay Rum.',
    image: '/products/pro-bay-rum-beard-set.jpg',
    imageAlt: 'HEARD Bay Rum beard care gift set by Hubs & Babydoll',
    price: '45.00',
    variantId: 'gid://shopify/ProductVariant/7',
    variants: [],
  },
  {
    id: 'gid://shopify/Product/8',
    handle: 'bay-rum-beard-oil',
    title: 'Bay Rum Beard Oil',
    description:
      'Jojoba, sweet almond, castor, rosemary, flax, and pumpkin seed oils with Vitamin E and notes of Bay Rum. Softens the beard and conditions the skin beneath.',
    image: '/products/pro-bay-rum-beard-oil.jpg',
    imageAlt: 'Bay Rum Beard Oil by Hubs & Babydoll',
    price: '15.00',
    variantId: 'gid://shopify/ProductVariant/8',
    variants: [],
  },
  {
    id: 'gid://shopify/Product/9',
    handle: 'bay-rum-beard-balm',
    title: 'Bay Rum Beard Balm',
    description:
      'Shea, mango, and coco butters with beeswax, argan, jojoba, sweet almond, castor, rosemary, and pumpkin seed oils, Vitamin E, and notes of Bay Rum. Tames, shapes, and conditions.',
    image: '/products/pro-bay-rum-beard-balm.jpg',
    imageAlt: 'Bay Rum Beard Balm by Hubs & Babydoll',
    price: '12.00',
    variantId: 'gid://shopify/ProductVariant/9',
    variants: [],
  },
]

export function useProducts() {
  const { data, error, isLoading } = useSWR<ApiResponse>('/api/products', fetcher)

  const apiProducts = (data?.products?.edges?.map((edge) => {
    const node = edge.node
    const imageUrl = node.images?.edges?.[0]?.node?.url || ''
    const imageAlt = node.images?.edges?.[0]?.node?.altText || node.title
    const variants = node.variants?.edges?.map(({ node: variant }) => ({
      id: variant.id,
      title: toTitleCase(variant.title || ''),
      price: variant.price?.amount || '0',
      currencyCode: variant.price?.currencyCode || 'USD',
      availableForSale: variant.availableForSale,
      selectedOptions: variant.selectedOptions || [],
    })) || []
    const firstVariant = variants[0]
    const price = firstVariant?.price || '0'
    const variantId = firstVariant?.id || ''

    return {
      id: node.id,
      handle: node.handle,
      title: toTitleCase(node.title),
      description: node.description,
      image: imageUrl,
      imageAlt,
      price,
      variantId,
      variants,
    }
  }) || [])
    // Only show products that have a real photo so the grid stays polished
    .filter((product) => product.image)

  // Use API products if available, otherwise fall back to demo products
  const products = apiProducts.length > 0 ? apiProducts : FALLBACK_PRODUCTS

  return {
    products,
    isLoading,
    error: apiProducts.length === 0 && !isLoading && !error ? null : error,
  }
}
