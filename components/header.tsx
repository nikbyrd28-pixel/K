'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useShoppingCart } from './shopping-cart-provider'

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'Our Story' },
  { href: '/faq', label: 'FAQ' },
]

export function Header() {
  const { cartCount, openCart } = useShoppingCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center" aria-label="Seen & Heard Care home">
            <div className="w-11 h-11 relative">
              <Image
                src="/logo-transparent.png"
                alt="Seen & Heard Care"
                fill
                priority
                sizes="44px"
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-9">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] uppercase tracking-[0.22em] transition-colors ${
                    active ? 'text-primary' : 'text-foreground/70 hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <button onClick={openCart} className="relative" aria-label="Open shopping cart">
              <ShoppingCart className="w-[18px] h-[18px] text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-5 sm:hidden">
            <button onClick={openCart} className="relative" aria-label="Open shopping cart">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`sm:hidden overflow-hidden border-t border-border/60 transition-[max-height] duration-300 ease-out ${
          menuOpen ? 'max-h-64' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col px-4 py-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-4 border-b border-border/60 last:border-b-0 text-sm uppercase tracking-[0.22em] text-foreground/80 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
