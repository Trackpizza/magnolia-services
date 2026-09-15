import type { MetadataRoute } from 'next'

const BASE_URL = 'https://services.magnoliaskincenter.com'

// Allow crawling of all public pages; keep the admin panel, the unlisted /spin
// content tool, and the staging booking page out of the index. Points crawlers
// at the sitemap.
//
// /bookingtesting must stay disallowed until the Cloud BAA is signed: a real
// patient booking there would create PHI in a project that is not yet covered.
//
// /photo-consult is unlisted for the same reason, one step removed: the form it
// sends people to still says "Test mode — please use a sample/AI image". Share
// the URL directly all you like; it just should not be found cold from a search
// until the BAA makes the real thing permissible.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/spin', '/photo-consult', '/bookingtesting', '/bookingpreview', '/bookingpreview-deposit', '/bookings/cancel', '/dr-davids-rejuvenation', '/nurse-eileens-rejuvenation', '/rejuvenation-journeys', '/stylists'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
