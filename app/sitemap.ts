import type { MetadataRoute } from 'next'
import { CATALOG } from '@/lib/catalog'

const siteUrl = 'https://hubsandbabydoll.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/shop', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/quiz', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/affiliates', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/shipping-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/refund-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  ]

  // Every product page, so Google can index the full catalog.
  const productRoutes = CATALOG.map((item) => ({
    path: `/shop/${item.handle}`,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  }))

  return [...routes, ...productRoutes].map((route) => ({
    url: `${siteUrl}${route.path === '/' ? '' : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
