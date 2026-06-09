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
  }
  videos: Record<string, string>  // slug → YouTube URL (empty = show placeholder)
  content: Record<string, string>  // slug → markdown shown under "How it works" (empty = hide)
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
  },
  videos: {},
  content: {},
}
