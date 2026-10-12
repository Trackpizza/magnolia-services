import type { Metadata } from 'next'
import Link from 'next/link'
import LegalLinks from '@/components/LegalLinks'
import ServiceContent from '@/components/ServiceContent'
import { getClinicLegal, withoutTitle } from '@/lib/clinicLegal'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Notice of Privacy Practices & Accessibility Statement | Magnolia Skin Center',
  description:
    'Privacy Policy and Accessibility Statement for services.magnoliaskincenter.com — how Magnolia Skin Center handles your information, and our commitment to WCAG 2.2 Level AA accessibility.',
}

const EMAIL = 'rejuv@magnoliaskincenter.com'
const PHONE = '(747) 305-8973'
const ADDRESS = '3508 1/2 W. Magnolia Blvd, Burbank, CA 91505'

// Shared prose element styles
const h2 = 'text-2xl sm:text-3xl font-semibold text-plum-900'
const h3 = 'text-lg font-semibold text-plum-900 mt-8 mb-2'
const p = 'text-gray-600 leading-relaxed'
const ul = 'list-disc pl-5 space-y-2 text-gray-600 leading-relaxed marker:text-brand-400'
const a = 'text-brand-600 hover:text-brand-700 underline'
const serif = { fontFamily: 'var(--font-cormorant), Georgia, serif' }

export default async function PrivacyPage() {
  const legal = await getClinicLegal()
  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/wordmark-white.webp" alt="Magnolia Skin Center" width={380} height={141} className="h-9 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white font-medium transition-colors">All Services</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-4xl sm:text-5xl font-semibold text-plum-900 mb-3" style={serif}>
          Notice of Privacy Practices &amp; Accessibility Statement
        </h1>

        {/* Jump nav */}
        <nav className="flex flex-wrap gap-3 mb-12">
          <a href="#privacy" className="rounded-full border border-brand-400 text-brand-700 text-sm font-medium px-4 py-1.5 hover:bg-brand-50 transition-colors">Notice of Privacy Practices</a>
          <a href="#accessibility" className="rounded-full border border-brand-400 text-brand-700 text-sm font-medium px-4 py-1.5 hover:bg-brand-50 transition-colors">Accessibility Statement</a>
        </nav>

        {/* ============ PART 1: NOTICE OF PRIVACY PRACTICES ============ */}
        {/* The clinic's own text, edited in the records app's Settings
            (lib/clinicLegal.ts, 10-11) — the notice patients agree to in
            their portal. Replaced the website-only policy that was here. */}
        <section id="privacy" className="scroll-mt-24">
          <h2 className={h2} style={serif}>Part 1: Notice of Privacy Practices</h2>
          <div className="-mx-6">
            <ServiceContent
              markdown={
                legal
                  ? withoutTitle(legal.privacy)
                  : `We could not load our Notice of Privacy Practices just now. Please try again shortly, or call ${PHONE} or email ${EMAIL} for a copy.`
              }
            />
          </div>
        </section>

        {/* ============ PART 2: ACCESSIBILITY STATEMENT ============ */}
        <section id="accessibility" className="scroll-mt-24 mt-16 pt-10 border-t border-plum-900/10">
          <h2 className={h2} style={serif}>Part 2: Accessibility Statement</h2>
          <p className="text-sm text-gray-600 mt-1 mb-6">Last updated: August 15, 2026</p>

          <h3 className={h3}>Our Commitment to Universal Accessibility</h3>
          <p className={p}>
            Magnolia Skin Center, Inc. is committed to ensuring digital accessibility for everyone, including individuals
            with visual, auditory, motor, and cognitive disabilities. We continually optimize services.magnoliaskincenter.com
            to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA, the Americans with Disabilities Act
            (ADA), and California&rsquo;s Unruh Civil Rights Act.
          </p>

          <h3 className={h3}>Key Technical Standards &amp; Enhancements</h3>
          <ul className={`${ul} mt-3`}>
            <li><strong className="text-gray-800">Semantic Code &amp; ARIA Standards:</strong> Programmed with structured semantic HTML5, explicit heading hierarchies, and descriptive ARIA landmarks/labels for reliable screen reader interpretation.</li>
            <li><strong className="text-gray-800">Full Keyboard Operability:</strong> All critical menus, buttons, interactive treatment cards, and scheduling links can be navigated seamlessly using only a keyboard (Tab, Shift+Tab, Enter, Space, Escape).</li>
            <li><strong className="text-gray-800">Visual Contrast &amp; Typography:</strong> Text and UI elements maintain high contrast ratios exceeding standard WCAG requirements. Sizing and line heights are engineered for readability across mobile and desktop displays.</li>
            <li><strong className="text-gray-800">Alternative Text &amp; Media:</strong> Meaningful non-decorative imagery includes descriptive alt tags.</li>
            <li><strong className="text-gray-800">Video Captions &amp; Accessible Media:</strong> Embedded YouTube treatment overviews and clinical guides support closed captioning (CC) and video player controls accessible via standard keyboard and screen-reading assistive tools.</li>
            <li><strong className="text-gray-800">Reduced Motion:</strong> Built with respect for system-level prefers-reduced-motion settings to eliminate disorienting animations or visual triggers.</li>
          </ul>

          <h3 className={h3}>Assistive Technology Compatibility</h3>
          <p className={p}>This Site is continuously tested and optimized for compatibility with modern assistive software and browsers:</p>
          <ul className={`${ul} mt-3`}>
            <li><strong className="text-gray-800">Screen Readers:</strong> JAWS, NVDA, Apple VoiceOver, and ChromeVox.</li>
            <li><strong className="text-gray-800">Supported Browsers:</strong> Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, and Opera.</li>
          </ul>

          <h3 className={h3}>Accessibility Support &amp; Contact</h3>
          <p className={p}>
            If you encounter any difficulty accessing content, navigating a treatment guide, or scheduling a consultation on
            services.magnoliaskincenter.com, our staff is ready to assist you directly:
          </p>
          <ul className={`${ul} mt-3`}>
            <li>Email: <a href={`mailto:${EMAIL}?subject=Accessibility%20Support`} className={a}>{EMAIL}</a> (Subject line: Accessibility Support)</li>
            <li>Phone: <a href="tel:+17473058973" className={a}>{PHONE}</a></li>
            <li>In-Person / Mail: {ADDRESS}</li>
          </ul>
          <p className={`${p} mt-4`}>
            We value your feedback and actively implement updates to maintain full digital inclusion.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-plum-900 border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/50 text-sm">&copy; {new Date().getFullYear()} Magnolia Skin Center, Inc.</p>
          <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
            <Link href="/" className="text-white/50 hover:text-white transition-colors">All Services</Link>
            <LegalLinks />
          </div>
        </div>
      </footer>
    </div>
  )
}
