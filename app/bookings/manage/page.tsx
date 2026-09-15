/**
 * Where a patient manages the appointment they booked — reschedule, cancel, or
 * fill in the health questionnaire before they arrive.
 *
 * This is the link in every confirmation and reminder email. It replaces
 * /bookings/cancel, which still exists and still works: that URL is sitting in
 * inboxes we cannot edit, and a patient who finds one next month must not land
 * on a 404.
 *
 * Deliberately not a portal. No account, no password, nothing to recover — the
 * token in the URL is scoped to one appointment and expires with it. What a
 * login screen would add is the one thing this design exists to avoid: a way
 * for anyone to find out whether an address belongs to a patient here.
 *
 * Noindex AND no-referrer. Noindex because the URL carries a token; no-referrer
 * because a token in a query string otherwise rides the Referer header to every
 * third-party asset the page loads.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import ManageClient from './ManageClient'

export const metadata: Metadata = {
  title: 'Your appointment | Magnolia Skin Center',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function ManagePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/">
            <img src="/wordmark-white.webp" alt="Magnolia Skin Center" width={380} height={141} fetchPriority="high" className="h-9 w-auto" />
          </Link>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-6 py-12 sm:py-16">
        <ManageClient token={t ?? ''} />
      </main>
    </div>
  )
}
