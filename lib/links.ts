import { adminDb } from './firebase/admin'
import type { ServiceLinks, DayKey, DayHours } from './types'
import { DEFAULT_LINKS, DAY_KEYS, DEFAULT_HOURS } from './types'
import { DEFAULT_AFTERCARE, DEFAULT_PREP, withGuideDefaults } from '@/config/guideDefaults'

/** Nothing stored (or unreadable): the defaults, with the code-written guides. */
const FALLBACK: ServiceLinks = {
  ...DEFAULT_LINKS,
  prepContent: withGuideDefaults({}, DEFAULT_PREP),
  afterCareContent: withGuideDefaults({}, DEFAULT_AFTERCARE),
}

export async function getLinks(): Promise<ServiceLinks> {
  try {
    const snap = await adminDb.collection('serviceLinks').doc('config').get()
    if (!snap.exists) return FALLBACK
    const data = snap.data() as Partial<ServiceLinks>
    // Keep only well-formed links with an actual destination
    const cleanLinks = (links: unknown) =>
      (Array.isArray(links) ? links : []).filter(
        (l): l is { label: string; url: string } =>
          !!l && typeof l.url === 'string' && l.url.trim() !== ''
      )
    const mainFooter = { ...DEFAULT_LINKS.mainFooter, ...(data.mainFooter ?? {}) }
    mainFooter.customLinks = cleanLinks(mainFooter.customLinks)
    const serviceFooter = { ...DEFAULT_LINKS.serviceFooter, ...(data.serviceFooter ?? {}) }
    serviceFooter.customLinks = cleanLinks(serviceFooter.customLinks)
    // Merge stored hours over defaults so all 7 days are always present and well-formed
    const storedHours = (data.hours ?? {}) as Partial<Record<DayKey, Partial<DayHours>>>
    const hours = Object.fromEntries(
      DAY_KEYS.map(d => [d, { ...DEFAULT_HOURS[d], ...(storedHours[d] ?? {}) }])
    ) as Record<DayKey, DayHours>
    return {
      mainFooter,
      serviceFooter,
      videos: data.videos ?? {},
      videoDates: data.videoDates ?? {},
      content: data.content ?? {},
      prepVideos: data.prepVideos ?? {},
      prepVideoDates: data.prepVideoDates ?? {},
      prepContent: withGuideDefaults(data.prepContent, DEFAULT_PREP),
      afterCareVideos: data.afterCareVideos ?? {},
      afterCareVideoDates: data.afterCareVideoDates ?? {},
      afterCareContent: withGuideDefaults(data.afterCareContent, DEFAULT_AFTERCARE),
      hours,
      resultsLinks: cleanLinks(data.resultsLinks),
    }
  } catch {
    return FALLBACK
  }
}
