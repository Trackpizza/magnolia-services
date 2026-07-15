import type { Metadata } from 'next'
import Link from 'next/link'
import { getLinks } from '@/lib/links'
import { localBusinessLd } from '@/lib/schema'
import { DAY_KEYS, type DayKey } from '@/lib/types'

// Cached/ISR: served instantly from the CDN. Regenerates in the background at most
// once per minute, and immediately when the admin saves (revalidate hook).
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Book an Appointment | Magnolia Skin Center',
  description:
    'Book your complimentary 15-minute video consultation with Magnolia Skin Center in Burbank, CA. Pick a time online and meet our team.',
}

const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
  friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
}

// "14:30" -> "2:30 PM"
function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm
  const period = h < 12 ? 'AM' : 'PM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

const CameraIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
)

export default async function BookingsPage() {
  const links = await getLinks()
  const { mainFooter: f, hours } = links

  const businessLd = localBusinessLd({
    telephone: f.phone,
    sameAs: f.customLinks.map(l => l.url),
    hours,
  })

  const mapsUrl = f.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Magnolia Skin Center, ${f.address}`)}`
    : null

  const anyHoursSet = DAY_KEYS.some(d => !hours[d].closed && hours[d].open && hours[d].close)

  return (
    <div className="min-h-screen bg-cream-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessLd) }}
      />

      {/* Header */}
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/wordmark-white.webp" alt="Magnolia Skin Center" width={380} height={141} fetchPriority="high" className="h-9 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white font-medium transition-colors">
            All Services
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-3">Appointments</p>
        <h1 className="text-5xl font-semibold text-plum-900 mb-4" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
          Book Your Appointment
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed mb-8 max-w-xl mx-auto">
          Start with a complimentary 15-minute video consultation. Pick a time that works for you and we&apos;ll help you find the treatment that&apos;s right for you.
        </p>
        <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors">
          <CameraIcon className="w-5 h-5 shrink-0" />
          Book a Free 15-Minute Video Call
        </a>
        {f.phone && (
          <p className="text-sm text-gray-500 mt-5">
            Prefer to talk?{' '}
            <a href={`tel:${f.phone.replace(/\D/g, '')}`} className="text-brand-600 hover:text-brand-700 font-medium">
              Call {f.phone}
            </a>
          </p>
        )}
      </section>

      {/* What to expect */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-2xl font-semibold text-plum-900 mb-8 text-center" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            What to expect
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: '1', title: 'Pick a time', body: 'Choose an available slot on our online calendar — it only takes a minute.' },
              { n: '2', title: 'Get your video link', body: 'You’ll receive a confirmation with a secure video link for your call.' },
              { n: '3', title: 'Meet our team', body: 'Join from anywhere and get personalized guidance on the right treatment for you.' },
            ].map(step => (
              <div key={step.n} className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold mb-4">{step.n}</div>
                <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit info */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {/* Location */}
          {f.address && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">Location</p>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{f.address}</p>
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  Get directions &rarr;
                </a>
              )}
            </div>
          )}

          {/* Phone */}
          {f.phone && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">Call us</p>
              <a href={`tel:${f.phone.replace(/\D/g, '')}`} className="text-sm text-gray-700 hover:text-brand-600 transition-colors">{f.phone}</a>
              {f.email && (
                <a href={`mailto:${f.email}`} className="block text-sm text-gray-700 hover:text-brand-600 transition-colors mt-1">{f.email}</a>
              )}
            </div>
          )}

          {/* Hours */}
          {anyHoursSet && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">Hours</p>
              <dl className="space-y-1">
                {DAY_KEYS.map(d => (
                  <div key={d} className="flex justify-between gap-3 text-sm">
                    <dt className="text-gray-500">{DAY_LABELS[d]}</dt>
                    <dd className="text-gray-700 font-medium">
                      {hours[d].closed || !hours[d].open || !hours[d].close
                        ? 'Closed'
                        : `${to12h(hours[d].open)} – ${to12h(hours[d].close)}`}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-plum-900 py-16 mt-6">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            Ready to invest in yourself?
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Book your complimentary video consultation now, or browse our full menu of treatments first.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-8 py-3.5 rounded-xl transition-colors">
              <CameraIcon className="w-5 h-5 shrink-0" />
              Book a Video Call
            </a>
            <Link href="/" className="inline-flex items-center gap-2 border border-white/25 text-white/80 hover:text-white hover:border-white/50 text-sm font-semibold px-8 py-3.5 rounded-xl transition-colors">
              Browse all services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-plum-900 border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            {f.address && <p className="text-white/50 text-sm">{f.address}</p>}
            {f.phone && (
              <a href={`tel:${f.phone.replace(/\D/g, '')}`}
                className="block text-white/50 hover:text-white/70 text-sm transition-colors">{f.phone}</a>
            )}
            {f.email && (
              <a href={`mailto:${f.email}`}
                className="block text-white/50 hover:text-white/70 text-sm transition-colors">{f.email}</a>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
            {f.customLinks.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors">{link.label || link.url}</a>
            ))}
            {f.websiteUrl && (
              <a href={f.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors">magnoliaskincenter.com</a>
            )}
            <Link href="/" className="text-white/50 hover:text-white transition-colors">All Services</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
