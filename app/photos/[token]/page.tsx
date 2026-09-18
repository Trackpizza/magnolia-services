/**
 * Follow-up photos, from the patient's own phone.
 *
 * Noindex AND no-referrer: the URL carries a token, and a token in a query
 * string otherwise rides the Referer header to every third-party asset the
 * page happens to load. Same treatment as the portal and the testimonial
 * recorder.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import PhotoRequestClient from './Client'

export const metadata: Metadata = {
  title: 'Send us a photo | Magnolia Skin Center',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default function PhotoRequestPage() {
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wordmark-white.webp"
              alt="Magnolia Skin Center"
              width={380}
              height={141}
              className="h-9 w-auto"
            />
          </Link>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-6 py-10 sm:py-14">
        <PhotoRequestClient />
      </main>
    </div>
  )
}
