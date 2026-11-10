import type { Metadata } from 'next'
import Link from 'next/link'
import { getLinks } from '@/lib/links'
import { CallTextPills } from '@/components/Contact'

// PLACEHOLDER (11-09, Eric): the Burbank street-event club flyer's QR code
// points here ("Explore our clinical treatment packages — Holiday Specials").
// The real page comes later, from the records app's Packages tab (a "Show on
// website" tick per package, a holiday-special tick, a "show until" date).
// Until then the three specials are written here, in the flyer's own words,
// with the prices from the Packages tab on 11-09. Change them here (and
// redeploy) if Eileen changes them before the real page lands.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Holiday Specials — Treatment Packages | Magnolia Skin Center',
  description: 'PRX Glow & Laser, NAD+ cellular injections and Vitamin B12 boosts — holiday package prices at Magnolia Skin Center, Burbank.',
  robots: { index: false, follow: false },
}

type Special = { title: string; package: string; visits: string; price: number; perVisit: string; blurb: string; includes?: string }

const SPECIALS: Special[] = [
  {
    title: 'PRX Glow & Laser',
    package: 'PRX Plus or PRX C',
    visits: '4 treatments',
    price: 1200,
    perVisit: '$300 a treatment',
    blurb: 'Your choice of PRX Plus or PRX C.',
    includes: 'Includes 2 Micro Lasers',
  },
  {
    title: 'NAD+ Cellular Injections',
    package: 'NAD+ Injections',
    visits: '10 injections',
    price: 600,
    perVisit: '$60 an injection',
    blurb: 'Supercharge cellular energy and clear brain fog.',
  },
  {
    title: 'Vitamin B12 Boosts',
    package: 'Vitamin B12 Injections',
    visits: '10 injections',
    price: 250,
    perVisit: '$25 an injection',
    blurb: 'Combat fatigue and restore daily energy.',
  },
]

function e164(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('1')) return `+${d}`
  if (d.length === 10) return `+1${d}`
  return `+${d}`
}

export default async function PackagesPage() {
  const links = await getLinks()
  const phone = links.mainFooter.phone
  const bookingUrl = links.mainFooter.bookingUrl
  const serif = { fontFamily: 'var(--font-cormorant), Georgia, serif' }
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-plum-900">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/wordmark-white.webp" alt="Magnolia Skin Center" width={380} height={141} className="h-9 w-auto" />
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-2">Clinical treatment packages</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-plum-900 leading-tight" style={serif}>
            Holiday Specials
          </h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Package prices for the season. Text us to book or ask a question — Nurse Eileen will set it up with you.
          </p>
        </div>

        <ul className="space-y-5">
          {SPECIALS.map((s) => {
            const body = `Hi! I saw the Holiday Special for ${s.title} on your flyer — I'd like to know more.`
            const sms = phone ? `sms:${e164(phone)}?&body=${encodeURIComponent(body)}` : ''
            return (
              <li key={s.title} className="rounded-2xl border border-brand-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-plum-900" style={serif}>
                    {s.title}
                  </h2>
                  <p className="text-2xl font-semibold text-plum-900">${s.price.toLocaleString('en-US')}</p>
                </div>
                <p className="mt-1 text-sm text-gray-700">
                  {s.package} · {s.visits} · <span className="text-gray-500">{s.perVisit}</span>
                </p>
                {s.includes && <p className="mt-2 text-sm font-semibold text-brand-700">★ {s.includes}</p>}
                <p className="mt-3 text-gray-700">{s.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sms && (
                    <a
                      href={sms}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                    >
                      💬 Text us about this
                    </a>
                  )}
                  {phone && (
                    <a
                      href={`tel:${e164(phone)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
                    >
                      📞 Call
                    </a>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <div className="mt-10 rounded-2xl bg-plum-900 px-6 py-8 text-center text-white">
          <p className="text-2xl font-semibold" style={serif}>
            Not sure which is right for you?
          </p>
          <p className="mt-2 text-sm text-white/80">Book a free consultation, or text or call us.</p>
          {bookingUrl && (
            <a
              href={bookingUrl}
              className="mt-4 inline-flex items-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Book a consultation
            </a>
          )}
          {phone && <CallTextPills phone={phone} variant="dark" className="mt-4 justify-center" />}
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          <Link href="/" className="underline hover:text-gray-900">
            See all our treatments →
          </Link>
        </p>
      </main>
    </div>
  )
}
