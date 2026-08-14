import useSWR from 'swr'
import { mergeCatalog, type ProductRow, type CatalogSize } from '@/lib/catalog'

export interface Product {
  id: string
  handle: string
  title: string
  description: string
  image: string
  image2: string
  imageAlt: string
  price: string
  variantId: string
  variants: ProductVariant[]
  /** Live sizes from the DB (via mergeCatalog). getMerch reads these so price
   *  changes in the admin panel are immediately reflected on the storefront. */
  liveSizes: CatalogSize[]
}

export interface ProductVariant {
  id: string
  title: string
  price: string
  currencyCode: string
  availableForSale: boolean
  selectedOptions: Array<{ name: string; value: string }>
}

// The owner's live edits (prices, photos, hidden products, new products) are
// saved in the Supabase table `hb_products` from the Studio page (/admin).
// This anon key is public and read-only for that table.
const SUPA_URL = 'https://qgbjiqdwzgkjkmqyjsmc.supabase.co'
const SUPA_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYmppcWR3emdramttcXlqc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNzc1NTEsImV4cCI6MjA5OTk1MzU1MX0.Naocw-B0B6Z7CLg197yxLezd58a6f5XoMLEiea5b0Ro'

const fetcher = (url: string) =>
  fetch(url, { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } })
    .then((res) => (res.ok ? res.json() : []))
    .catch(() => [])

export function useProducts() {
  // Load the owner's saved edits; the built-in catalog is the fallback, so the
  // shop is never empty even before any edits (or if the backend is unreachable).
  const { data, error } = useSWR<ProductRow[]>(
    `${SUPA_URL}/rest/v1/hb_products?select=*`,
    fetcher,
    { revalidateOnFocus: false },
  )
  const rows = Array.isArray(data) ? data : []
  const isLoading = !data && !error

  const products: Product[] = mergeCatalog(rows)
    .filter((item) => item.active !== false)
    .map((item) => ({
      id: `hb-${item.handle}`,
      handle: item.handle,
      title: item.name,
      description: item.description,
      image: item.image,
      image2: item.image2 || '',
      imageAlt: item.imageAlt,
      price: item.sizes[0]?.price?.toFixed(2) ?? '0',
      variantId: `hb-${item.handle}-v`,
      variants: [],
      liveSizes: item.sizes,
    }))

  return { products, isLoading, error: error as Error | null }
}
