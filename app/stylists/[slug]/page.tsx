import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLinks } from '@/lib/links'
import { getStylistBySlug, getAllStylistSlugs, MSC_OFFER } from '@/config/stylists'
import { TextUsButton, CallTextPills } from '@/components/Contact'
import RejuvenationVideo from '@/components/RejuvenationVideo'
import ShareVipPass from '@/components/ShareVipPass'
import LegalLinks from '@/components/LegalLinks'

// Cached/ISR: served instantly from the CDN, regenerated at most once a minute.
export const revalidate = 60

export function generateStaticParams() {
  return getAllStylistSlugs().map(slug => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const stylist = getStylistBySlug(params.slug)
  if (!stylist) return {}
  return {
    title: `Meet ${stylist.name} | ${stylist.salon.name} × Magnolia Skin Center`,
    description: `${stylist.discount} off your first service with ${stylist.name} at ${stylist.salon.name}, plus ${MSC_OFFER.discount} off your first clinical treatment at Magnolia Skin Center down the hall.`,
    // Reached by QR code from a printed card — keeping it out of search stops the
    // promo codes from being scraped into coupon sites.
    robots: { index: false, follow: false },
  }
}

const CameraIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
)
const StarIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
)
const PhoneIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)
const PinIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const SearchIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
  </svg>
)
const CalendarIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const serif = { fontFamily: 'var(--font-cormorant), Georgia, serif' }

// Shared button shapes so the two halves of the page stay visually consistent.
const primaryBtn =
  'w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white text-base font-semibold px-8 py-4 rounded-xl transition-all'
const outlineBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-plum-900/20 text-plum-900 bg-white hover:border-plum-900/40 hover:bg-plum-900/[0.03] text-sm font-semibold px-6 py-3.5 transition-colors'

