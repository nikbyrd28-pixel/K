import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliates',
  description:
    'Share Hubs & Babydoll with your people. Give them 10% off, keep 15% of every order your code brings in.',
  alternates: {
    canonical: '/affiliates',
  },
}

export default function AffiliatesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
