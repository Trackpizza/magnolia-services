// Centralized structured-data builders for LocalBusiness + Service schema.
// These feed Google's business panel / maps / AI overviews. The business facts
// here are the SEO source of truth; if the address or phone changes, update them.

export const SITE_URL = 'https://services.magnoliaskincenter.com'
export const BUSINESS_ID = `${SITE_URL}/#business`

const BUSINESS = {
  name: 'Magnolia Skin Center',
  streetAddress: '3506 1/2 W Magnolia Blvd',
  addressLocality: 'Burbank',
  addressRegion: 'CA',
  postalCode: '91505',
  addressCountry: 'US',
  defaultTelephone: '+1-747-305-8973',
} as const

// Normalize a display phone like "(747) 305-8973" to E.164-ish "+1-747-305-8973".
function normalizePhone(raw?: string): string {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (digits.length === 10) return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  if (digits.length === 11 && digits.startsWith('1')) return `+1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  return BUSINESS.defaultTelephone
}

const DAY_SCHEMA: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
  friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
}

type HoursInput = Record<string, { open: string; close: string; closed: boolean }>

// Build openingHoursSpecification, skipping closed days and any without both times.
function openingHoursSpec(hours?: HoursInput) {
  if (!hours) return []
  return Object.entries(hours)
    .filter(([, h]) => h && !h.closed && h.open && h.close)
    .map(([day, h]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DAY_SCHEMA[day] ?? day,
      opens: h.open,
      closes: h.close,
    }))
}

// MedicalBusiness (a LocalBusiness subtype) for the homepage.
export function localBusinessLd(opts?: { telephone?: string; sameAs?: string[]; hours?: HoursInput }) {
  const sameAs = (opts?.sameAs ?? []).filter(u => u && u.trim() !== '')
  const spec = openingHoursSpec(opts?.hours)
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': BUSINESS_ID,
    name: BUSINESS.name,
    url: SITE_URL,
    image: `${SITE_URL}/icon.png`,
    telephone: normalizePhone(opts?.telephone),
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      addressRegion: BUSINESS.addressRegion,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    },
    areaServed: { '@type': 'City', name: 'Burbank' },
    ...(spec.length ? { openingHoursSpecification: spec } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}

// Service offered, linked back to the business as provider.
export function serviceLd(opts: { name: string; description: string; slug: string; category: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    serviceType: opts.category,
    url: `${SITE_URL}/services/${opts.slug}`,
    provider: { '@type': 'MedicalBusiness', '@id': BUSINESS_ID, name: BUSINESS.name },
    areaServed: { '@type': 'City', name: 'Burbank' },
  }
}
