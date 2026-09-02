/**
 * Stylist VIP pass pages — /stylists/[slug].
 *
 * Each partner-salon stylist gets a page whose URL is printed as a QR code on
 * the back of their business cards, so **a slug here is permanent once cards go
 * to print**. Add a stylist by appending an entry; nothing else needs changing.
 *
 * Salon-level details (phone, booking, Google review link) live on the Salon
 * object rather than on each stylist — Google reviews attach to the business
 * listing, so every stylist at a salon shares one review link.
 *
 * Empty bookingUrl / reviewUrl / videoUrl are expected: the page hides or
 * placeholders those pieces until the real ones arrive.
 */

export interface Salon {
  name: string
  phone: string
  /** Shared by every stylist — Google reviews attach to the business listing. */
  reviewUrl: string
  bookingUrl: string
  /**
   * One code for the whole location, shared by every stylist here. It carries no
   * per-stylist information: the salon attributes the booking to whoever the
   * client picked at checkout, so a personal code would be extra setup for them
   * and one more thing to get wrong.
   */
  promoCode: string
  /** Hair discount, as it appears in copy (e.g. "20%"). */
  discount: string
  /**
   * Shown under the booking button. `{name}` is replaced with the stylist's
   * name, since this is shared across a salon's stylists.
   *
   * Phrase it as a statement of fact, not an instruction about the next screen:
   * Boulevard remembers the chosen location in session state, so the picker
   * appears on a guest's first visit but is skipped on every one after — and it
   * can't be deep-linked past either way. "Lucy is at the Burbank location"
   * stays true in both cases; "choose Burbank next" is wrong the second time.
   *
   * Empty → nothing renders (single-location salons need no note).
   */
  bookingNote: string
}

export interface Stylist {
  /** URL segment — printed on business cards. Never change after printing. */
  slug: string
  name: string
  /** Role line shown after the name, e.g. "Master Stylist & Colorist". */
  role: string
  salon: Salon
  /** 9:16 YouTube URL. Empty → "video coming soon" placeholder. */
  videoUrl: string
}

export const DYLAN_KEITH: Salon = {
  name: 'Dylan Keith Salon & Spa',
  phone: '(818) 567-0700',
  reviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ1cfVcH-VwoAREMugw_cBZ74',
  bookingUrl: 'https://www.joinblvd.com/b/24773965-e963-4fcf-8282-512c10437d15/widget#/cart/menu',
  promoCode: 'BURBANK20',
  discount: '20%',
  bookingNote: '{name} is at the Burbank location — 3508 W Magnolia Blvd (choose it if asked).',
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
    salon: DYLAN_KEITH,
    videoUrl: '',
  },
]

export function getStylistBySlug(slug: string): Stylist | undefined {
  return STYLISTS.find(s => s.slug === slug)
}

export function getAllStylistSlugs(): string[] {
  return STYLISTS.map(s => s.slug)
}
