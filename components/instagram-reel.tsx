import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Instagram reel featured on the home page. Uses Instagram's native /embed
// iframe so it works without loading Instagram's embed.js on every page.
const REEL_URL = 'https://www.instagram.com/reel/DbQxllwgUdd/embed'
const PROFILE_URL = 'https://www.instagram.com/hubs_babydoll'

export function InstagramReel() {
  return (
    <section className="py-20 lg:py-28 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <span className="text-xs uppercase tracking-[0.3em] text-primary">In Motion</span>
            <h2 className="font-serif text-4xl lg:text-5xl mt-5 leading-[1.1] text-balance">
              See the ritual come to life.
            </h2>
            <p className="text-muted-foreground leading-relaxed mt-6 text-pretty max-w-md">
              A closer look at the small-batch care behind every Hubs &amp; Babydoll box —
              the textures, the scents, and the quiet moments made to slow you down.
            </p>
            <div className="mt-9">
              <Button
                size="lg"
                render={
                  <Link href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
                    Follow @hubs_babydoll
                  </Link>
                }
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-9 h-12 text-xs uppercase tracking-[0.2em]"
              />
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div
              className="w-full max-w-[400px] border border-border bg-card overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
            >
              <div className="relative w-full" style={{ aspectRatio: '400 / 640' }}>
                <iframe
                  src={REEL_URL}
                  title="Hubs & Babydoll on Instagram"
                  loading="lazy"
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
