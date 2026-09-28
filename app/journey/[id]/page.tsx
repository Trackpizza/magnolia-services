/**
 * A patient's shared journey — the before/after photos they picked in their
 * portal ("Share your journey", app/my/PortalShare.tsx), for friends and
 * family, with the ways to book underneath.
 *
 * ⚠️ This project is outside the BAA, so NOTHING of the patient comes through
 * this server: the shell renders here, and the photos and labels are fetched
 * in the visitor's browser from the records app (/api/public/journey), the
 * same way /my works. No name is ever shown; the records app decides which
 * photos are still shared on every load.
 *
 * Noindex (a private link, not a gallery) and no-referrer (the id is the
 * whole credential and must not ride the Referer header anywhere).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { getLinks } from '@/lib/links'
import JourneyView from './JourneyView'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'A patient journey | Magnolia Skin Center',
  description: 'Real results from Magnolia Skin Center in Burbank, CA.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function JourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const links = await getLinks()
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element -- same wordmark as /my */}
            <img src="/wordmark-white.webp" alt="Magnolia Skin Center" width={380} height={141} className="h-9 w-auto" />
          </Link>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-6 py-10 sm:py-14">
        <JourneyView
          id={id}
          videoConsultUrl={links.mainFooter.bookingUrl}
          phone={links.mainFooter.phone}
        />
      </main>
    </div>
  )
}
