'use client'

import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { WaitlistSection } from '@/components/waitlist-section'
import { useProducts } from '@/hooks/use-products'

export default function ShopPage() {
  const { products, isLoading, error } = useProducts()

  // Keep products in their original source order
  const ordered = products

  return (
    <>
      <section className="relative bg-background border-b border-border overflow-hidden">
        <Image
          src="/hero.png"
          alt="Founder of Hubs & Babydoll with the SEEN & HEARD body boxes"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-primary/50" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary">The Collection</span>
            <span className="h-px w-8 bg-primary/50" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl leading-[1.02] text-balance">
            Signature Body Care
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed text-pretty">
            Handcrafted oils, body butters, and gift boxes made in small batches for skin that deserves to feel seen, heard, and cared for.
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-gradient-to-b from-secondary to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-muted-foreground">
              <p>Unable to load products. Please try again later.</p>
            </div>
          )}

          {!isLoading && !error && ordered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {ordered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!isLoading && !error && ordered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p>No products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <WaitlistSection />
    </>
  )
}
