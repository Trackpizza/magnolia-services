'use client'

import { useState } from 'react'

interface ShareVipPassProps {
  /** Salon name used in the share title. */
  salonName: string
  /** Pre-written message body. The URL is appended by the share target. */
  message: string
  title: string
}

const ShareIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684zm0-12a3 3 0 105.368-2.684A3 3 0 0015.316 8.658z" />
  </svg>
)

/**
 * "Share this pass" button.
 *
 * On phones navigator.share opens the native tray (Messages, Mail, WhatsApp,
 * AirDrop) — the behaviour guests expect. Desktop Firefox has no Web Share API
 * at all and desktop Chrome is inconsistent, so rather than failing silently
 * there, we reveal explicit SMS / Email / WhatsApp / Copy links. Every visitor
 * ends up with a working way to pass the link on.
 */
export default function ShareVipPass({ salonName, message, title }: ShareVipPassProps) {
  const [fallbackOpen, setFallbackOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Read at click time, not render time: this is a client component but the
  // page is prerendered, so window is not available during the server pass.
  const pageUrl = () => (typeof window === 'undefined' ? '' : window.location.href)

  async function handleShare() {
    const url = pageUrl()
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: message, url })
        return
      } catch (err) {
        // The user dismissing the tray throws AbortError — that's not a failure,
        // so leave the fallback closed and do nothing.
        if (err instanceof Error && err.name === 'AbortError') return
      }
    }
    setFallbackOpen(true)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${message} ${pageUrl()}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked (insecure context or denied) — the links still work */
    }
  }

  // Built on demand: the fallback only ever renders in the browser (it opens on
  // click), so window is safe here and never runs during the prerender pass.
  function fallbackLinks() {
    const body = encodeURIComponent(`${message} ${pageUrl()}`)
    return [
      { label: 'Text', href: `sms:?&body=${body}` },
      { label: 'Email', href: `mailto:?subject=${encodeURIComponent(title)}&body=${body}` },
      { label: 'WhatsApp', href: `https://wa.me/?text=${body}` },
    ]
  }

  const outline =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-brand-400 text-brand-700 bg-white hover:bg-brand-50 hover:border-brand-500 text-sm font-semibold px-5 py-3 transition-colors'

  return (
    <div>
      <button
        type="button"
        onClick={handleShare}
        className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white text-base font-semibold px-8 py-4 rounded-xl transition-all"
      >
        <ShareIcon className="w-5 h-5 shrink-0" />
        Share this pass with friends &amp; family
      </button>

      {fallbackOpen && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600 mb-3">
            Send the {salonName} &amp; Magnolia Skin Center pass:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {fallbackLinks().map(link => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={outline}>
                {link.label}
              </a>
            ))}
            <button type="button" onClick={handleCopy} className={outline}>
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
