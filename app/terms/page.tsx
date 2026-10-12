/**
 * Terms of Service — the clinic's own text, edited in the RECORDS app's
 * Settings → "Privacy Notice & Terms — the text" (10-11, lib/clinicLegal.ts).
 * Eileen approved the wording 10-10; patients agree to it in their portal.
 * (Until 10-11 this page was edited in this site's /admin and showed a
 * developer's draft — that editor is gone.)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import ServiceContent from '@/components/ServiceContent'
import { getClinicLegal, withoutTitle } from '@/lib/clinicLegal'

export const metadata: Metadata = {
  title: 'Terms of Service | Magnolia Skin Center',
  description:
    "The terms that apply to Magnolia Skin Center's website, client portal, online booking and forms, in Burbank, CA.",
}

export const revalidate = 300

const serif = { fontFamily: 'var(--font-cormorant), Georgia, serif' }

export default async function TermsPage() {
  const legal = await getClinicLegal()
  const body = legal
    ? withoutTitle(legal.terms)
    : 'We could not load our Terms of Service just now. Please try again shortly, or call (747) 305-8973 or email rejuv@magnoliaskincenter.com for a copy.'

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

      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-semibold text-plum-900 mb-8" style={serif}>
          Terms of Service
        </h1>
        <ServiceContent markdown={body} />

        <p className="mt-10 text-sm text-gray-600">
          See also our{' '}
          <Link href="/privacy" className="text-brand-600 hover:text-brand-700 underline">
            Notice of Privacy Practices and Accessibility Statement
          </Link>
          .
        </p>
      </main>
    </div>
  )
}
