import Link from 'next/link'

/** Privacy + Accessibility links for the site footers (dark/plum background). */
export default function LegalLinks() {
  return (
    <>
      <Link href="/privacy" className="text-white/50 hover:text-white transition-colors">Privacy Policy</Link>
      <Link href="/privacy#accessibility" className="text-white/50 hover:text-white transition-colors">Accessibility</Link>
    </>
  )
}
