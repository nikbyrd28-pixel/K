'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShoppingCart } from '@/components/shopping-cart-provider'
import { getMerch } from '@/lib/merchandising'
import type { Product } from '@/hooks/use-products'

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useShoppingCart()
  const { name, description, sizes, badge, allSoldOut } = getMerch(product)

  const firstAvailable = sizes.findIndex((s) => !s.soldOut)
  const [selected, setSelected] = useState(firstAvailable === -1 ? 0 : firstAvailable)
  const sel = sizes[selected]

  const handleAdd = () => {
    if (sel.soldOut) return
    addToCart({
      id: sel.variantId ?? `${product.id}-${sel.label}`,
      variantId: sel.variantId ?? product.variantId,
      title: `${name} — ${sel.label}`,
      price: sel.price,
      quantity: 1,
      image: product.image,
    })
  }

  return (
    <article className="group flex flex-col bg-background/55 border border-border/60 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_28px_100px_rgba(0,0,0,0.28)]">
      <Link
        href={`/shop/${product.handle}`}
        className="relative block aspect-square overflow-hidden bg-card border border-border/60 mb-5"
        aria-label={`View ${name}`}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.imageAlt || name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        {badge && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 font-medium">
            {badge}
          </span>
        )}
        {allSoldOut && (
          <span className="absolute top-3 right-3 bg-foreground/85 text-background text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 font-medium">
            Sold Out
          </span>
        )}
      </Link>

      <Link href={`/shop/${product.handle}`}>
        <h3 className="font-serif text-xl lg:text-2xl leading-snug group-hover:text-primary transition-colors text-balance">
          {name}
        </h3>
      </Link>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed text-pretty line-clamp-3 min-h-16">
        {description}
      </p>

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap gap-2">
          {sizes.map((size, i) => {
            const isSelected = i === selected
            return (
              <button
                key={size.label}
                type="button"
                disabled={size.soldOut}
                onClick={() => setSelected(i)}
                className={[
                  'flex flex-col items-start border px-3 py-2 transition-colors text-left',
                  size.soldOut
                    ? 'border-border text-muted-foreground/60 cursor-not-allowed line-through'
                    : isSelected
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-foreground hover:border-primary/50',
                ].join(' ')}
              >
                <span className="text-[11px] uppercase tracking-[0.12em]">{size.label}</span>
                <span className="font-serif text-lg text-primary leading-none mt-0.5">
                  {size.soldOut ? 'Sold out' : `$${size.price}`}
                </span>
              </button>
            )
          })}
        </div>

        <Button
          onClick={handleAdd}
          disabled={allSoldOut || sel.soldOut}
          className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none text-xs uppercase tracking-[0.18em] h-12 disabled:opacity-50 shadow-lg shadow-primary/10"
        >
          {allSoldOut ? 'Sold Out' : 'Add to Routine'}
        </Button>
      </div>
    </article>
  )
}
