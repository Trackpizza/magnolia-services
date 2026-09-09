import type { Metadata } from 'next'
import Link from 'next/link'
import BookTreatment from '@/components/BookTreatment'

/**
 * STAGING ONLY — in-person treatment booking, kept off the public site.
 *
 * ⚠️ Do NOT link to this page and do NOT move it back to /bookings until the
 * Google Cloud BAA is signed. /bookings is reachable from the Google Business
 * Profile listing, so anything on it can be found and used by a real patient,
 * and a real booking creates PHI in a project that is not yet covered.
 *
 * The master switch in the app (Settings → Scheduler Setup → "Let patients book
 * online") is the real control: it disables this page AND the API behind it,
 * without a deploy. This route only decides who can stumble across the form.
 */
export const metadata: Metadata = {
  title: 'Booking (testing) | Magnolia Skin Center',
  robots: { index: false, follow: false, nocache: true },
}

export default function BookingTestingPage() {
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/">
            <img src="/wordmark-white.webp" alt="Magnolia Skin Center" width={380} height={141} fetchPriority="high" className="h-9 w-auto" />
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-900">Staging — not for patients</p>
          <p className="text-sm text-amber-800 mt-1">
            This page exists to test online booking before go-live. Bookings made here are
            real: they occupy machine and provider time and email the clinic. Do not share
            this link.
          </p>
        </div>
        <BookTreatment />
      </main>
    </div>
  )
}
