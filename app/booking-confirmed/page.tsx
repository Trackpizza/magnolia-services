/**
 * Where a patient lands after paying a deposit through Stripe.
 *
 * Before this existed, Stripe's success_url returned people to /bookings — a
 * page whose booking widget had been removed when it went out on the Google
 * Business Profile. So paying $100 dropped you on a page with nothing on it
 * acknowledging what you had just done, in the one moment that most needs
 * acknowledging.
 *
 * Noindex: a transactional page, useful only to the person Stripe just sent
 * here, and of no value in a search result.
 */
import type { Metadata } from 'next'
import { Suspense } from 'react'
import BookingConfirmedClient from './Client'

export const metadata: Metadata = {
  title: 'Booking confirmed | Magnolia Skin Center',
  robots: { index: false, follow: false },
  description: 'Your appointment at Magnolia Skin Center.',
}

export default function BookingConfirmedPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 py-12">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        {/* useSearchParams needs a Suspense boundary, and the fallback is what
            shows for the instant before hydration — so it says the reassuring
            thing rather than nothing. */}
        <Suspense fallback={<p className="text-gray-700">Checking your booking…</p>}>
          <BookingConfirmedClient />
        </Suspense>
      </div>
    </main>
  )
}
