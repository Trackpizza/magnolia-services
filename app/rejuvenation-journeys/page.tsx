import type { Metadata } from 'next'
import Link from 'next/link'
import { getLinks } from '@/lib/links'
import { TextUsButton, CallTextPills } from '@/components/Contact'
import RejuvenationVideo from '@/components/RejuvenationVideo'
import LegalLinks from '@/components/LegalLinks'

// Cached/ISR: served instantly from the CDN, regenerated at most once a minute.
export const revalidate = 60

// Both practitioners' own rejuvenation videos. Empty → "coming soon" placeholder.
const VIDEOS = [
  {
    url: 'https://youtu.be/tVJwuEpdXvQ',
    name: 'David McDonough, MD',
    subject: 'Dr. David',
    role: 'Medical Director',
    caption: 'Watch Dr. David address his heavy brows and under-eye bags without surgery.',
  },
  {
    url: 'https://youtu.be/POZHNnnFUUI',
    name: 'Eileen Kenny, RN',
    subject: 'Nurse Eileen',
    role: 'Lead Practitioner',
    caption: 'See Nurse Eileen’s two-year journey to restore facial volume and lift sagging jowls.',
  },
]

// Emailed directly to patients — keep it out of search indexes.
export const metadata: Metadata = {
  title: 'Rebuilding Our Skin | Magnolia Skin Center',
  description:
    "A personal look at how Lead Practitioner Eileen Kenny, RN, and Medical Director David McDonough, MD, addressed their own facial laxity and skin concerns using Magnolia Skin Center's non-surgical technologies.",
  robots: { index: false, follow: false },
}

const CameraIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
)

const serif = { fontFamily: 'var(--font-cormorant), Georgia, serif' }

export default async function RejuvenationJourneysPage() {
  const links = await getLinks()
  const { mainFooter: f } = links

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
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
          <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-3">
            A note from Magnolia Skin Center
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-plum-900 mb-5 leading-tight" style={serif}>
            Rebuilding Our Skin: Our Personal Rejuvenation Journeys.
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            A personal look at how Lead Practitioner Eileen Kenny, RN, and Medical Director David McDonough, MD,
            addressed their own facial laxity and skin concerns using Magnolia Skin Center&apos;s non-surgical
            technologies.
          </p>
        </section>

        {/* The two journeys — side by side on desktop, stacked on phones. */}
        <section className="max-w-4xl mx-auto px-6 pb-14">
          <div className="grid sm:grid-cols-2 gap-10 sm:gap-8">
            {VIDEOS.map(v => (
              <div key={v.subject}>
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1 text-center">
                  {v.role}
                </p>
                <p className="text-xl font-semibold text-plum-900 mb-4 text-center" style={serif}>
                  {v.name}
                </p>
                <RejuvenationVideo
                  url={v.url}
                  title={`${v.name} — personal rejuvenation journey`}
                  subject={v.subject}
                />
                <p className="text-base text-gray-600 leading-relaxed mt-4 text-center max-w-xs mx-auto">
                  {v.caption}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Booking */}
        <section className="max-w-3xl mx-auto px-6 pb-16 text-center">
          <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-3">Appointments</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-plum-900 mb-4" style={serif}>
            Book Your Appointment
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto">
            Start with a complimentary 15-minute video consultation. Pick a time that works for you and we&apos;ll
            help you find the treatment that&apos;s right for you.
          </p>
          <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors">
            <CameraIcon className="w-5 h-5 shrink-0" />
            Book a Complimentary 15-Minute Video Call
          </a>
          {f.phone && <CallTextPills phone={f.phone} variant="light" className="mt-6" />}
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
