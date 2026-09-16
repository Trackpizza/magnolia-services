/**
 * The client portal — a patient's own page.
 *
 * What is on it: the plan for the next few visits, what they are booked for,
 * anything still to sign, and how to reach the clinic. What is not: past
 * visits, photographs or notes. Those are the sensitive half and they go
 * behind a texted code.
 *
 * No account, no password, nothing to recover. The link is bound to one chart
 * when staff mint it, which is how this avoids the problem every commercial
 * portal has: it never has to work out who is holding it. A portal that asks
 * for a phone number and then looks up a patient has to get identity right
 * from contact details alone — and a household shares an email and a mobile.
 *
 * Every piece of data is fetched from the records app as the page renders.
 * Nothing clinical is stored on this project, which is what keeps the HIPAA
 * split from June intact while the page lives on the domain patients know.
 *
 * Noindex AND no-referrer: the URL carries a token, and a token in a query
 * string otherwise rides the Referer header to every third-party asset.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import PortalClient from './PortalClient'

export const metadata: Metadata = {
  title: 'Your page | Magnolia Skin Center',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function PortalPage({
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
      <main className="max-w-xl mx-auto px-6 py-10 sm:py-14">
        <PortalClient token={t ?? ''} />
      </main>
    </div>
  )
}
