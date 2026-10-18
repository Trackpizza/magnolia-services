'use client'
/**
 * Our own pages, opened INSIDE the client portal (10-17, Eric: "I don't want
 * anyone leaving the portal").
 *
 * A link to this site (a service deep dive, prep, aftercare, booking) slides
 * up a full-screen panel with the page in it and a big ✕ Close bar on top —
 * closing drops them back where they were, still signed in. Before, those
 * links opened a new tab, and from a portal added to the home screen that
 * meant Safari and, for many, no way back.
 *
 * The framed page hides its own header / footer / "Already a patient?" bar
 * and keeps this site's new-tab links inside the panel (the script in
 * app/layout.tsx + html[data-embed] in globals.css). Links to OTHER sites
 * still open a new tab — most refuse to be shown inside another page.
 *
 * The phone's Back button closes the panel too (one history entry per open).
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type Open = (href: string) => void
const ViewerContext = createContext<Open | null>(null)

/** This site's own page? (relative, or same origin as the portal) */
export function isOwnSite(href: string | undefined): boolean {
  if (!href || typeof window === 'undefined') return false
  try {
    const u = new URL(href, window.location.href)
    return u.origin === window.location.origin && (u.protocol === 'https:' || u.protocol === 'http:')
  } catch {
    return false
  }
}

export function SiteViewerProvider({ children }: { children: ReactNode }) {
  const [url, setUrl] = useState<string | null>(null)
  const pushed = useRef(false)

  const open = useCallback<Open>((href) => {
    setUrl(new URL(href, window.location.href).toString())
    try {
      window.history.pushState({ siteViewer: true }, '')
      pushed.current = true
    } catch {
      pushed.current = false
    }
  }, [])

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false
      window.history.back() // popstate below clears the panel
    } else {
      setUrl(null)
    }
  }, [])

  useEffect(() => {
    if (!url) return
    const onPop = () => {
      pushed.current = false
      setUrl(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('popstate', onPop)
    window.addEventListener('keydown', onKey)
    // The portal underneath doesn't scroll while the panel is up.
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = before
    }
  }, [url, close])

  return (
    <ViewerContext.Provider value={open}>
      {children}
      {url && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white" role="dialog" aria-modal="true" aria-label="Magnolia Skin Center page">
          <div className="flex shrink-0 items-center justify-between gap-3 bg-plum-900 px-4 py-3 text-white" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
            <span className="truncate text-sm font-medium text-white/80">Magnolia Skin Center</span>
            <button
              type="button"
              onClick={close}
              autoFocus
              className="shrink-0 rounded-full bg-white px-5 py-2 text-base font-semibold text-plum-900 hover:bg-cream-100"
            >
              ✕ Close
            </button>
          </div>
          <iframe src={url} title="Magnolia Skin Center page" className="w-full flex-1 border-0 bg-white" />
        </div>
      )}
    </ViewerContext.Provider>
  )
}

/**
 * A link that opens this site's pages in the viewer, and anything else in a
 * new tab. Drop-in for <a href target="_blank">.
 */
export function SiteLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const open = useContext(ViewerContext)
  // tel:, sms:, mailto: — just the link, no new tab.
  if (!/^(https?:|\/(?!\/))/i.test(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => {
        if (!open || !isOwnSite(href) || e.metaKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        open(href)
      }}
    >
      {children}
    </a>
  )
}
