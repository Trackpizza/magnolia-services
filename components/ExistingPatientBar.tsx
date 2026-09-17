'use client'

/**
 * The strip above every page: "Existing patients — open your page".
 *
 * The portal is where the treatment plan and Dr David's walkthroughs live, and
 * until now the only way to it was a link staff sent once, months ago. A
 * patient who lost that link had no way back and no reason to look for one, so
 * the thing built to bring people back was invisible to exactly the people it
 * was built for.
 *
 * Deliberately a thin strip rather than a nav item: every page of this site is
 * a marketing page with its own header, and threading one more button through
 * sixteen of them would be sixteen chances to break a layout for one link.
 *
 * Hidden on the portal itself and on /admin — offering somebody a way in to
 * the page they are standing on is noise.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ExistingPatientBar() {
  const path = usePathname() ?? ''
  if (path.startsWith('/my') || path.startsWith('/admin')) return null

  return (
    <div className="bg-plum-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-center sm:justify-end gap-3">
        <span className="text-xs sm:text-sm text-white/80">
          Already a patient? Your plan and appointments are on your own page.
        </span>
        <Link
          href="/my"
          className="shrink-0 bg-white text-plum-900 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-cream-100 transition-colors"
        >
          Log in
        </Link>
      </div>
    </div>
  )
}
