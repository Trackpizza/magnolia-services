export interface ServiceLinks {
  mainFooter: {
    address: string
    phone: string
    email: string
    bookingUrl: string
    membershipUrl: string
    instagramUrl: string
    facebookUrl: string
    websiteUrl: string
  }
  serviceFooter: {
    bookingUrl: string
    membershipUrl: string
    phone: string
  }
  videos: Record<string, string>  // slug → YouTube URL (empty = show placeholder)
}

export const DEFAULT_LINKS: ServiceLinks = {
  mainFooter: {
    address: '3506½ W Magnolia Blvd, Burbank, CA 91505',
    phone: '(747) 305-8973',
    email: '',
    bookingUrl: 'https://www.magnoliaskincenter.com/zoom',
    membershipUrl: process.env.NEXT_PUBLIC_MEMBERSHIP_URL ?? 'https://magnolia-membership--magscmembership.us-east4.hosted.app',
    instagramUrl: '',
    facebookUrl: '',
    websiteUrl: 'https://www.magnoliaskincenter.com',
  },
  serviceFooter: {
    bookingUrl: 'https://www.magnoliaskincenter.com/zoom',
    membershipUrl: process.env.NEXT_PUBLIC_MEMBERSHIP_URL ?? 'https://magnolia-membership--magscmembership.us-east4.hosted.app',
    phone: '(747) 305-8973',
  },
  videos: {},
}
