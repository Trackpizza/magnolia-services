import Link from 'next/link'

/**
 * "Notice of Privacy Practices · Terms of Service" at the foot of the patient
 * pages that have no site footer — booking confirmations, manage/cancel,
 * photo upload, testimonials, shared journeys, results, service pages (10-11).
 * The site footers carry the same links through LegalLinks.
 */
export default function PolicyFooter() {
  return (
    <p className="px-6 py-8 text-center text-xs text-gray-500">
      <Link href="/privacy" className="underline hover:text-gray-700">Notice of Privacy Practices</Link>
      <span aria-hidden="true"> · </span>
      <Link href="/terms" className="underline hover:text-gray-700">Terms of Service</Link>
    </p>
  )
}
