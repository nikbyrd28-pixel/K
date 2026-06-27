import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Cormorant_Garamond } from 'next/font/google'
import { SiteShell } from '@/components/site-shell'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const siteUrl = 'https://seenandheardcare.com'
const siteName = 'Seen & Heard Care'
const title = 'Seen & Heard Care — Body Care & Wellness Essentials'
const description =
  'Handcrafted body care and wellness essentials, thoughtfully curated to help the people who care for everyone else feel seen, heard, and appreciated.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s | ${siteName}`,
  },
  description,
  applicationName: siteName,
  generator: 'v0.app',
  keywords: [
    'body care',
    'wellness essentials',
    'handcrafted body care',
    'self care',
    'bath and body',
    'natural skincare',
    'wellness gifts',
    'caregiver gifts',
    'Seen & Heard Care',
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: '/',
  },
  category: 'shopping',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName,
    title,
    description,
    images: [
      {
        url: '/hero.png',
        width: 1200,
        height: 1200,
        alt: 'Seen & Heard Care body care and wellness essentials',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/hero.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0B0B0C',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: siteName,
    url: siteUrl,
    description,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/hero.png`,
    slogan: 'Those who pour into others deserve to be poured into',
  }

  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable} bg-background`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteShell>{children}</SiteShell>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
