import type { Metadata } from 'next'
import Link from 'next/link'
import { getLinks } from '@/lib/links'
import { TextUsButton, CallTextPills } from '@/components/Contact'
import LegalLinks from '@/components/LegalLinks'
import YouTubeEmbed from '@/components/YouTubeEmbed'

/**
 * Photo consult — the marketing page for the clinical app's intake form.
 *
 * **The form itself deliberately does NOT live here.** It collects a face photo,
 * a concern and a signed consent, which is PHI, and this project (`magnolia-services`)
 * is standalone, on a personal account, outside the org and outside the Cloud BAA.
 * The form runs on `portal.magnoliaskincenter.com`, inside the covered project,
 * and this page's only job is to sell it and hand the visitor over.
 *
 * Keep it that way. If a future version needs to "just capture the email first",
 * that is the moment PHI starts landing in an uncovered project — and this page is
 * also the one most likely to get a marketing pixel dropped on it one day, which
 * is exactly the combination OCR has fined clinics for.
 */

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Free Photo Consult | Magnolia Skin Center',
  description:
    'Send one photo and Dr. David records a personal video walking through what he sees, what the result could look like, and the non-surgical options he would suggest. Complimentary, from Magnolia Skin Center in Burbank, CA.',
  // ⚠️ UNLISTED UNTIL THE CLOUD BAA IS ACCEPTED — the same rule /bookingtesting
  // follows, for the same reason. This page sends people to a form that still
  // says "Test mode — please use a sample/AI image, not a real photo", and a
  // patient who found it through Google would arrive at that with no context.
  //
  // AT LAUNCH, three things flip together: delete this `robots` line, remove
  // '/photo-consult' from app/robots.ts, and add it back to app/sitemap.ts.
  robots: { index: false, follow: false },
}

/** The intake form, on the clinical project. Hardcoded like the other absolute URLs here. */
const INTAKE_URL = 'https://portal.magnoliaskincenter.com/intake'

const CameraIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const STEPS = [
  { n: '1', title: 'Upload your photo', body: 'One clear, front-facing photo is all it takes.' },
  { n: '2', title: 'Instant confirmation', body: 'Sent straight to your inbox, so you know it arrived.' },
  { n: '3', title: 'Dr. David records your video', body: 'His walkthrough of your photo, with a simulated preview of the result.' },
  { n: '4', title: 'Watch your private link', body: 'Delivered by text and email — yours to keep and rewatch.' },
]

export default async function PhotoConsultPage() {
  const links = await getLinks()
  const { mainFooter: f } = links

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/wordmark-white.webp" alt="Magnolia Skin Center" width={380} height={141} fetchPriority="high" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-white/70 hover:text-white font-medium transition-colors">
              All Services
            </Link>
            <TextUsButton phone={f.phone} variant="dark" className="hidden sm:inline-flex" />
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
          <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-3">Magnolia Skin Center</p>
          <h1 className="text-5xl font-semibold text-plum-900 mb-4" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            A Personal Walkthrough of Your Skin
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto">
            Complimentary video walkthrough from Dr. David. Upload one photo and he records a personal
            video — what he sees, what the result could look like, and the non-surgical options he
            would suggest.
          </p>
          <a href={INTAKE_URL}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors">
            <CameraIcon className="w-5 h-5 shrink-0" />
            Start your photo consult
          </a>
          <p className="text-sm text-gray-500 mt-4">Free, no obligation.</p>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-6 py-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10">
            <h2 className="text-2xl font-semibold text-plum-900 mb-8 text-center" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
              How it works
            </h2>
            <div className="grid sm:grid-cols-4 gap-6">
              {STEPS.map(step => (
                <div key={step.n} className="text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold mb-4">{step.n}</div>
                  {/* The action verb carries the weight; the explanation sits back. */}
                  <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                  <p className="text-sm font-light text-gray-600 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="max-w-3xl mx-auto px-6 py-10 text-center">
          <h2 className="text-2xl font-semibold text-plum-900 mb-6" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            What a real journey looks like
          </h2>
          <div className="max-w-xs mx-auto">
            <YouTubeEmbed
              url="https://www.youtube.com/watch?v=UkaYO_MHa3g"
              title="Nurse Eileen's two-year journey"
            />
            <p className="text-sm font-light text-gray-600 mt-3">
              Nurse Eileen&rsquo;s two-year journey to restore facial volume and lift sagging jowls.
            </p>
          </div>
        </section>

        {/* What it is, plainly. The same thing the consent form says — a patient
            should not meet two different descriptions of this on the same day. */}
        <section className="max-w-3xl mx-auto px-6 pb-10">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">Good to know</p>
            <ul className="space-y-2 text-sm font-light text-gray-600 leading-relaxed">
              <li>The preview is a <span className="font-medium text-gray-900">computer simulation for illustration</span> — not a real result, not a guarantee, and not medical advice. Individual results vary.</li>
              <li>Your photo and details are used to prepare your walkthrough and to contact you about it.</li>
              <li>You choose separately whether your before/after may ever be used in marketing. Saying no changes nothing about your consult.</li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-plum-900 py-16 mt-6">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
              Ready to see it?
            </h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              One photo is all it takes. Dr. David does the rest.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={INTAKE_URL}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-8 py-3.5 rounded-xl transition-colors">
                <CameraIcon className="w-5 h-5 shrink-0" />
                Start your photo consult
              </a>
              <Link href="/" className="inline-flex items-center gap-2 border border-white/25 text-white/80 hover:text-white hover:border-white/50 text-sm font-semibold px-8 py-3.5 rounded-xl transition-colors">
                Browse all services
              </Link>
            </div>
            {f.phone && <CallTextPills phone={f.phone} variant="dark" className="mt-8" />}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-plum-900 border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            {f.address && <p className="text-white/50 text-sm">{f.address}</p>}
            {f.phone && (
              <a href={`tel:${f.phone.replace(/\D/g, '')}`}
                className="block text-white/50 hover:text-white/70 text-sm transition-colors">{f.phone}</a>
            )}
            {f.email && (
              <a href={`mailto:${f.email}`}
                className="block text-white/50 hover:text-white/70 text-sm transition-colors">{f.email}</a>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
            {f.websiteUrl && (
              <a href={f.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors">magnoliaskincenter.com</a>
            )}
            <Link href="/" className="text-white/50 hover:text-white transition-colors">All Services</Link>
            <LegalLinks />
          </div>
        </div>
      </footer>
    </div>
  )
}
