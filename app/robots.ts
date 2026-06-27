import type { MetadataRoute } from 'next'

const siteUrl = 'https://seenandheardcare.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/setup', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
