import { adminDb } from './firebase/admin'
import type { ServiceLinks } from './types'
import { DEFAULT_LINKS } from './types'

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
    return {
      mainFooter,
      serviceFooter,
      videos: data.videos ?? {},
      videoDates: data.videoDates ?? {},
      content: data.content ?? {},
      prepVideos: data.prepVideos ?? {},
      prepContent: data.prepContent ?? {},
      afterCareVideos: data.afterCareVideos ?? {},
      afterCareContent: data.afterCareContent ?? {},
    }
  } catch {
    return DEFAULT_LINKS
  }
}