export default async function StylistPage({ params }: { params: { slug: string } }) {
  const stylist = getStylistBySlug(params.slug)
  if (!stylist) notFound()

  const links = await getLinks()
  const { mainFooter: f } = links
  const salon = stylist.salon
  const salonTel = `tel:+1${salon.phone.replace(/\D/g, '').slice(-10)}`

  const shareTitle = `${salon.name} × Magnolia Skin Center VIP Pass`
  const shareMessage = `Here's a VIP pass for ${salon.name} and Magnolia Skin Center: ${stylist.discount} off hair with ${stylist.name} (code ${stylist.promoCode}), plus ${MSC_OFFER.discount} off your first clinical skin treatment down the hall.`

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/wordmark-white.webp" alt="Magnolia Skin Center" width={380} height={141} fetchPriority="high" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-white/70 hover:text-white font-medium transition-colors">
              All Services
            </Link>
            <TextUsButton phone={f.phone} variant="dark" className="hidden sm:inline-flex" />
          </div>
        </div>
      </header>

      <main>
        {/* ───────────── Salon half ───────────── */}
        <section className="max-w-2xl mx-auto px-6 pt-14 pb-10 text-center">
          <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-3">{salon.name}</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-plum-900 mb-5 leading-tight" style={serif}>
            Meet {stylist.name}: {stylist.role}
          </h1>

          {/* Promo callout */}
          <div className="inline-block rounded-2xl border border-brand-200 bg-brand-50 px-6 py-4 mb-8">
            <p className="text-base text-plum-900">
              <span className="font-semibold">Friends &amp; Family Pass:</span> enjoy {stylist.discount} off your
              first hair service with {stylist.name}.
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Mention or enter code{' '}
              <span className="font-semibold tracking-wider text-brand-700">{stylist.promoCode}</span> at checkout.
            </p>
          </div>

          <RejuvenationVideo
            url={stylist.videoUrl}
            title={`${stylist.name} — ${stylist.role} at ${salon.name}`}
            subject={stylist.name}
            placeholderNote={`A quick hello from ${stylist.name} is on the way.`}
          />

          <div className="mt-8 space-y-3">
            {salon.bookingUrl && (
              <div>
                <a href={salon.bookingUrl} target="_blank" rel="noopener noreferrer" className={primaryBtn}>
                  <CalendarIcon className="w-5 h-5 shrink-0" />
                  Book with {stylist.name} — save {stylist.discount}
                </a>
                {/* The salon's booking widget shows a location picker on a first
                    visit and skips it afterwards, so this states where the
                    stylist works rather than describing the next screen. */}
                {salon.bookingNote && (
                  <p className="flex items-start justify-center gap-1.5 text-sm text-gray-600 mt-2.5 px-2">
                    <PinIcon className="w-4 h-4 shrink-0 mt-0.5 text-brand-600" />
                    <span>{salon.bookingNote.replace('{name}', stylist.name)}</span>
                  </p>
                )}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {salon.reviewUrl && (
                <a href={salon.reviewUrl} target="_blank" rel="noopener noreferrer" className={outlineBtn}>
                  <StarIcon className="w-4 h-4 shrink-0 text-brand-600" />
                  Leave {stylist.name} a review
                </a>
              )}
              <a href={salonTel} className={outlineBtn}>
                <PhoneIcon className="w-4 h-4 shrink-0" />
                Call {salon.phone}
              </a>
            </div>

            <ShareVipPass salonName={salon.name} title={shareTitle} message={shareMessage} />
          </div>
        </section>

        {/* ───────────── Divider ───────────── */}
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-plum-900/15" />
            <span className="text-xs font-semibold uppercase tracking-widest text-plum-900/50 text-center">
              Located right down the hall
            </span>
            <span className="h-px flex-1 bg-plum-900/15" />
          </div>
        </div>

        {/* ───────────── Magnolia Skin Center half ───────────── */}
        <section className="max-w-2xl mx-auto px-6 pt-8 pb-16 text-center">
          <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-3">{MSC_OFFER.eyebrow}</p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-plum-900 mb-5 leading-tight" style={serif}>
            {MSC_OFFER.headline}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Claim {MSC_OFFER.discount} off your first clinical treatment, plus a complimentary 15-minute consultation
            with David McDonough, MD and Eileen Kenny, RN.
          </p>

          <RejuvenationVideo
            url={MSC_OFFER.videoUrl}
            title="Dr. David & Nurse Eileen welcome salon guests"
            subject="Dr. David & Nurse Eileen"
            placeholderNote="A welcome message for salon guests is on the way."
          />

          <h3 className="text-2xl font-semibold text-plum-900 mt-10 mb-6" style={serif}>
            Ready to start your skin journey?
          </h3>

          <div className="space-y-3">
            <a href={MSC_OFFER.bookingUrl} target="_blank" rel="noopener noreferrer" className={primaryBtn}>
              <CameraIcon className="w-5 h-5 shrink-0" />
              Book a Complimentary 15-Minute Video Call
            </a>
            <Link href="/" className={`${outlineBtn} w-full`}>
              <SearchIcon className="w-4 h-4 shrink-0" />
              Search skin concerns &amp; treatments
            </Link>
          </div>

          {f.phone && <CallTextPills phone={f.phone} variant="light" className="mt-8" />}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-plum-900 border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            {f.address && <p className="text-white/50 text-sm">{f.address}</p>}
            {f.phone && (
              <a href={`tel:+1${f.phone.replace(/\D/g, '').slice(-10)}`}
                className="block text-white/50 hover:text-white/70 text-sm transition-colors">{f.phone}</a>
            )}
            {f.email && (
              <a href={`mailto:${f.email}`}
                className="block text-white/50 hover:text-white/70 text-sm transition-colors">{f.email}</a>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
            {f.websiteUrl && (
              <a href={f.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors">magnoliaskincenter.com</a>
            )}
            <Link href="/" className="text-white/50 hover:text-white transition-colors">All Services</Link>
            <LegalLinks />
          </div>
        </div>
      </footer>
    </div>
  )
}
