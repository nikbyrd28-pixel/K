import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Full-bleed showcase of the complete product lineup (professional studio shot).
export function CollectionShowcase() {
  return (
    <section className="relative overflow-hidden border-y border-border">
      <div className="relative min-h-[520px] lg:min-h-[600px] flex items-center">
        <Image
          src="/products/pro-collection.jpg"
          alt="The full Hubs & Babydoll collection — oils, butters, washes, and gift boxes"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/25 lg:to-transparent"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-background/45 lg:bg-transparent" aria-hidden="true" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-lg">
            <span className="text-xs uppercase tracking-[0.3em] text-primary">The Full Collection</span>
            <h2 className="font-serif text-4xl lg:text-6xl leading-[1.04] mt-5 mb-6 text-balance">
              Every scent. Every detail. All handmade.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-md text-pretty">
              From Bay Rum to Jasmine &amp; Gardenia, Lavender Rose, Peppermint, and Chocolate —
              body oils, butters, washes, beard care, and gift boxes, blended in small batches.
            </p>
            <Button
              size="lg"
              render={<Link href="/shop">Shop the collection</Link>}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-9 h-12 text-xs uppercase tracking-[0.2em]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
