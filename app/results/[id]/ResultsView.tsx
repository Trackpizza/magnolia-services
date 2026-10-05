'use client'
/**
 * The shared album, fetched in the browser from the records app — see
 * page.tsx for why. Each pair Before | After with the treatment and how long
 * after; tap one for full screen. Then the ways to book.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Section from '../../my/Section'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''
const heading = { fontFamily: 'var(--font-cormorant), Georgia, serif' }

type Pair = { id: string; treatment: string; slot: string; afterLabel: string }
type Urls = Record<string, { before?: string; after?: string }>

const post = (body: Record<string, unknown>) =>
  fetch(`${API}/api/public/showcase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

export default function ResultsView({ id, videoConsultUrl, phone }: { id: string; videoConsultUrl: string; phone: string }) {
  const [pairs, setPairs] = useState<Pair[]>([])
  const [urls, setUrls] = useState<Urls>({})
  const [state, setState] = useState<'loading' | 'ok' | 'gone' | 'error'>('loading')
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    let live = true
    const made: string[] = []
    ;(async () => {
      try {
        const res = await post({ id, action: 'view' })
        if (!live) return
        if (res.status === 404) return setState('gone')
        if (!res.ok) return setState('error')
        const data = (await res.json()) as { pairs: Pair[] }
        if (!live) return
        if (!data.pairs?.length) return setState('gone')
        setPairs(data.pairs)
        setState('ok')
        // One at a time, in order, so the first pairs appear first.
        for (const p of data.pairs) {
          for (const side of ['before', 'after'] as const) {
            const r = await post({ id, action: 'photo', photo: p.id, side }).catch(() => null)
            if (!live) return
            if (!r?.ok) continue
            const url = URL.createObjectURL(await r.blob())
            made.push(url)
            setUrls((u) => ({ ...u, [p.id]: { ...u[p.id], [side]: url } }))
          }
        }
      } catch {
        if (live) setState('error')
      }
    })()
    return () => {
      live = false
      made.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [id])

  const book = 'block w-full rounded-xl px-5 py-4 text-center text-base font-semibold transition-colors'
  const img = (src: string | undefined, label: string) => (
    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-black/40">
      {/* eslint-disable-next-line @next/next/no-img-element -- a blob from the records app */}
      {src && <img src={src} alt={label} className="h-full w-full object-cover" />}
      <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">{label}</span>
    </div>
  )
  const current = open !== null ? pairs[open] : null

  return (
    <div className="space-y-4">
      <h1 className="px-1 text-3xl font-semibold text-plum-900" style={heading}>
        Real results
      </h1>
      <Section title="Before & after" badge={state === 'ok' ? `${pairs.length}` : undefined}>
        {state === 'loading' && <p className="text-sm text-gray-500">Loading…</p>}
        {state === 'gone' && (
          <p className="text-sm text-gray-600">
            This link is no longer shared. You can still book a complimentary consult below, or call or text us.
          </p>
        )}
        {state === 'error' && <p className="text-sm text-gray-600">We could not load these photos just now. Please try again in a moment.</p>}
        {state === 'ok' && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Clients of Magnolia Skin Center in Burbank who agreed to share their results. Tap a pair to see it larger.
            </p>
            <div className="space-y-5">
              {pairs.map((p, i) => (
                <button key={p.id} onClick={() => setOpen(i)} className="block w-full text-left">
                  <div className="grid grid-cols-2 gap-2">
                    {img(urls[p.id]?.before, 'Before')}
                    {img(urls[p.id]?.after, 'After')}
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900">{p.treatment}</p>
                  <p className="text-xs text-gray-600">{p.afterLabel}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </Section>

      <Section title="Curious what we&rsquo;d suggest for you?">
        <p className="text-sm text-gray-600 mb-5">
          Every plan starts with a conversation. Pick whichever suits you — the first two are complimentary.
        </p>
        <div className="space-y-3">
          <a href={videoConsultUrl} target="_blank" rel="noopener noreferrer" className={`${book} bg-brand-600 text-white hover:bg-brand-700`}>
            Book a complimentary 15-minute video consult
          </a>
          <Link href="/photo-consult" className={`${book} border border-brand-600 text-brand-700 hover:bg-brand-50`}>
            Get a complimentary photo consult
          </Link>
          <Link href="/booking" className={`${book} border border-brand-600 text-brand-700 hover:bg-brand-50`}>
            Book an in-person visit
          </Link>
        </div>
        {phone && (
          <p className="mt-4 text-center text-sm text-gray-600">
            Or call or text us at{' '}
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="text-brand-700 font-medium">{phone}</a>
          </p>
        )}
      </Section>

      {current && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black text-white" role="dialog" aria-modal="true" aria-label="Before and after">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-base font-semibold">{current.treatment}</p>
              <p className="text-xs text-white/70">{current.afterLabel} · {open! + 1} of {pairs.length}</p>
            </div>
            <button onClick={() => setOpen(null)} className="px-2 text-2xl leading-none" aria-label="Close">✕</button>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 px-2">
            {(['before', 'after'] as const).map((side) => (
              <div key={side} className="relative flex min-h-0 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- a blob from the records app */}
                {urls[current.id]?.[side] && <img src={urls[current.id]![side]} alt={side} className="max-h-full max-w-full object-contain" />}
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold">{side === 'before' ? 'Before' : 'After'}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <button disabled={open === 0} onClick={() => setOpen((v) => (v ?? 1) - 1)} className="rounded-lg border border-white/30 px-4 py-2 disabled:opacity-30">‹ Previous</button>
            <button disabled={open === pairs.length - 1} onClick={() => setOpen((v) => (v ?? 0) + 1)} className="rounded-lg border border-white/30 px-4 py-2 disabled:opacity-30">Next ›</button>
          </div>
        </div>
      )}
    </div>
  )
}
