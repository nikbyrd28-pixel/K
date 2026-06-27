import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InstagramIcon, TikTokIcon, FacebookIcon } from '@/components/social-icons'

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-border">
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-primary/50" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary">Your Routine Awaits</span>
            <span className="h-px w-8 bg-primary/50" />
          </div>
          <h2 className="font-serif text-4xl lg:text-6xl mb-6 text-balance">
            Give your skin the attention it deserves.
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-9 max-w-xl mx-auto text-pretty">
            Step into a genuinely restorative self-care routine. Handcrafted, indulgent, and made to
            be felt all day long.
          </p>
          <Button
            size="lg"
            render={<Link href="/shop">Shop the Collection</Link>}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-10 h-12 text-xs uppercase tracking-[0.2em]"
          />
        </div>
      </section>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 flex flex-col items-center gap-6">
          <Link href="/" className="relative w-20 h-20" aria-label="Hubs & Babydoll home">
            <Image src="/logo-transparent.png" alt="Hubs & Babydoll" fill className="object-contain" />
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {[
              { href: '/shop', label: 'Shop' },
              { href: '/about', label: 'Our Story' },
              { href: '/faq', label: 'FAQ' },
              { href: '/shipping-policy', label: 'Shipping' },
              { href: '/refund-policy', label: 'Refunds' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hubs & Babydoll on Instagram"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hubs & Babydoll on TikTok"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <TikTokIcon className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hubs & Babydoll on Facebook"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <FacebookIcon className="w-5 h-5" />
            </a>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center">
            © 2026 Hubs &amp; Babydoll · Handcrafted Excellence
          </p>
        </div>
      </div>
    </footer>
  )
}
