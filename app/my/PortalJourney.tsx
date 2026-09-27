'use client'
/**
 * "Your progress" — the patient's own photos, oldest to newest, one angle at
 * a time; or just their first and latest side by side (2026-09-27, asked for
 * by Eileen). The chart's Client journey, minus anything the clinic hid.
 *
 * The page never holds a storage path or a public URL. Each photo is an
 * opaque id; the image is fetched from the records API with the portal
 * session, which re-checks it every time and answers no-store. Images live
 * only as blob: URLs in this tab and are released when it moves on.
 */
import { useEffect, useMemo, useState } from 'react'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

export type Journey = {
  slotOrder: string[]
  points: { label: string; date: string; photos: Record<string, string> }[]
}

function shortDate(v?: string): string {
  if (!v) return ''
  // A bare YYYY-MM-DD is a calendar day; read as UTC it prints a day early.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T12:00:00`) : new Date(v)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** One photo, fetched through the portal with the session. */
function PortalPhoto({ token, session, id, alt, className }: {
  token: string; session: string; id: string; alt: string; className?: string
}) {
  const [src, setSrc] = useState('')
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let url = ''
    let live = true
    fetch(`${API}/api/public/portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, session, action: 'photo', photo: id }),
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status))
        url = URL.createObjectURL(await res.blob())
        if (live) setSrc(url)
      })
      .catch(() => live && setFailed(true))
    return () => {
      live = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [token, session, id])
  if (failed) return <div className={`${className} flex items-center justify-center text-xs text-gray-400`}>Could not load</div>
  if (!src) return <div className={`${className} animate-pulse bg-gray-100`} />
  // eslint-disable-next-line @next/next/no-img-element -- a blob: URL, not an optimisable asset
  return <img src={src} alt={alt} className={className} />
}

export default function PortalJourney({ journey, token, session }: {
  journey: Journey; token: string; session: string
}) {
  const slots = useMemo(() => {
    const seen: string[] = []
    for (const p of journey.points) for (const s of Object.keys(p.photos)) if (!seen.includes(s)) seen.push(s)
    return [...journey.slotOrder.filter((s) => seen.includes(s)), ...seen.filter((s) => !journey.slotOrder.includes(s))]
  }, [journey])
  const [slot, setSlot] = useState('')
  const [mode, setMode] = useState<'firstLatest' | 'timeline'>('firstLatest')
  const [open, setOpen] = useState<number | null>(null)

  if (!slots.length) return null
  const current = slots.includes(slot) ? slot : slots[0]
  const all = journey.points.filter((p) => !!p.photos[current])
  const pair = all.length >= 2
  const columns = mode === 'firstLatest' && pair ? [all[0], all[all.length - 1]] : all

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {slots.map((s) => (
          <button
            key={s}
            onClick={() => setSlot(s)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              s === current ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {pair && (
        <div className="inline-flex rounded-xl bg-gray-100 p-1 text-sm font-medium">
          {([['firstLatest', 'First & latest'], ['timeline', 'Every photo']] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                mode === m ? 'bg-white text-plum-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className={mode === 'firstLatest' && pair ? 'grid grid-cols-2 gap-3' : 'flex gap-3 overflow-x-auto pb-2'}>
        {columns.map((p, i) => (
          <figure key={`${p.label}-${i}`} className={mode === 'firstLatest' && pair ? '' : 'w-40 shrink-0 sm:w-48'}>
            <button
              onClick={() => setOpen(i)}
              className="block aspect-[9/16] w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
              aria-label={`Open ${p.label} ${current}`}
            >
              <PortalPhoto token={token} session={session} id={p.photos[current]} alt={`${p.label} — ${current}`} className="h-full w-full object-cover" />
            </button>
            <figcaption className="mt-1.5">
              {mode === 'firstLatest' && pair && (
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                  {i === 0 ? 'First' : 'Latest'}
                </span>
              )}
              <span className="block text-sm font-medium text-gray-800">{p.label}</span>
              {shortDate(p.date) && <span className="block text-xs text-gray-500">{shortDate(p.date)}</span>}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Full size, one at a time, with the neighbours a tap away. A dark
          surround, so skin tone reads true. */}
      {open !== null && columns[open] && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm">
              {columns[open].label}
              {shortDate(columns[open].date) ? ` · ${shortDate(columns[open].date)}` : ''}
            </span>
            <button onClick={() => setOpen(null)} className="text-2xl leading-none" aria-label="Close">×</button>
          </div>
          <div className="flex flex-1 items-center justify-center px-2 pb-4">
            <PortalPhoto
              key={columns[open].photos[current]}
              token={token}
              session={session}
              id={columns[open].photos[current]}
              alt={`${columns[open].label} — ${current}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          {columns.length > 1 && (
            <div className="flex justify-between px-4 pb-6 text-white">
              <button disabled={open === 0} onClick={() => setOpen(open - 1)} className="rounded-lg px-4 py-2 disabled:opacity-30">‹ Earlier</button>
              <button disabled={open === columns.length - 1} onClick={() => setOpen(open + 1)} className="rounded-lg px-4 py-2 disabled:opacity-30">Later ›</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
