'use client'

/**
 * Staying signed in (10-03). The portal remembers a sign-in per browser, and
 * on a phone "which browser" depends on the app the link was tapped in — Eileen
 * signed in on her iPhone, tapped the link again ten minutes later from
 * somewhere else, and had to sign in again. Two nudges, shown only once the
 * page is open:
 *
 *  - Inside another app's browser (Instagram, Facebook, Gmail and the like):
 *    that browser keeps its own storage, so the sign-in will not be there
 *    next time. Say so, and how to open it in Safari / Chrome. A page cannot
 *    open Safari itself, so there is a Copy link as well.
 *  - Otherwise, once: "Add this page to your Home Screen". The page is an
 *    installable web app (public/portal/manifest.webmanifest), so the icon
 *    opens it as its own app — exempt from Safari erasing a sign-in after 7
 *    days without a visit, so it lasts the full 90. The app keeps its OWN
 *    storage, so they sign in once more inside it; the tip says so. Inside
 *    the installed app (standalone) no tip shows.
 */
import { useState } from 'react'

const DISMISS_KEY = 'msc_portal_home_tip_dismissed'

function detect() {
  if (typeof window === 'undefined') return { inApp: false, ios: false, android: false, standalone: true }
  const ua = navigator.userAgent
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const android = /Android/.test(ua)
  const inApp =
    /FBAN|FBAV|Instagram|Line\/|LinkedInApp|Snapchat|musical_ly|BytedanceWebview|GSA\//.test(ua) ||
    // An iPhone web view without the "Safari/" token is an app's own browser;
    // Safari, Chrome (CriOS) and Firefox (FxiOS) on iOS all carry it.
    (ios && !/Safari\//.test(ua)) ||
    // Android's in-app web view marks itself "; wv)".
    (android && /; wv\)/.test(ua))
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches === true
  return { inApp, ios, android, standalone }
}

export default function PortalTips() {
  const [env] = useState(detect)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })
  const [copied, setCopied] = useState(false)

  const box = 'rounded-2xl border border-brand-100 bg-cream-100 px-5 py-4 text-sm text-gray-700'

  if (env.inApp) {
    return (
      <div className={box}>
        <p className="font-semibold text-plum-900 mb-1">Open this in {env.android ? 'Chrome' : 'Safari'} to stay signed in</p>
        <p>
          You are looking at your page inside another app, which forgets your sign-in. Tap the{' '}
          <strong>⋯</strong> or share button and choose <strong>Open in {env.android ? 'Chrome' : 'Safari'}</strong>
          {' '}(or <strong>Open in browser</strong>) — then you will only need a code once.
        </p>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href)
              setCopied(true)
            } catch {
              /* nothing to copy to — the instructions above still work */
            }
          }}
          className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          {copied ? 'Link copied — paste it into ' + (env.android ? 'Chrome' : 'Safari') : 'Copy the link to my page'}
        </button>
      </div>
    )
  }

  if (env.standalone || dismissed) return null

  return (
    <div className={box}>
      <p className="font-semibold text-plum-900 mb-1">Keep your page one tap away</p>
      <p>
        {env.ios ? (
          <>Tap the <strong>Share</strong> button (the square with the arrow), then <strong>Add to Home Screen</strong>. Open it from the new Magnolia icon and sign in once more — after that it stays signed in for 90 days.</>
        ) : env.android ? (
          <>Tap <strong>⋮</strong> at the top, then <strong>Add to Home screen</strong> (or <strong>Install app</strong>). Open it from the new Magnolia icon — it stays signed in for 90 days.</>
        ) : (
          <>Bookmark this page — you will stay signed in on this computer for 90 days.</>
        )}
      </p>
      <button
        onClick={() => {
          setDismissed(true)
          try {
            localStorage.setItem(DISMISS_KEY, '1')
          } catch {
            /* shows again next time — harmless */
          }
        }}
        className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        Got it
      </button>
    </div>
  )
}
