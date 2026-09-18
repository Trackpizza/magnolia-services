import Link from 'next/link'

/** Privacy, Terms and Accessibility for the site footers (dark/plum
 *  background). A fragment, not a footer — it renders inside an existing link
 *  row, which is why it carries no layout of its own. */
export default function LegalLinks() {
  return (
    <>
      <Link href="/privacy" className="text-white/50 hover:text-white transition-colors">Privacy Policy</Link>
      <Link href="/terms" className="text-white/50 hover:text-white transition-colors">Terms</Link>
      <Link href="/privacy#accessibility" className="text-white/50 hover:text-white transition-colors">Accessibility</Link>
    </>
  )
}
