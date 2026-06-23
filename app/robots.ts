import type { MetadataRoute } from 'next'

const BASE_URL = 'https://services.magnoliaskincenter.com'

// Allow crawling of all public pages; keep the admin panel and the unlisted
// /spin content tool out of the index. Points crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/spin'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
