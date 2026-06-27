import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'The story behind Hubs & Babydoll, a small home-based brand creating handcrafted self-care essentials and meaningful wellness moments.',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
