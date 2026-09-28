'use client'
/**
 * "Your progress" — the patient's own photos, one treatment at a time, one
 * angle at a time, as a SLIDESHOW (2026-09-28): oldest to newest in one
 * frame, with arrows, swipe, a counter and Play. Or the first and latest side
 * by side. The chart's Client journey, minus anything the clinic hid.
 *
 * Tap a photo and it pops up in the same viewer the clinic uses
 * (PhotoLightbox): zoom that holds as you step through, pinch, drag, Reset
 * view, and every timepoint along the bottom.
 *
 * The page never holds a storage path or a public URL. Each photo is an
 * opaque id; the image is fetched from the records API, which re-checks it
 * every time and answers no-store. Images live only as blob: URLs in this tab
 * and are released when it moves on. Every frame of the run is mounted once
 * and cross-faded, so stepping or playing never re-downloads a photo.
 *
 * The same viewer draws a shared journey (/journey/[id]) — only how a photo
 * is fetched differs, so that is passed in as `load`.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import PhotoLightbox from './PhotoLightbox'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

export type Journey = {
  slotOrder: string[]
  /** `treatment` — one journey per treatment name (2026-09-28). Optional so an
   *  older records API that does not send it still draws, as one journey. */
  points: {
    label: string
    date: string
    treatment?: string
    /** Every treatment in the visit — a stacked visit is in each one's journey. */
    treatments?: string[]
    photos: Record<string, string>
  }[]
}

/** The treatments a point belongs to (older API: just `treatment`). */
export function treatmentsOfPoint(p: Journey['points'][number]): string[] {
  return p.treatments?.length ? p.treatments : [p.treatment ?? '']
}

/** The treatments in a journey, oldest first — the order they began. */
export function treatmentsOf(journey: Journey): string[] {
  const out: string[] = []
  for (const p of journey.points) {
    for (const t of treatmentsOfPoint(p)) if (!out.includes(t)) out.push(t)
  }
  return out
}

