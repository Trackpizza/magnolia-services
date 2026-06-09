import { adminDb } from './firebase/admin'
import type { ServiceLinks } from './types'
import { DEFAULT_LINKS } from './types'

export async function getLinks(): Promise<ServiceLinks> {
  try {
    const snap = await adminDb.collection('serviceLinks').doc('config').get()
    if (!snap.exists) return DEFAULT_LINKS
    const data = snap.data() as Partial<ServiceLinks>
    return {
      mainFooter: { ...DEFAULT_LINKS.mainFooter, ...(data.mainFooter ?? {}) },
      serviceFooter: { ...DEFAULT_LINKS.serviceFooter, ...(data.serviceFooter ?? {}) },
      videos: data.videos ?? {},
      content: data.content ?? {},
    }
  } catch {
    return DEFAULT_LINKS
  }
}
