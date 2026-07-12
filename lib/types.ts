export interface FooterLink {
  label: string
  url: string
}

export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface DayHours {
  open: string   // "HH:MM" 24h (empty = not set)
  close: string  // "HH:MM" 24h (empty = not set)
  closed: boolean
}

export const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const DEFAULT_HOURS: Record<DayKey, DayHours> =
  Object.fromEntries(DAY_KEYS.map(d => [d, { open: '', close: '', closed: false }])) as Record<DayKey, DayHours>

export interface ServiceLinks {
  mainFooter: {
    address: string
    phone: string
    email: string
    bookingUrl: string
    websiteUrl: string
    customLinks: FooterLink[]  // arbitrary named links shown in the footer link row
  }
  serviceFooter: {
    bookingUrl: string
    phone: string
    customLinks: FooterLink[]  // named links shown in the footer of every service detail page
  }
  videos: Record<string, string>  // id → main treatment YouTube URL (empty = show placeholder)
  videoDates: Record<string, string>  // id → upload date (YYYY-MM-DD) for VideoObject structured data
  content: Record<string, string>  // id → markdown shown under "How it works" (empty = hide)
  prepVideos: Record<string, string>     // id → Pre-Treatment & Planning Guide video
  prepVideoDates: Record<string, string> // id → prep video upload date (YYYY-MM-DD) for VideoObject
  prepContent: Record<string, string>    // id → Pre-Treatment & Planning Guide markdown
  afterCareVideos: Record<string, string>  // id → After Care video
  afterCareVideoDates: Record<string, string> // id → after-care video upload date for VideoObject
  afterCareContent: Record<string, string> // id → After Care markdown
  hours: Record<DayKey, DayHours>  // business hours → openingHoursSpecification schema
}

export const DEFAULT_LINKS: ServiceLinks = {
  mainFooter: {
    address: '3506½ W Magnolia Blvd, Burbank, CA 91505',
    phone: '(747) 305-8973',
    email: '',
    bookingUrl: 'https://www.magnoliaskincenter.com/zoom',
    websiteUrl: 'https://www.magnoliaskincenter.com',
    customLinks: [],
  },
  serviceFooter: {
    bookingUrl: 'https://www.magnoliaskincenter.com/zoom',
    phone: '(747) 305-8973',
    customLinks: [],
  },
  videos: {},
  videoDates: {},
  content: {},
  prepVideos: {},
  prepVideoDates: {},
  prepContent: {},
  afterCareVideos: {},
  afterCareVideoDates: {},
  afterCareContent: {},
  hours: DEFAULT_HOURS,
}
