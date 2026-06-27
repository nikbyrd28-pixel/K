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

// Fallback products for demo - replace with real Shopify products
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'gid://shopify/Product/1',
    handle: 'lavender-set',
    title: 'The SEEN Lavender Set',
    description:
      'Melt away the mental noise of the day. Formulated with pure Shea Butter, Mango Butter, Jojoba Oil, and therapeutic Lavender Essential Oil, this set deeply hydrates, reduces inflammation, and prepares your mind and body for deep, restorative rest.',
    image: '/lavender-set.png',
    imageAlt: 'The SEEN Lavender Set',
    price: '58.00',
    variantId: 'gid://shopify/ProductVariant/1',
  },
  {
    id: 'gid://shopify/Product/2',
    handle: 'bay-rum-experience',
    title: 'The HEARD Bay Rum Experience',
    description:
      'A grounding, full-body experience designed for rich, masculine or unisex hydration. Utilizing classic West Indian Bay Rum botanicals, it leaves an energetic, crisp finish that keeps skin velvety and vibrant from morning to night.',
    image: '/bay-rum.png',
    imageAlt: 'The HEARD Bay Rum Experience',
    price: '68.00',
    variantId: 'gid://shopify/ProductVariant/2',
  },
  {
    id: 'gid://shopify/Product/3',
    handle: 'jasmine-gardenia-shield',
    title: 'The SEEN Jasmine & Gardenia Shield',
    description:
      'Elevate your daily ritual with a sophisticated, pure floral shield. This blend locks in vital moisture all day long, draping your skin in an intoxicating, delicate floral bouquet that protects against environmental dryness.',
    image: '/jasmine-gardenia.png',
    imageAlt: 'The SEEN Jasmine & Gardenia Shield',
    price: '68.00',
    variantId: 'gid://shopify/ProductVariant/3',
  },
]

export function useProducts() {
  const { data, error, isLoading } = useSWR<ApiResponse>('/api/products', fetcher)

  const apiProducts = (data?.products?.edges?.map((edge) => {
    const node = edge.node
    const imageUrl = node.images?.edges?.[0]?.node?.url || ''
    const imageAlt = node.images?.edges?.[0]?.node?.altText || node.title
    const price = node.variants?.edges?.[0]?.node?.price?.amount || '0'
    const variantId = node.variants?.edges?.[0]?.node?.id || ''

    return {
      id: node.id,
      handle: node.handle,
      title: toTitleCase(node.title),
      description: node.description,
      image: imageUrl,
      imageAlt,
      price,
      variantId,
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
