import type { Metadata } from 'next'
import Link from 'next/link'
import { getLinks } from '@/lib/links'
import { TextUsButton, CallTextPills } from '@/components/Contact'
import RejuvenationVideo from '@/components/RejuvenationVideo'
import LegalLinks from '@/components/LegalLinks'

// Cached/ISR: served instantly from the CDN, regenerated at most once a minute.
export const revalidate = 60

// Same clip as on /rejuvenation-journeys. This is the corrected re-upload — the
// original (POZHNnnFUUI) shipped with the wrong captions. Empty here would fall
// back to RejuvenationVideo's "video coming soon" placeholder.
const VIDEO_URL = 'https://youtu.be/UkaYO_MHa3g'

const HEADLINE = 'Rebuilding My Skin from Within: My Personal Rejuvenation Journey.'
const SUBHEAD =
  "An inside look at how Lead Practitioner Eileen Kenny, RN, addressed her own skin concerns using Magnolia Skin Center's non-surgical technologies."

// Emailed directly to patients — keep it out of search indexes.
export const metadata: Metadata = {
  title: 'Rebuilding My Skin from Within | Eileen Kenny, RN',
  description: SUBHEAD,
  robots: { index: false, follow: false },
}

const CameraIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
)

export default async function NurseEileenRejuvenationPage() {
  const links = await getLinks()
  const { mainFooter: f } = links

  // The business line, not a personal one — unlike Dr. David's page, which uses
  // his direct number. Read from admin config so it follows any change made in
  // /admin rather than being pinned here.
  const phone = f.phone

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
            <TextUsButton phone={phone} variant="dark" className="hidden sm:inline-flex" />
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center">
          <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-3">A note from Nurse Eileen</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-plum-900 mb-5 leading-tight" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            {HEADLINE}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            {SUBHEAD}
          </p>
        </section>

        {/* Video */}
        <section className="max-w-3xl mx-auto px-6 pb-12">
          <RejuvenationVideo url={VIDEO_URL} title="Eileen Kenny, RN — Rebuilding My Skin from Within" subject="Nurse Eileen" />
        </section>

        {/* Booking CTA */}
        <section className="max-w-3xl mx-auto px-6 pb-16 text-center">
          <h2 className="text-3xl font-semibold text-plum-900 mb-3" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            Ready to start your own journey?
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto">
            Book a complimentary 15-minute video consultation and we&apos;ll help you build a plan that&apos;s right for you.
          </p>
          <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors">
            <CameraIcon className="w-5 h-5 shrink-0" />
            Book a Complimentary 15-Minute Video Call
          </a>
          <CallTextPills
            phone={phone}
            variant="light"
            className="mt-6"
            lead="Prefer to call or text us?"
            callLabel={phone}
            textLabel={phone}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-plum-900 border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            {f.address && <p className="text-white/50 text-sm">{f.address}</p>}
            {phone && (
              <a href={`tel:+1${phone.replace(/\D/g, '').slice(-10)}`}
                className="block text-white/50 hover:text-white/70 text-sm transition-colors">{phone}</a>
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
