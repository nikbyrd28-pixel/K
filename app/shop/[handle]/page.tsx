'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Loader2, Leaf, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import { useShoppingCart } from '@/components/shopping-cart-provider'
import { useProducts } from '@/hooks/use-products'
import { getMerch } from '@/lib/merchandising'

export default function ProductDetailPage() {
  const params = useParams<{ handle: string }>()
  const handle = params?.handle
  const { products, isLoading, error } = useProducts()
  const { addToCart, openCart } = useShoppingCart()
  const [added, setAdded] = useState(false)

  // null means "no explicit user choice yet" — we fall back to the first available size
  const [picked, setPicked] = useState<number | null>(null)

  const product = products.find((p) => p.handle === handle)

  const merch = product ? getMerch(product) : null
  const firstAvailable = merch ? merch.sizes.findIndex((s) => !s.soldOut) : 0
  const selected = picked ?? (firstAvailable === -1 ? 0 : firstAvailable)
  const setSelected = setPicked

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error || !product || !merch) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="font-serif text-3xl mb-4">Product not found</h1>
        <p className="text-muted-foreground mb-8">
          We couldn&apos;t find what you were looking for.
        </p>
        <Button
          render={<Link href="/shop">Back to Shop</Link>}
          className="rounded-none text-xs uppercase tracking-[0.2em]"
        />
      </div>
    )
  }

  const { name, description: merchDescription, sizes, badge, allSoldOut } = merch
  // Prefer the full live Shopify description; fall back to curated copy only when missing
  const description = product.description?.trim() || merchDescription
  const sel = sizes[selected]

  const handleAdd = () => {
    if (sel.soldOut) return
    addToCart({
      id: `${product.id}-${sel.label}`,
      variantId: product.variantId,
      title: `${name} — ${sel.label}`,
      price: sel.price,
      quantity: 1,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
    openCart()
  }

  const related = products.filter((p) => p.handle !== product.handle).slice(0, 3)

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Full product image */}
          <div className="relative aspect-square bg-card border border-border/60 overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.imageAlt || name}
                fill
                priority
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Leaf className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            {badge && (
              <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 font-medium">
                {badge}
              </span>
            )}
          </div>

          {/* Details + buy */}
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.3em] text-primary">Hubs &amp; Babydoll</span>
            <h1 className="font-serif text-4xl lg:text-5xl leading-[1.08] mt-4 text-balance">
              {name}
            </h1>
            <p className="font-serif text-2xl text-primary mt-4">
              {sel.soldOut ? 'Sold out' : `$${sel.price}`}
            </p>

            <p className="text-base text-muted-foreground mt-6 leading-relaxed text-pretty">
              {description}
            </p>

            <div className="mt-8">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Choose your size
              </span>
              <div className="flex flex-wrap gap-3 mt-3">
                {sizes.map((size, i) => {
                  const isSelected = i === selected
                  return (
                    <button
                      key={size.label}
                      type="button"
                      disabled={size.soldOut}
                      onClick={() => setSelected(i)}
                      className={[
                        'flex flex-col items-start border px-4 py-3 transition-colors text-left min-w-[7rem]',
                        size.soldOut
                          ? 'border-border text-muted-foreground/60 cursor-not-allowed line-through'
                          : isSelected
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border text-foreground hover:border-primary/50',
                      ].join(' ')}
                    >
                      <span className="text-[11px] uppercase tracking-[0.12em]">{size.label}</span>
                      <span className="font-serif text-xl text-primary leading-none mt-1">
                        {size.soldOut ? 'Sold out' : `$${size.price}`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <Button
              onClick={handleAdd}
              disabled={allSoldOut || sel.soldOut}
              className="mt-8 w-full sm:w-auto sm:self-start bg-primary text-primary-foreground hover:bg-primary/90 rounded-none text-xs uppercase tracking-[0.2em] h-12 px-12 disabled:opacity-50"
            >
              {added ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Added to Cart
                </span>
              ) : allSoldOut ? (
                'Sold Out'
              ) : (
                'Add to Cart'
              )}
            </Button>

            <ul className="mt-10 pt-8 border-t border-border space-y-3 text-sm text-muted-foreground">
              <li>Handcrafted in small batches with pure botanicals.</li>
              <li>Cruelty free and made without harsh synthetic fillers.</li>
              <li>All-day, therapeutic-grade hydration.</li>
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-16 lg:py-24 bg-secondary border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl lg:text-4xl mb-10 text-balance">You may also love</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
