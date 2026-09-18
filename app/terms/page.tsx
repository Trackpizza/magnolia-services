/**
 * Terms of Service — editable, unlike the privacy page beside it.
 *
 * Privacy is hand-written TSX because it makes specific promises about how
 * this system handles data, and those change when the system changes, not when
 * somebody feels like rewording. Terms are the opposite: they are the clinic's
 * own policy on cancellations, deposits, results and what a booking commits
 * them to, and Eileen will want to change that wording without a deploy. So
 * the body lives in `serviceLinks/config` and is edited in /admin, and the
 * draft below is only what shows until she saves her own.
 *
 * ⚠️ The default text is a STARTING POINT written by a developer, not a
 * lawyer. It exists because an empty page is worse than a draft; it is not
 * legal advice and should be reviewed by someone qualified before anyone
 * relies on it.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { getLinks } from '@/lib/links'
import ServiceContent from '@/components/ServiceContent'

export const metadata: Metadata = {
  title: 'Terms of Service | Magnolia Skin Center',
  description:
    'The terms that apply when you book, attend or pay for treatment at Magnolia Skin Center in Burbank, CA.',
}

// Regenerates in the background at most once a minute, and immediately when
// the admin saves — the same deal as every other content page here.
export const revalidate = 60

// No top-level heading: the page renders its own <h1>, and a second "Terms of
// Service" underneath it reads like a mistake.
const DEFAULT_TERMS = `_A starting draft. Please replace it with the clinic's own
wording — it has not been reviewed by a lawyer._

These terms apply when you book, attend or pay for treatment at Magnolia Skin
Center. Please read them — booking an appointment means you accept them.

### Appointments and cancellations

- Booking a time reserves a provider, and often a specific machine, for you
  alone. That time cannot be offered to anyone else while it is held.
- Please give us at least 24 hours' notice if you need to cancel or move an
  appointment. You can do this from the link in your confirmation email, or by
  calling or texting the clinic.
- Arriving significantly late may mean we cannot complete the treatment safely
  in the time remaining, and may have to reschedule it.

### Deposits and payment

- Some treatments require a deposit to hold the appointment. Where a deposit is
  taken, the amount and what happens to it are shown before you pay.
- Payment for treatment is due at the time of the visit unless agreed
  otherwise in writing.

### Treatment, results and medical information

- Aesthetic treatment is individual. We will tell you honestly what we expect,
  but **no result is guaranteed**, and nothing on this site or in a treatment
  plan is a promise of a particular outcome.
- Any plan we discuss is what was discussed, not what was agreed. It can change
  as your treatment progresses, and it is not a quote.
- You agree to give accurate health information, including medication,
  allergies, pregnancy and previous procedures. Some of it decides whether a
  treatment is safe for you.
- Nothing here is medical advice. Decisions about your care are made with a
  provider, in person.

### Photographs

- Clinical photographs are part of your medical record and are used to plan and
  compare treatment.
- We will never use your photographs or video for marketing without separate,
  written permission from you, which you can withdraw at any time.

### Your information

- How we handle your information is set out in our Privacy Policy.

### Contact

Questions about these terms: call or text the clinic, or email us. We would
rather talk it through than have you agree to something you are unsure about.
`

const serif = { fontFamily: 'var(--font-cormorant), Georgia, serif' }

export default async function TermsPage() {
  const links = await getLinks()
  const body = (links.terms ?? '').trim() || DEFAULT_TERMS

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
            Privacy Policy and Accessibility Statement
          </Link>
          .
        </p>
      </main>
    </div>
  )
}
