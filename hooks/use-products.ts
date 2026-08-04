import { CATALOG } from '@/lib/catalog'

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

// The catalog lives in lib/catalog.ts — that's the ONE file the owner edits to
// change prices, wording, sizes, or add products. We turn each catalog entry
// into a Product here so the shop, cart, and checkout all read the same source.
// (The site no longer depends on Shopify; orders are captured in TB Command.)
function catalogToProducts(): Product[] {
  return CATALOG.map((item, index) => ({
    id: `hb-${index + 1}`,
    handle: item.handle,
    title: item.name,
    description: item.description,
    image: item.image,
    imageAlt: item.imageAlt,
    price: item.sizes[0]?.price.toFixed(2) ?? '0',
    variantId: `hb-${index + 1}-v`,
    variants: [],
  }))
}

export function useProducts() {
  // Static, instant, fully owner-controlled. No network call, nothing to break.
  return {
    products: catalogToProducts(),
    isLoading: false,
    error: null as Error | null,
  }
}
