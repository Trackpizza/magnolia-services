'use client'

import { useState } from 'react'

interface ShareVipPassProps {
  /** Salon name used in the sheet's lead line. */
  salonName: string
  /** Pre-written message body. The page URL is appended to it. */
  message: string
  title: string
}

const ShareIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684zm0-12a3 3 0 105.368-2.684A3 3 0 0015.316 8.658z" />
  </svg>
)
const ChatIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.83L3 20l1.05-3.15A7.6 7.6 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)
const WhatsAppIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 01-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.23 8.23 0 018.24 8.24c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.85.84-.85 2.04s.87 2.37.99 2.53c.12.17 1.72 2.62 4.16 3.67.58.25 1.04.4 1.39.51.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29z" />
  </svg>
)
const MailIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)
const LinkIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
  </svg>
)

/**
 * "Share this pass" — a fixed set of share targets.
 *
 * Deliberately does NOT use navigator.share. The native sheet is populated by
 * the OS from every installed app that accepts a URL — Instagram, Amazon,
 * Facebook and thirty others — and a web page cannot filter, reorder or
 * restrict it. Guests were scrolling past apps that can't receive a link at all.
 *
 * Showing our own sheet is the only way to control the list, so every option
 * here is somewhere a message can actually be delivered. The trade-off is one
 * extra tap: the native sheet lets you pick a contact inside it, whereas these
 * open the app with the message prefilled and you choose the recipient there.
 */
export default function ShareVipPass({ salonName, message, title }: ShareVipPassProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Read at click time, not render time: this is a client component but the page
  // is prerendered, so window doesn't exist during the server pass.
  const pageUrl = () => (typeof window === 'undefined' ? '' : window.location.href)
  const fullMessage = () => `${message} ${pageUrl()}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullMessage())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked (insecure context or denied) — the other options still work */
    }
  }

  // Built on demand: the sheet only renders after a click, so window is safe.
  function targets() {
    const body = encodeURIComponent(fullMessage())
    const subject = encodeURIComponent(title)
    return [
      // "sms:?&body=" is the form that works on both iOS (which wants &body) and
      // Android (which wants ?body). On iOS this opens Messages/iMessage.
      { label: 'Text', href: `sms:?&body=${body}`, Icon: ChatIcon },
      { label: 'WhatsApp', href: `https://wa.me/?text=${body}`, Icon: WhatsAppIcon },
      { label: 'Email', href: `mailto:?subject=${subject}&body=${body}`, Icon: MailIcon },
      { label: 'Gmail', href: `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, Icon: MailIcon },
    ]
  }

  const option =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-brand-400 text-brand-700 bg-white hover:bg-brand-50 hover:border-brand-500 active:scale-[0.98] text-sm font-semibold px-4 py-3.5 transition-all'

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white text-base font-semibold px-8 py-4 rounded-xl transition-all"
      >
        <ShareIcon className="w-5 h-5 shrink-0" />
        Share this pass with friends &amp; family
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600 mb-3">
            Send the {salonName} &amp; Magnolia Skin Center pass:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {targets().map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={option}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </a>
            ))}
            <button type="button" onClick={handleCopy} className={option}>
              <LinkIcon className="w-4 h-4 shrink-0" />
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
