import type { MetadataRoute } from 'next'

const siteUrl = 'https://hubsandbabydoll.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/setup', '/admin', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
