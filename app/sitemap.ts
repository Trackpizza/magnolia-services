import type { MetadataRoute } from 'next'
import { getAllSlugs } from '@/config/services'

// Canonical public host (custom domain). Hardcoded like the other absolute URLs
// in the app; if the domain ever changes, update here.
const BASE_URL = 'https://services.magnoliaskincenter.com'

// Generated at build from the services config, so it stays in sync with the menu.
// Hidden services are excluded (getAllSlugs filters them). /admin and /spin are
// intentionally omitted (see robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...getAllSlugs().map(slug => ({
      url: `${BASE_URL}/services/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
