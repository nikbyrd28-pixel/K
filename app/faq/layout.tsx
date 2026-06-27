import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about Hubs & Babydoll body care, gift boxes, ingredients, sensitive skin, and restocks.',
  alternates: {
    canonical: '/faq',
  },
}

export default function FAQLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
