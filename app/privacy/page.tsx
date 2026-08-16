import type { Metadata } from 'next'
import Link from 'next/link'
import LegalLinks from '@/components/LegalLinks'

export const metadata: Metadata = {
  title: 'Privacy Policy & Accessibility Statement | Magnolia Skin Center',
  description:
    'Privacy Policy and Accessibility Statement for services.magnoliaskincenter.com — how Magnolia Skin Center handles your information, and our commitment to WCAG 2.2 Level AA accessibility.',
}

const EMAIL = 'rejuv@magnoliaskincenter.com'
const PHONE = '(747) 305-8973'
const ADDRESS = '3506 1/2 W. Magnolia Blvd, Burbank, CA 91505'

// Shared prose element styles
const h2 = 'text-2xl sm:text-3xl font-semibold text-plum-900'
const h3 = 'text-lg font-semibold text-plum-900 mt-8 mb-2'
const p = 'text-gray-600 leading-relaxed'
const ul = 'list-disc pl-5 space-y-2 text-gray-600 leading-relaxed marker:text-brand-400'
const a = 'text-brand-600 hover:text-brand-700 underline'
const serif = { fontFamily: 'var(--font-cormorant), Georgia, serif' }

export default function PrivacyPage() {
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
          Privacy Policy &amp; Accessibility Statement
        </h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: August 15, 2026</p>

        {/* Jump nav */}
        <nav className="flex flex-wrap gap-3 mb-12">
          <a href="#privacy" className="rounded-full border border-brand-400 text-brand-700 text-sm font-medium px-4 py-1.5 hover:bg-brand-50 transition-colors">Privacy Policy</a>
          <a href="#accessibility" className="rounded-full border border-brand-400 text-brand-700 text-sm font-medium px-4 py-1.5 hover:bg-brand-50 transition-colors">Accessibility Statement</a>
        </nav>

        {/* ============ PART 1: PRIVACY POLICY ============ */}
        <section id="privacy" className="scroll-mt-24">
          <h2 className={h2} style={serif}>Part 1: Privacy Policy</h2>
          <p className="text-sm text-gray-600 mt-1 mb-6">Last updated: August 15, 2026</p>

          <h3 className={h3}>Introduction</h3>
          <div className="space-y-4">
            <p className={p}>
              Welcome to Magnolia Skin Center, Inc. (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). Your privacy and digital
              security are important to us. This Privacy Policy outlines how we collect, use, and protect your information
              when you visit and interact with our services portal at services.magnoliaskincenter.com (the &ldquo;Site&rdquo;), or
              utilize our digital booking, informational, and educational resources.
            </p>
            <p className={p}>
              This policy applies to all visitors, users, and others who access or use the Site, in compliance with standard
              consumer protection laws and the California Consumer Privacy Act (CCPA).
            </p>
            <p className={p}>
              By using our Site, you agree to the collection and use of information in accordance with this Privacy Policy.
              If you do not agree with this policy, please discontinue use of the Site.
            </p>
          </div>

          <h3 className={h3}>1. Information We Collect</h3>
          <p className={p}>
            We collect information that identifies, relates to, describes, or is reasonably capable of being associated with
            you or your device:
          </p>
          <ul className={`${ul} mt-3`}>
            <li><strong className="text-gray-800">Personal Information:</strong> Name, email address, phone number, and appointment/inquiry details submitted voluntarily through forms, chat widgets, or virtual consultation schedulers.</li>
            <li><strong className="text-gray-800">Usage Data:</strong> Technical details about your interactions with our Site, including IP address, browser type, device identifiers, pages viewed, time spent on pages, and referring URLs.</li>
            <li><strong className="text-gray-800">Cookies and Tracking Data:</strong> We utilize essential, functional, and analytical cookies/local storage to provide smooth navigation, remember preferences, and analyze site performance. You may modify your browser settings to refuse cookies, though certain interactive features may be limited.</li>
          </ul>

          <h3 className={h3}>2. Embedded Video &amp; Third-Party Content (YouTube Terms)</h3>
          <p className={p}>
            Our Site embeds educational and pre/post-treatment video guides hosted via YouTube (utilizing YouTube Video
            Player embeds and API Services).
          </p>
          <ul className={`${ul} mt-3`}>
            <li>
              <strong className="text-gray-800">Compliance with YouTube &amp; Google Policies:</strong> By viewing, interacting with, or playing YouTube video content on this Site, you agree to be bound by the{' '}
              <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className={a}>YouTube Terms of Service</a>{' '}
              and acknowledge that your interactions are subject to the{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className={a}>Google Privacy Policy</a>.
            </li>
            <li><strong className="text-gray-800">Third-Party Data Collection:</strong> When you play an embedded video, YouTube/Google may collect data regarding your viewing activity, device configuration, or set tracking cookies on your browser in accordance with their independent privacy policies.</li>
          </ul>

          <h3 className={h3}>3. How We Use Your Information</h3>
          <p className={p}>We use collected data to:</p>
          <ul className={`${ul} mt-3`}>
            <li>Operate, maintain, and enhance the features of services.magnoliaskincenter.com.</li>
            <li>Respond directly to consultation requests, procedure inquiries, and patient communications.</li>
            <li>Deliver accurate treatment guides, video resources, and aftercare recommendations.</li>
            <li>Analyze user interaction trends to optimize site speed, accessibility, and navigation structure.</li>
            <li>Prevent fraudulent activities, protect user security, and fulfill legal compliance requirements.</li>
          </ul>

          <h3 className={h3}>4. Sharing Your Information</h3>
          <p className={p}>
            We do not sell, rent, or trade your personal information. We may share information only under the following
            limited circumstances:
          </p>
          <ul className={`${ul} mt-3`}>
            <li><strong className="text-gray-800">Service Providers &amp; Cloud Platforms:</strong> Trusted third-party vendors (such as secure cloud hosting, appointment scheduling systems, and communication platforms) who assist in site delivery under strict confidentiality agreements.</li>
            <li><strong className="text-gray-800">Legal Compliance:</strong> When required by subpoena, court order, regulatory agency, or applicable California/federal law.</li>
            <li><strong className="text-gray-800">Business Reorganization:</strong> In the event of a merger, acquisition, or asset transition, where customer data is transferred as part of clinical operational continuity.</li>
          </ul>

          <h3 className={h3}>5. California Privacy Rights (CCPA)</h3>
          <p className={p}>
            If you are a California resident, you possess specific privacy rights under the California Consumer Privacy Act:
          </p>
          <ul className={`${ul} mt-3`}>
            <li><strong className="text-gray-800">Right to Know/Disclosure:</strong> Request details regarding categories and specific pieces of personal information collected, disclosed, or shared over the past 12 months.</li>
            <li><strong className="text-gray-800">Right to Deletion:</strong> Request the permanent deletion of personal data we have collected directly from you, subject to statutory healthcare record retention exceptions.</li>
            <li><strong className="text-gray-800">Right to Non-Discrimination:</strong> We will not deny services, charge differing rates, or provide a lower quality of care for exercising your privacy rights.</li>
            <li><strong className="text-gray-800">Right to Opt-Out of Sale:</strong> We do not sell personal information.</li>
          </ul>
          <p className={`${p} mt-3`}>
            To exercise these rights, submit a verified request to:{' '}
            <a href={`mailto:${EMAIL}`} className={a}>{EMAIL}</a>.
          </p>

          <h3 className={h3}>6. Health Information Disclaimer (Not a Direct Medical Record Portal)</h3>
          <p className={p}>
            While services.magnoliaskincenter.com provides educational aesthetics content, treatment directories, and
            scheduling access, public web forms on this domain are not intended for the transmission of emergency medical
            details. All protected health information (PHI) submitted during clinical care is governed by our dedicated
            HIPAA Notice of Privacy Practices.
          </p>

          <h3 className={h3}>7. Children&rsquo;s Privacy</h3>
          <p className={p}>
            Our Site is directed to adult audiences interested in medical aesthetics and wellness services. We do not
            knowingly collect personal data from children under 13 years of age. If we identify data inadvertently collected
            from a minor, it will be deleted promptly.
          </p>

          <h3 className={h3}>8. Changes to This Privacy Policy</h3>
          <p className={p}>
            We may update this Privacy Policy periodically to reflect technical or legal advancements. Any changes will be
            posted immediately with a refreshed &ldquo;Last Updated&rdquo; timestamp.
          </p>

          <h3 className={h3}>9. Privacy Contact Information</h3>
          <p className={p}>For questions regarding this policy or data management practices:</p>
          <ul className={`${ul} mt-3`}>
            <li>Email: <a href={`mailto:${EMAIL}`} className={a}>{EMAIL}</a></li>
            <li>Phone: <a href="tel:+17473058973" className={a}>{PHONE}</a></li>
            <li>Mailing Address: {ADDRESS}</li>
          </ul>
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
