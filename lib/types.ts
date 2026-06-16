export interface FooterLink {
  label: string
  url: string
}

export interface ServiceLinks {
  mainFooter: {
    address: string
    phone: string
    email: string
    bookingUrl: string
    membershipUrl: string
    websiteUrl: string
    customLinks: FooterLink[]  // arbitrary named links shown in the footer link row
  }
  serviceFooter: {
    bookingUrl: string
    membershipUrl: string
    phone: string
    customLinks: FooterLink[]  // named links shown in the footer of every service detail page
  }
  videos: Record<string, string>  // id → main treatment YouTube URL (empty = show placeholder)
  content: Record<string, string>  // id → markdown shown under "How it works" (empty = hide)
  prepVideos: Record<string, string>     // id → Pre-Treatment & Planning Guide video
  prepContent: Record<string, string>    // id → Pre-Treatment & Planning Guide markdown
  afterCareVideos: Record<string, string>  // id → After Care video
  afterCareContent: Record<string, string> // id → After Care markdown
}

export const DEFAULT_LINKS: ServiceLinks = {
  mainFooter: {
    address: '3506½ W Magnolia Blvd, Burbank, CA 91505',
    phone: '(747) 305-8973',
    email: '',
    bookingUrl: 'https://www.magnoliaskincenter.com/zoom',
    membershipUrl: process.env.NEXT_PUBLIC_MEMBERSHIP_URL ?? 'https://magnolia-membership--magscmembership.us-east4.hosted.app',
    websiteUrl: 'https://www.magnoliaskincenter.com',
    customLinks: [],
  },
  serviceFooter: {
    bookingUrl: 'https://www.magnoliaskincenter.com/zoom',
    membershipUrl: process.env.NEXT_PUBLIC_MEMBERSHIP_URL ?? 'https://magnolia-membership--magscmembership.us-east4.hosted.app',
    phone: '(747) 305-8973',
    customLinks: [],
  },
  videos: {},
  content: {},
  prepVideos: {},
  prepContent: {},
  afterCareVideos: {},
  afterCareContent: {},
}
