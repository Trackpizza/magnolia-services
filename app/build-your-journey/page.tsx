import type { Metadata } from 'next'
import Link from 'next/link'
import { getLinks } from '@/lib/links'
import { resolveTargeted } from '@/config/targetedAreas'
import TargetedBuilder from '@/components/TargetedBuilder'

// Cached/ISR like the other pages; /admin saves revalidate it.
export const revalidate = 60

// Unlisted (11-07, Eric): shown by link only until Eileen signs off the
// prices and wording — no index, not in the sitemap, disallowed in robots.
export const metadata: Metadata = {
  title: 'Build Your Agnes RF Targeted Plan | Magnolia Skin Center',
  description: 'Tap the areas you want to treat and see your estimate.',
  robots: { index: false, follow: false },
}

export default async function BuildYourJourneyPage() {
  const links = await getLinks()
  const { areas, packages, discountPct } = resolveTargeted(links.targetedPricing)
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/wordmark-white.webp" alt="Magnolia Skin Center" width={380} height={141} className="h-9 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white font-medium transition-colors">
            All Services
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-2">Agnes RF Targeted Treatment</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-plum-900 leading-tight" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            Build your journey
          </h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Tap the areas you’d like to treat to see what each one does and its price — add them to your total, then text us your plan.
          </p>
        </div>
        <TargetedBuilder areas={areas} packages={packages} discountPct={discountPct} phone={links.mainFooter.phone} />
      </main>
    </div>
  )
}
