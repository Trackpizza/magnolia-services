import { adminDb } from './firebase/admin'
import type { ServiceLinks, DayKey, DayHours } from './types'
import { DEFAULT_LINKS, DAY_KEYS, DEFAULT_HOURS } from './types'

export async function getLinks(): Promise<ServiceLinks> {
  try {
    const snap = await adminDb.collection('serviceLinks').doc('config').get()
    if (!snap.exists) return DEFAULT_LINKS
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
      prepContent: data.prepContent ?? {},
      afterCareVideos: data.afterCareVideos ?? {},
      afterCareVideoDates: data.afterCareVideoDates ?? {},
      afterCareContent: data.afterCareContent ?? {},
      hours,
    }
  } catch {
    return DEFAULT_LINKS
  }
}
