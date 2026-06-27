import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeaturedProducts } from '@/components/featured-products'

function HeroSection() {
  return (
    <section className="relative bg-background min-h-[90vh] flex items-center">
      <Image
        src="/hero.png"
        alt="Founder of Hubs & Babydoll with the SEEN & HEARD body boxes"
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority
      />
      {/* Scrim for legible text over the owner photo */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40 lg:to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-background/30 lg:bg-transparent"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-7">
            <span className="h-px w-8 bg-primary/50" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary">
              Body Care &amp; Wellness Essentials
            </span>
          </div>
          <h1 className="font-serif text-5xl lg:text-7xl leading-[1.04] mb-7 text-balance">
            Give your skin the{' '}
            <em className="text-primary italic">attention it deserves</em>
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground mb-9 leading-relaxed max-w-lg text-pretty">
            Handcrafted body care and wellness essentials, thoughtfully curated to help the people
            who care for everyone else feel seen, heard, and appreciated.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Button
              size="lg"
              render={<Link href="/shop">Shop the Collection</Link>}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-9 h-12 text-xs uppercase tracking-[0.2em]"
            />
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/about">Our Story</Link>}
              className="rounded-none px-9 h-12 text-xs uppercase tracking-[0.2em] border-primary/40 text-foreground hover:bg-primary/10 hover:text-foreground bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2 mt-9">
            <div className="flex text-primary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Loved by those who care for everyone else
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function MarqueeBar() {
  const items = [
    '100% Pure Botanicals',
    'Handcrafted in Small Batches',
    'Cruelty Free',
    'All-Day Hydration',
    'Black-Owned',
  ]
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        {items.map((item) => (
          <span key={item} className="text-xs uppercase tracking-[0.25em] font-medium">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function CategoryStrip() {
  const categories = [
    { name: 'Body Butters', desc: 'Whipped, deeply nourishing daily moisture' },
    { name: 'Body Oils', desc: 'Silky, fast-absorbing all-day glow' },
    { name: 'Wellness Essentials', desc: 'Curated routines for calm, comfort, and care' },
  ]
  return (
    <section className="py-16 lg:py-24 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-primary">What We Make</span>
            <h2 className="font-serif text-3xl lg:text-5xl mt-4 text-balance max-w-md leading-[1.1]">
              Handcrafted body care, made to be felt.
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.2em] text-primary border-b border-primary/40 pb-1 hover:border-primary transition-colors self-start lg:self-auto"
          >
            View all products
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              href="/shop"
              className="group flex items-baseline gap-5 py-7 sm:py-0 sm:px-8 sm:first:pl-0 border-t sm:border-t-0 sm:border-l first:border-t-0 sm:first:border-l-0 border-border"
            >
              <span className="font-mono text-xs text-primary/60 pt-1">0{i + 1}</span>
              <span>
                <span className="block font-serif text-2xl lg:text-3xl group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
                <span className="block text-sm text-muted-foreground mt-2 leading-relaxed text-pretty">
                  {cat.desc}
                </span>
                <span className="block text-[11px] uppercase tracking-[0.15em] text-primary/70 mt-3">
                  Available now
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function RitualSection() {
  const steps = [
    {
      title: 'Pure Botanicals',
      copy: 'Shea, mango butter, and jojoba — never watered down, never synthetic. Just raw nourishment your skin recognizes.',
    },
    {
      title: 'Handcrafted Care',
      copy: 'Blended and poured in small batches so every jar carries the intention of a true routine, not a factory line.',
    },
    {
      title: 'Lasting Radiance',
      copy: 'Velvety, all-day hydration wrapped in therapeutic-grade scent that calms the senses from morning to night.',
    },
  ]

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Why It&apos;s Different</span>
          <h2 className="font-serif text-4xl lg:text-5xl leading-[1.1] mt-5 text-balance">
            The art of being <em className="text-primary not-italic">cared for.</em>
          </h2>
          <p className="text-muted-foreground leading-relaxed mt-6 text-pretty">
            Three quiet promises in every gift box.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-border">
          {steps.map((step) => (
            <div
              key={step.title}
              className="px-0 py-10 md:px-10 md:py-14 border-b md:border-b-0 md:border-l border-border first:md:border-l-0"
            >
              <span className="block h-px w-12 bg-primary mb-8" aria-hidden="true" />
              <h3 className="font-serif text-2xl lg:text-3xl mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-pretty">{step.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StoryTeaser() {
  return (
    <section className="py-24 lg:py-32 bg-secondary border-y border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-primary">Our Story</span>
        <h2 className="font-serif text-4xl sm:text-5xl leading-[1.12] mt-8 mb-8 text-balance">
          The people who love the hardest often care for themselves the least.
        </h2>
        <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-10 text-pretty">
          We&apos;re a small, home-based brand creating handcrafted self-care essentials and gift
          experiences designed to transform everyday routines into meaningful wellness moments.
        </p>
        <Button
          size="lg"
          variant="outline"
          render={<Link href="/about">Read Our Story</Link>}
          className="rounded-none px-9 h-12 text-xs uppercase tracking-[0.2em] border-primary/40 text-foreground hover:bg-primary/10 hover:text-foreground bg-transparent"
        />
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <MarqueeBar />
      <CategoryStrip />
      <FeaturedProducts />
      <RitualSection />
      <StoryTeaser />
    </>
  )
}
