import type { MetadataRoute } from 'next'

const BASE_URL = 'https://services.magnoliaskincenter.com'

// Allow crawling of all public pages; keep the admin panel, the unlisted /spin
// content tool, and the staging booking page out of the index. Points crawlers
// at the sitemap.
//
// /bookingtesting must stay disallowed until the Cloud BAA is signed: a real
// patient booking there would create PHI in a project that is not yet covered.
//
// /photo-consult was unlisted until the photo-consult go-live (2026-11-19).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/spin', '/bookingtesting', '/bookingpreview', '/bookingpreview-deposit', '/bookings/cancel', '/journey', '/results', '/dr-davids-rejuvenation', '/nurse-eileens-rejuvenation', '/rejuvenation-journeys', '/stylists', '/build-your-journey', '/packages'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
