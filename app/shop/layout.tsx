import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Shop handcrafted Seen & Heard Care body care, body oils, body butters, and curated wellness gift boxes.',
  alternates: {
    canonical: '/shop',
  },
}

export default function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
