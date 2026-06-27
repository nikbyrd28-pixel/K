'use client'

import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { useProducts } from '@/hooks/use-products'

export function FeaturedProducts() {
  const { products, isLoading, error } = useProducts()

  // Keep products in their original source order, show the first three
  const featured = products.slice(0, 3)

  return (
    <section id="products" className="py-20 lg:py-28 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-14">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-primary">The Collection</span>
            <h2 className="font-serif text-4xl lg:text-6xl mt-4 leading-[1.05] text-balance">
              Signature Body Care
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.2em] text-primary border-b border-primary/40 pb-1 hover:border-primary transition-colors self-start md:self-auto md:pb-2"
          >
            View all products
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-muted-foreground">
            <p>Unable to load products. Please try again later.</p>
          </div>
        )}

        {!isLoading && !error && featured.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
