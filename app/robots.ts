import type { MetadataRoute } from 'next'

const BASE_URL = 'https://services.magnoliaskincenter.com'

// Allow crawling of all public pages; keep the admin panel, the unlisted /spin
// content tool, and the staging booking page out of the index. Points crawlers
// at the sitemap.
//
// /bookingtesting must stay disallowed until the Cloud BAA is signed: a real
// patient booking there would create PHI in a project that is not yet covered.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/spin', '/bookingtesting', '/bookings/cancel', '/dr-davids-rejuvenation', '/nurse-eileens-rejuvenation', '/rejuvenation-journeys', '/stylists'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
