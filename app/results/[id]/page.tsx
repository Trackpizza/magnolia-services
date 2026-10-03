/**
 * A Before & After album Eileen shared with a prospective client (records app
 * "Before & After" tab, lib/showcase.ts there; 10-03).
 *
 * ⚠️ This project is outside the BAA, so NOTHING of any patient comes through
 * this server: the shell renders here, and the photos are fetched in the
 * visitor's browser from the records app (/api/public/showcase). The records
 * app decides on every load which pairs are still shareable — a withdrawn
 * authorization or "Not for sharing" removes a pair at once; the link itself
 * dies after 30 days or when Eileen stops sharing. No name is ever shown.
 *
 * Noindex (a private link, not a gallery) and no-referrer (the id is the whole
 * credential and must not ride the Referer header anywhere).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { getLinks } from '@/lib/links'
import ResultsView from './ResultsView'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Results | Magnolia Skin Center',
  description: 'Real results from Magnolia Skin Center in Burbank, CA.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const links = await getLinks()
  return (
    <div className="portal-dark min-h-screen">
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element -- same wordmark as /my */}
            <img src="/wordmark-white.webp" alt="Magnolia Skin Center" width={380} height={141} className="h-9 w-auto" />
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10 sm:py-14">
        <ResultsView id={id} videoConsultUrl={links.mainFooter.bookingUrl} phone={links.mainFooter.phone} />
      </main>
    </div>
  )
}
