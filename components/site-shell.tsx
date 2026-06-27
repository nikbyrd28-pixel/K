'use client'

import type { ReactNode } from 'react'
import { ShoppingCartProvider } from '@/components/shopping-cart-provider'
import { Header } from '@/components/header'
import { CartDrawer } from '@/components/cart-drawer'
import { SiteFooter } from '@/components/site-footer'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <ShoppingCartProvider>
      <Header />
      <CartDrawer />
      <main>{children}</main>
      <SiteFooter />
    </ShoppingCartProvider>
  )
}
