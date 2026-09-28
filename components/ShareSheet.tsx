'use client'
/**
 * Text / WhatsApp / Email / Copy link — the share sheet from visage-clinical's
 * ShareReferral, in this site's styling.
 *
 * Deliberately NOT `navigator.share`: the native sheet lists every installed
 * app that takes a URL (Instagram, Amazon, thirty others) and a page cannot
 * filter it. These four are the places a message to a friend actually lands.
 *
 * ⚠️ Never pass `window.location.href` from the portal: that URL is the
 * patient's private link. The caller always names what is shared.
 */
import { useState, type ReactNode } from 'react'

const option =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-brand-600 px-3 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors'

export default function ShareSheet({ text, url, subject, note }: {
  /** The sentence before the link — shown first, so they see what goes out under their name. */
  text: string
  url: string
  subject: string
  note?: ReactNode
}) {
  const [copied, setCopied] = useState(false)
  const full = `${text} ${url}`
  const body = encodeURIComponent(full)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* blocked — the link is on screen to select by hand */
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-cream-100/60 p-4">
      <p className="text-sm text-gray-700">{text}</p>
      <p className="mt-1 break-all text-sm text-brand-700">{url}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {/* "sms:?&body=" is the one form both iOS and Android accept. */}
        <a href={`sms:?&body=${body}`} className={option}>💬 Text</a>
        <a href={`https://wa.me/?text=${body}`} target="_blank" rel="noopener noreferrer" className={option}>
          🟢 WhatsApp
        </a>
        <a href={`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`} className={option}>✉️ Email</a>
        <button type="button" onClick={copy} className={option}>{copied ? '✓ Copied' : '🔗 Copy link'}</button>
      </div>
      {note && <p className="mt-3 text-xs leading-relaxed text-gray-500">{note}</p>}
    </div>
  )
}
