import type { Metadata } from 'next'
import Link from 'next/link'
import { getLinks } from '@/lib/links'
import { CallTextPills } from '@/components/Contact'
import PackageCard, { type WebsitePackage } from './PackageCard'

// THE REAL PAGE (11-19, Eric) — replaces the 11-09 placeholder with its
// hard-coded prices. The packages come from the records app's Packages tab:
// every package that is Offered and ticked "🌐 Show on the website", not past
// its "Show until" day, holiday specials first (records
// /api/public/packages — the clinic's catalogue only, no client data).
// Built there, on this page within a minute: no code change, no rollout.
//
// No Stripe yet: "Text Eileen to start", pay at the first visit.
// The Burbank event flyer's QR code points here.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Treatment Packages & Holiday Specials | Magnolia Skin Center',
  description: 'Treatment packages and holiday specials at Magnolia Skin Center, Burbank — text Nurse Eileen to start, pay at your first visit.',
  robots: { index: false, follow: false },
}

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

/**
 * NEVER BLANK AFTER A SAVE (11-20, Eric: "I changed B12 … the page went back to
 * not showing anything, then 30 seconds later a refresh got it back").
 *
 * The page rebuilds every minute; one rebuild that couldn't reach the records
 * app (a slow or cold moment) used to cache "being updated" for a minute. Now:
 * two tries (8 s each), then the LAST GOOD list this server already showed,
 * and if there is none, a THROW — Next keeps serving the previous good page
 * when a rebuild fails, and error.tsx retries by itself. The "being updated"
 * box is only for a real empty list (nothing ticked).
 */
let lastGood: WebsitePackage[] | null = null

async function fetchOnce(): Promise<WebsitePackage[]> {
  const res = await fetch(`${API}/api/public/packages`, {
    // Stays a once-a-minute cached page (fast for a QR scan), not a live call per visitor.
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`packages feed ${res.status}`)
  const d = (await res.json()) as { packages?: WebsitePackage[] }
  if (!Array.isArray(d.packages)) throw new Error('packages feed: bad body')
  return d.packages
}

async function loadPackages(): Promise<WebsitePackage[] | null> {
  if (!API) return null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      lastGood = await fetchOnce()
      return lastGood
    } catch (err) {
      console.warn('packages feed failed', attempt + 1, err instanceof Error ? err.message : err)
      if (attempt === 0) await new Promise((r) => setTimeout(r, 1500))
    }
  }
  if (lastGood) return lastGood
  // At build time a failure must not break the deploy — the page fixes itself on the first rebuild.
  if (process.env.NEXT_PHASE === 'phase-production-build') return null
  throw new Error('packages feed unreachable')
}

function e164(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('1')) return `+${d}`
  if (d.length === 10) return `+1${d}`
  return `+${d}`
}

export default async function PackagesPage() {
  const [links, packages] = await Promise.all([getLinks(), loadPackages()])
  const phone = links.mainFooter.phone
  const bookingUrl = links.mainFooter.bookingUrl
  const serif = { fontFamily: 'var(--font-cormorant), Georgia, serif' }
  const anySpecial = (packages ?? []).some((p) => p.special)
  const askBody = encodeURIComponent("Hi Eileen! I'd like to hear about your treatment packages.")
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
          <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-2">
            {anySpecial ? 'Holiday specials' : 'Clinical treatment packages'}
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-plum-900 leading-tight" style={serif}>
            Treatment Packages
          </h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Text Nurse Eileen to start a package — she&rsquo;ll set it up with you. Nothing to pay online: you pay at
            your first visit.
          </p>
        </div>

        {packages && packages.length > 0 ? (
          <ul className="space-y-5">
            {packages.map((p) => (
              <PackageCard key={p.id} p={p} phone={phone ?? ''} />
            ))}
          </ul>
        ) : (
          // The feed failed or nothing is ticked yet: never a blank page for a flyer scan.
          <div className="rounded-2xl border border-brand-200 bg-white p-6 text-center shadow-sm">
            <p className="text-lg text-gray-800">Our current packages are being updated.</p>
            <p className="mt-1 text-sm text-gray-600">Text Eileen and she&rsquo;ll tell you what&rsquo;s on offer.</p>
            {phone && (
              <a
                href={`sms:${e164(phone)}?&body=${askBody}`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-base font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                💬 Text Eileen
              </a>
            )}
          </div>
        )}

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
