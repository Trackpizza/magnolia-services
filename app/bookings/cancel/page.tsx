import type { Metadata } from 'next'
import Link from 'next/link'
import CancelClient from './CancelClient'

export const metadata: Metadata = {
  title: 'Cancel an appointment | Magnolia Skin Center',
  // Nothing here should ever be indexed: the URL carries a token.
  robots: { index: false, follow: false },
}

export default async function CancelPage({
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
      <main className="max-w-xl mx-auto px-6 py-16">
        <CancelClient token={t ?? ''} />
      </main>
    </div>
  )
}
