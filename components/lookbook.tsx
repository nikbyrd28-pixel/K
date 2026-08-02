import Image from 'next/image'

// Editorial image gallery of the professional studio photography.
const SHOTS = [
  { src: '/products/pro-brand-box.jpg', alt: 'Hubs & Babydoll signature gift box' },
  { src: '/products/pro-heard-bay-rum-set.jpg', alt: 'HEARD Bay Rum gift set' },
  { src: '/products/pro-seen-lavender-portrait.jpg', alt: 'SEEN Lavender Rose gift set with roses' },
  { src: '/products/pro-bay-rum-beard-set.jpg', alt: 'HEARD Bay Rum beard care set' },
]

export function Lookbook() {
  return (
    <section className="py-16 lg:py-24 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 mb-10 lg:mb-12">
          <span className="h-px w-8 bg-primary/50" />
          <span className="text-xs uppercase tracking-[0.3em] text-primary">The Lookbook</span>
          <span className="h-px w-8 bg-primary/50" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {SHOTS.map((s) => (
            <div
              key={s.src}
              className="group relative aspect-[4/5] overflow-hidden border border-border bg-card"
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
