'use client'
/**
 * Real results from our clients (10-11) — Before & After albums the clinic
 * sent to THIS patient's portal from the records app (lib/showcase.ts grants
 * there). Replaces the open /results links: only people with a chart, signed
 * in, and the clinic can take an album back from one person.
 *
 * Photos load only once the section is opened (and are never cached); opening
 * it tells the clinic it was viewed. No names, no dates — the treatment, the
 * angle, how long after. Same "for your review only" rule as the old page:
 * the warning, and no right-click / drag / long-press save.
 */
import { useCallback, useState } from 'react'
import Link from 'next/link'
import Section from './Section'
import { PortalPhoto, type PhotoLoader } from './PortalJourney'
import { SiteLink } from './SiteViewer'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

export type RealResultsAlbum = {
  id: string
  title: string
  pairs: { id: string; treatment: string; slot: string; afterLabel: string }[]
}

const book = 'block w-full rounded-xl px-5 py-4 text-center text-base font-semibold transition-colors border border-brand-600 text-brand-700 hover:bg-brand-50'
/** Only web links and pages on this site — never javascript: or the like. */
const safe = (u: string) => /^https?:\/\//i.test(u) || /^\/(?!\/)/.test(u)
/** No saving: right-click (handled on the wrapper), drag-out and the iPhone long-press menu. */
const noSave = 'select-none [&_img]:pointer-events-none [&_img]:[-webkit-touch-callout:none]'

export default function RealResults({ albums, token, session, learnMore }: {
  albums: RealResultsAlbum[]
  token: string
  session: string
  learnMore: { label: string; url: string }[]
}) {
  const [opened, setOpened] = useState(false)
  const [open, setOpen] = useState<{ album: number; pair: number } | null>(null)

  const call = useCallback(
    (body: Record<string, unknown>) =>
      fetch(`${API}/api/public/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, session, ...body }),
        cache: 'no-store',
      }),
    [token, session],
  )
  // "grant|pair|side" → that photo, through the portal's own session check.
  const load: PhotoLoader = useCallback(
    (key) => {
      const [grant, photo, side] = key.split('|')
      return call({ action: 'results-photo', grant, photo, side })
    },
    [call],
  )

  const onOpen = () => {
    if (opened) return
    setOpened(true)
    call({ action: 'results-viewed', grants: albums.map((a) => a.id) }).catch(() => undefined)
  }

  const links = learnMore.filter((l) => l.label && safe(l.url))
  const total = albums.reduce((n, a) => n + a.pairs.length, 0)
  const currentAlbum = open ? albums[open.album] : null
  const current = open && currentAlbum ? currentAlbum.pairs[open.pair] : null

  return (
    <Section title="Real results from our clients" badge={`${total}`} onOpen={onOpen}>
      <p className="text-sm text-gray-600 mb-4">
        Clients of Magnolia Skin Center who agreed to share their results with you. Tap a pair to see it larger.
      </p>
      <div role="note" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">&#9888;&#xFE0F; Private photos &mdash; for your review only</p>
        <p className="mt-1">
          These photos belong to our clients, who agreed to share them privately. They are shared with you only to
          review results with Magnolia Skin Center.
        </p>
        <p className="mt-2 font-semibold">
          You may not use these images for any other purpose. Do not save, screenshot, copy, forward, post or publish
          them.
        </p>
      </div>

      {opened && (
        <div className="space-y-8" onContextMenu={(e) => e.preventDefault()}>
          {albums.map((a, ai) => (
            <div key={a.id}>
              <h3 className="mb-3 text-base font-semibold text-plum-900">{a.title}</h3>
              <div className="space-y-5">
                {a.pairs.map((p, pi) => (
                  <button key={p.id} onClick={() => setOpen({ album: ai, pair: pi })} className="block w-full text-left">
                    <div className={`grid grid-cols-2 gap-2 ${noSave}`}>
                      {(['before', 'after'] as const).map((side) => (
                        <div key={side} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                          <PortalPhoto load={load} id={`${a.id}|${p.id}|${side}`} alt={side === 'before' ? 'Before' : 'After'} className="h-full w-full object-cover" />
                          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                            {side === 'before' ? 'Before' : 'After'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900">{p.treatment}</p>
                    <p className="text-xs text-gray-600">{p.slot} · {p.afterLabel}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-base font-semibold text-plum-900">Learn more</h3>
          <div className="space-y-3">
            {links.map((l, i) =>
              l.url.startsWith('/') ? (
                <Link key={i} href={l.url} className={book}>{l.label}</Link>
              ) : (
                <SiteLink key={i} href={l.url} className={book}>{l.label}</SiteLink>
              ),
            )}
          </div>
        </div>
      )}

      {open && current && currentAlbum && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Before and after"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-base font-semibold">{current.treatment}</p>
              <p className="text-xs text-white/70">{current.slot} · {current.afterLabel} · {open.pair + 1} of {currentAlbum.pairs.length}</p>
            </div>
            <button onClick={() => setOpen(null)} className="px-2 text-2xl leading-none" aria-label="Close">✕</button>
          </div>
          <div className={`grid min-h-0 flex-1 grid-cols-2 gap-2 px-2 ${noSave}`}>
            {(['before', 'after'] as const).map((side) => (
              <div key={side} className="relative flex min-h-0 items-center justify-center">
                <PortalPhoto load={load} id={`${currentAlbum.id}|${current.id}|${side}`} alt={side} className="max-h-full max-w-full object-contain" />
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold">{side === 'before' ? 'Before' : 'After'}</span>
              </div>
            ))}
          </div>
          <p className="px-4 pt-2 text-center text-xs text-white/60">
            For your review only &mdash; these images may not be used for any other purpose. Do not save, screenshot or share them.
          </p>
          <div className="flex items-center justify-between px-4 py-3">
            <button disabled={open.pair === 0} onClick={() => setOpen({ ...open, pair: open.pair - 1 })} className="rounded-lg border border-white/30 px-4 py-2 disabled:opacity-30">‹ Previous</button>
            <button disabled={open.pair === currentAlbum.pairs.length - 1} onClick={() => setOpen({ ...open, pair: open.pair + 1 })} className="rounded-lg border border-white/30 px-4 py-2 disabled:opacity-30">Next ›</button>
          </div>
        </div>
      )}
    </Section>
  )
}