function shortDate(v?: string): string {
  if (!v) return ''
  // A bare YYYY-MM-DD is a calendar day; read as UTC it prints a day early.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T12:00:00`) : new Date(v)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Fetches one photo's bytes by opaque id. */
export type PhotoLoader = (id: string) => Promise<Response>

/** The portal's loader: the patient's own session. */
export function portalLoader(token: string, session: string): PhotoLoader {
  return (id) =>
    fetch(`${API}/api/public/portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, session, action: 'photo', photo: id }),
      cache: 'no-store',
    })
}

/** One photo, as a blob: URL released when it leaves the screen. */
export function PortalPhoto({ load, id, alt, className }: {
  load: PhotoLoader; id: string; alt: string; className?: string
}) {
  const [src, setSrc] = useState('')
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let url = ''
    let live = true
    load(id)
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
  }, [load, id])
  if (failed) return <div className={`${className} flex items-center justify-center text-xs text-gray-400`}>Could not load</div>
  if (!src) return <div className={`${className} animate-pulse bg-gray-100`} />
  // eslint-disable-next-line @next/next/no-img-element -- a blob: URL, not an optimisable asset
  return <img src={src} alt={alt} className={className} />
}

const PLAY_MS = 2500

export default function PortalJourney({ journey, load }: {
  journey: Journey; load: PhotoLoader
}) {
  // One journey per treatment: Agnes RF on the face and Plasmage on the neck
  // share the face angles, and in one row they read as one story. Opens on the
  // most recent treatment.
  const treatments = useMemo(() => treatmentsOf(journey), [journey])
  const latest = journey.points.length ? treatmentsOfPoint(journey.points[journey.points.length - 1])[0] : ''
  const [treatment, setTreatment] = useState<string | null>(null)
  const currentTreatment = treatment !== null && treatments.includes(treatment) ? treatment : latest
  const points = useMemo(
    () => journey.points.filter((p) => treatmentsOfPoint(p).includes(currentTreatment)),
    [journey, currentTreatment],
  )

  const slots = useMemo(() => {
    const seen: string[] = []
    for (const p of points) for (const s of Object.keys(p.photos)) if (!seen.includes(s)) seen.push(s)
    return [...journey.slotOrder.filter((s) => seen.includes(s)), ...seen.filter((s) => !journey.slotOrder.includes(s))]
  }, [journey, points])
  const [slot, setSlot] = useState('')
  const [mode, setMode] = useState<'slideshow' | 'firstLatest'>('slideshow')
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  /** The popup: which photo of the run it is open on, or null. */
  const [popup, setPopup] = useState<number | null>(null)
  const touchX = useRef<number | null>(null)

  const current = slots.includes(slot) ? slot : slots[0] ?? ''
  const run = points.filter((p) => !!p.photos[current])
  const at = Math.min(index, Math.max(0, run.length - 1))
  const pair = run.length >= 2

  // Autoplay steps forward and loops; any manual step stops it.
  useEffect(() => {
    if (!playing || run.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % run.length), PLAY_MS)
    return () => clearInterval(t)
  }, [playing, run.length])

  if (!slots.length) return null

  const go = (i: number) => {
    setPlaying(false)
    setIndex((i + run.length) % run.length)
  }
  const pick = (fn: () => void) => {
    fn()
    setIndex(0)
    setPlaying(false)
  }

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      on ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
    }`
  const arrow =
    'absolute top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-2xl leading-none text-white hover:bg-black/70'

  return (
    <div className="space-y-4">
      {treatments.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Treatment">
          {treatments.map((t) => (
            <button
              key={t}
              onClick={() => pick(() => setTreatment(t))}
              aria-pressed={t === currentTreatment}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                t === currentTreatment ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t || 'Other'}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Angle">
        {slots.map((s) => (
          <button key={s} onClick={() => pick(() => setSlot(s))} className={chip(s === current)}>
            {s}
          </button>
        ))}
      </div>

      {pair && (
        <div className="inline-flex rounded-xl bg-gray-100 p-1 text-sm font-medium">
          {([['slideshow', 'Slideshow'], ['firstLatest', 'First & latest']] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => pick(() => setMode(m))}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                mode === m ? 'bg-white text-plum-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {mode === 'firstLatest' && pair ? (
        <div className="grid grid-cols-2 gap-3">
          {[run[0], run[run.length - 1]].map((p, i) => (
            <figure key={`${p.label}-${i}`}>
              <button
                onClick={() => { setPlaying(false); setPopup(i === 0 ? 0 : run.length - 1) }}
                className="mx-auto block aspect-[9/16] max-h-[45vh] max-w-full overflow-hidden rounded-xl bg-black"
                aria-label={`Open ${p.label} — ${current}`}
              >
                <PortalPhoto load={load} id={p.photos[current]} alt={`${p.label} — ${current}`} className="h-full w-full object-contain" />
              </button>
              <figcaption className="mt-1.5">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                  {i === 0 ? 'First' : 'Latest'}
                </span>
                <span className="block text-sm font-medium text-gray-800">{p.label}</span>
                {shortDate(p.date) && <span className="block text-xs text-gray-500">{shortDate(p.date)}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div>
          {/* One frame. Every photo of the run is mounted once and faded in
              turn, so Play and the arrows never re-fetch. */}
          <div
            className="relative mx-auto aspect-[9/16] h-[55vh] max-h-[560px] max-w-full overflow-hidden rounded-xl bg-black outline-none"
            onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null }}
            onTouchEnd={(e) => {
              const start = touchX.current
              touchX.current = null
              const end = e.changedTouches[0]?.clientX
              if (start === null || end === undefined || Math.abs(end - start) < 40) return
              go(end < start ? at + 1 : at - 1)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') go(at + 1)
              if (e.key === 'ArrowLeft') go(at - 1)
            }}
            tabIndex={0}
            role="region"
            aria-label={`${current} photos, ${at + 1} of ${run.length}`}
          >
            {run.map((p, i) => (
              <div
                key={`${p.photos[current]}-${i}`}
                className={`absolute inset-0 cursor-zoom-in transition-opacity duration-500 ${i === at ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                aria-hidden={i !== at}
                onClick={() => { setPlaying(false); setPopup(i) }}
              >
                <PortalPhoto load={load} id={p.photos[current]} alt={`${p.label} — ${current}`} className="h-full w-full object-contain" />
              </div>
            ))}
            {run.length > 1 && (
              <>
                <button onClick={() => go(at - 1)} className={`${arrow} left-2`} aria-label="Earlier">‹</button>
                <button onClick={() => go(at + 1)} className={`${arrow} right-2`} aria-label="Later">›</button>
              </>
            )}
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800">{run[at]?.label}</p>
              <p className="text-xs text-gray-500">
                {shortDate(run[at]?.date)}
                {run.length > 1 ? ` · ${at + 1} of ${run.length}` : ''}
              </p>
            </div>
            {run.length > 1 && (
              <button
                onClick={() => setPlaying((v) => !v)}
                className="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {playing ? '❚❚ Pause' : '▶ Play'}
              </button>
            )}
          </div>

          <p className="mt-1 text-xs text-gray-500">Tap the photo to open it full size and zoom in.</p>

          {run.length > 1 && (
            <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
              {run.map((_, i) => (
                <button
                  key={i}
                  tabIndex={-1}
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition-all ${i === at ? 'w-5 bg-brand-600' : 'w-2 bg-gray-300'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {popup !== null && run[popup] && (
        <PhotoLightbox
          slides={run.map((p) => ({ label: p.label, sub: shortDate(p.date), id: p.photos[current] }))}
          index={popup}
          title={`${currentTreatment ? `${currentTreatment} · ` : ''}${current}`}
          load={load}
          onIndex={(i) => { setPopup(i); setIndex(i) }}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  )
}
