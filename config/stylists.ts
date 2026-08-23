/**
 * Stylist VIP pass pages — /stylists/[slug].
 *
 * Each partner-salon stylist gets a page whose URL is printed as a QR code on
 * the back of their business cards, so **a slug here is permanent once cards go
 * to print**. Add a stylist by appending an entry; nothing else needs changing.
 *
 * Empty bookingUrl / reviewUrl / videoUrl are expected: the page hides or
 * placeholders those pieces until the real ones arrive.
 */

export interface Stylist {
  /** URL segment — printed on business cards. Never change after printing. */
  slug: string
  name: string
  /** Role line shown after the name, e.g. "Master Stylist & Colorist". */
  role: string
  salonName: string
  salonPhone: string
  /** Promo code the guest mentions at checkout. */
  promoCode: string
  /** Hair discount, as it appears in copy (e.g. "20%"). */
  discount: string
  /** Stylist's own booking portal. Empty → the button is hidden. */
  bookingUrl: string
  /** Google review link for the salon. Empty → the button is hidden. */
  reviewUrl: string
  /** 9:16 YouTube URL. Empty → "video coming soon" placeholder. */
  videoUrl: string
}

/** Magnolia Skin Center half of the page — identical across every stylist. */
export const MSC_OFFER = {
  eyebrow: 'Physician-led medical aesthetics',
  headline: 'Meet Dr. David & Nurse Eileen',
  /** Skin discount, as it appears in copy. */
  discount: '25%',
  /**
   * Consultation booking link for these pages. Deliberately separate from the
   * site-wide admin bookingUrl so the salon campaign can be pointed elsewhere
   * (or tracked) without moving every other page's CTA.
   */
  bookingUrl: 'https://calendar.app.google/z76kgHdK9DjC6a3T6',
  /** Shared 9:16 welcome video from Dr. David & Nurse Eileen. Empty → placeholder. */
  videoUrl: '',
}

export const STYLISTS: Stylist[] = [
  {
    slug: 'dylan-keith-lucy',
    name: 'Lucy',
    role: 'Master Stylist & Colorist',
    salonName: 'Dylan Keith Salon & Spa',
    salonPhone: '(818) 567-0700',
    promoCode: 'LUCY20',
    discount: '20%',
    bookingUrl: 'https://www.joinblvd.com/b/24773965-e963-4fcf-8282-512c10437d15/widget#/cart/menu',
    reviewUrl: '',
    videoUrl: '',
  },
]

export function getStylistBySlug(slug: string): Stylist | undefined {
  return STYLISTS.find(s => s.slug === slug)
}

export function getAllStylistSlugs(): string[] {
  return STYLISTS.map(s => s.slug)
}
