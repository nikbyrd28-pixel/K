export type Size = {
  label: string
  price: number
  soldOut?: boolean
  badge?: string
  variantId?: string
}

export type Merch = {
  order: number
  name: string
  description: string
  sizes: Size[]
  ingredients?: string
}

import { CATALOG } from './catalog'

// Names, copy, sizes, prices, and badges all come from ONE place: lib/catalog.ts.
// This just reshapes that list into the lookup the product pages use, so the
// owner only ever edits catalog.ts. Keyed by product handle; order = list order.
export const MERCHANDISING: Record<string, Merch> = Object.fromEntries(
  CATALOG.map((item, index) => [
    item.handle,
    {
      order: index + 1,
      name: item.name,
      description: item.description,
      sizes: item.sizes.map((s) => ({
        label: s.size,
        price: s.price,
        soldOut: s.soldOut,
        badge: s.badge,
      })),
    },
  ]),
)

export interface ProductLike {
  handle: string
  title: string
  description: string
  price: string
  variantId?: string
  /** Live sizes from the DB, populated by use-products. When present these take
   *  priority over the static MERCHANDISING map so admin price changes are live. */
  liveSizes?: Array<{ size: string; price: number; soldOut?: boolean; badge?: string }>
  variants?: Array<{
    id: string
    title: string
    price: string
    availableForSale: boolean
    selectedOptions?: Array<{ name: string; value: string }>
  }>
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function variantMatchesSize(variant: NonNullable<ProductLike['variants']>[number], label: string) {
  const labelText = normalize(label)
  const variantText = normalize(
    [variant.title, ...(variant.selectedOptions?.map((option) => option.value) ?? [])].join(' '),
  )

  return labelText
    .split(' ')
    .filter(Boolean)
    .every((part) => variantText.includes(part))
}

// Resolve the display name, description, and purchasable sizes for a product,
// falling back to the live Shopify values when no curated entry exists.
export function getMerch(product: ProductLike) {
  const merch = MERCHANDISING[product.handle]
  const liveVariants = product.variants ?? []
  const hasRealVariantOptions = liveVariants.some(
    (variant) => variant.title && variant.title !== 'Default Title',
  )

  // Live sizes from the DB (via use-products) are the highest-priority source —
  // they reflect whatever the owner saved in the admin panel. Fall back to the
  // static MERCHANDISING map, then Shopify variants, then a single "One size".
  const sizes: Size[] = product.liveSizes?.length
    ? product.liveSizes.map((s, i) => ({
        label: s.size,
        price: s.price,
        soldOut: s.soldOut ?? false,
        badge: s.badge,
        variantId: `${product.variantId ?? product.handle}-${i}`,
      }))
    : merch?.sizes
      ? merch.sizes.map((size) => {
          const variant = liveVariants.find((candidate) => variantMatchesSize(candidate, size.label))
          return {
            ...size,
            price: variant ? Number.parseFloat(variant.price) || size.price : size.price,
            soldOut: size.soldOut || (variant ? !variant.availableForSale : !product.variantId),
            variantId: variant?.id ?? product.variantId,
          }
        })
      : liveVariants.length > 0 && hasRealVariantOptions
        ? liveVariants.map((variant) => ({
            label: variant.title === 'Default Title' ? 'Available size' : variant.title,
            price: Number.parseFloat(variant.price) || 0,
            soldOut: !variant.availableForSale,
            variantId: variant.id,
          }))
        : [{ label: 'One size', price: parseFloat(product.price) || 0, variantId: product.variantId }]

  const availableSizes = sizes.filter((s) => !s.soldOut)

  return {
    name: merch?.name ?? product.title,
    description: merch?.description ?? product.description,
    sizes,
    order: merch?.order ?? 99,
    badge: sizes.find((s) => s.badge)?.badge,
    allSoldOut: sizes.every((s) => s.soldOut),
    fromPrice: availableSizes.length > 0 ? Math.min(...availableSizes.map((s) => s.price)) : 0,
  }
}
