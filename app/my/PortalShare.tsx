'use client'
/**
 * "Share your journey" — under Your progress (2026-09-28).
 *
 * The patient ticks which photos go out (First & latest of each angle to
 * start), and gets ONE link to a public page — /journey/[id] on this site —
 * showing only those, with no name, plus the clinic's booking buttons. Friends
 * and family see the result and can book a video, in-person or photo consult.
 *
 * The records app holds the share (journey_shares, lib/journeyShare.ts there)
 * and re-checks every photo against what the patient can see on each load, so
 * a photo the clinic hides drops out and "Stop sharing" kills the link at once.
 *
 * Also "Recommend Magnolia Skin Center" — the clinic's own site, with nothing
 * of the patient's in it, for anyone who would rather not share photos.
 */
import { useMemo, useState } from 'react'
import ShareSheet from '@/components/ShareSheet'
import { PortalPhoto, treatmentsOf, type Journey, type PhotoLoader } from './PortalJourney'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

export type JourneyShare = { id: string; photoIds: string[] } | null

/** First and latest of every angle OF EACH TREATMENT — the default selection. */
function firstAndLatest(journey: Journey): string[] {
  const out = new Set<string>()
  for (const t of treatmentsOf(journey)) {
    const pts = journey.points.filter((p) => (p.treatment ?? '') === t)
    const slots = new Set(pts.flatMap((p) => Object.keys(p.photos)))
    for (const s of Array.from(slots)) {
      const run = pts.filter((p) => p.photos[s])
      if (run.length) {
        out.add(run[0].photos[s])
        out.add(run[run.length - 1].photos[s])
      }
    }
  }
  return Array.from(out)
}

export default function PortalShare({ journey, share, load, token, session, onChanged }: {
  journey: Journey
  share: JourneyShare
  load: PhotoLoader
  token: string
  session: string
  onChanged: () => void
}) {
  const [picking, setPicking] = useState(false)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showRefer, setShowRefer] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl = share ? `${origin}/journey/${share.id}` : ''

  // Treatment by treatment, then angle by angle, oldest first — the same
  // order as Your progress, so "Front" of Agnes RF and "Front" of Plasmage
  // are separate rows to pick from.
  const rows = useMemo(() => {
    const multi = treatmentsOf(journey).length > 1
    return treatmentsOf(journey).flatMap((t) => {
      const pts = journey.points.filter((p) => (p.treatment ?? '') === t)
      const slots: string[] = []
      for (const s of journey.slotOrder) if (pts.some((p) => p.photos[s])) slots.push(s)
      for (const p of pts) for (const s of Object.keys(p.photos)) if (!slots.includes(s)) slots.push(s)
      return slots.map((s) => ({
        key: `${t}|${s}`,
        slot: s,
        title: multi && t ? `${t} · ${s}` : s,
        points: pts.filter((p) => p.photos[s]),
      }))
    })
  }, [journey])

  const startPicking = () => {
    // Editing starts from what is shared now (minus anything since hidden).
    const visible = new Set(journey.points.flatMap((p) => Object.values(p.photos)))
    const current = share?.photoIds.filter((id) => visible.has(id)) ?? []
    setPicked(new Set(current.length ? current : firstAndLatest(journey)))
    setError('')
    setPicking(true)
  }

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const post = async (extra: Record<string, unknown>) => {
    const res = await fetch(`${API}/api/public/portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, session, ...extra }),
    })
    if (!res.ok) throw new Error(String(res.status))
  }

  const save = async () => {
    if (!picked.size) return
    setBusy(true)
    setError('')
    try {
      await post({ action: 'share-journey', photos: Array.from(picked) })
      setPicking(false)
      onChanged()
    } catch {
      setError('We could not make your link just now. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const stop = async () => {
    setBusy(true)
    setError('')
    try {
      await post({ action: 'stop-sharing' })
      onChanged()
    } catch {
      setError('We could not stop it just now. Please try again, or call or text us.')
    } finally {
      setBusy(false)
    }
  }

  const outline =
    'w-full rounded-xl border border-dashed border-brand-600 px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors disabled:opacity-50'

  return (
    <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
      {picking ? (
        <div className="space-y-4">
          <div>
            <p className="text-base font-semibold text-plum-900">Which photos do you want to share?</p>
            <p className="mt-1 text-sm text-gray-600">
              Tap a photo to add or remove it. Anyone you send the link to can see the ones you
              tick — your name is not on the page.
            </p>
          </div>
          {rows.map((r) => (
            <div key={r.key}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">{r.title}</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {r.points.map((p, i) => {
                  const id = p.photos[r.slot]
                  const on = picked.has(id)
                  return (
                    <button
                      key={`${id}-${i}`}
                      type="button"
                      onClick={() => toggle(id)}
                      aria-pressed={on}
                      className={`relative w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        on ? 'border-brand-600' : 'border-transparent opacity-60'
                      }`}
                    >
                      <PortalPhoto load={load} id={id} alt={`${p.label} — ${r.slot}`} className="aspect-[9/16] w-full object-cover" />
                      <span
                        className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                          on ? 'bg-brand-600 text-white' : 'bg-white/90 text-gray-400'
                        }`}
                      >
                        {on ? '✓' : ''}
                      </span>
                      <span className="block truncate bg-white px-1 py-0.5 text-[10px] text-gray-600">
                        {p.label.split(' · ')[0]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={busy || picked.size === 0}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? 'Saving…' : share ? `Update my link (${picked.size})` : `Make my link (${picked.size})`}
            </button>
            <button type="button" onClick={() => setPicking(false)} className="rounded-xl px-4 py-3 text-sm text-gray-600">
              Cancel
            </button>
          </div>
        </div>
      ) : share ? (
        <div className="space-y-3">
          <p className="text-base font-semibold text-plum-900">Your shared journey</p>
          <ShareSheet
            text="Here are my results from Magnolia Skin Center in Burbank — have a look:"
            url={shareUrl}
            subject="My results at Magnolia Skin Center"
            note={
              <>
                You are sharing {share.photoIds.length} photo{share.photoIds.length === 1 ? '' : 's'}, with no name.
                Anyone with the link can see them until you stop sharing. They can book their own
                consult from the page.
              </>
            }
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-4 text-sm">
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700">
              See what they see
            </a>
            <button type="button" onClick={startPicking} disabled={busy} className="text-brand-600 hover:text-brand-700">
              Change photos
            </button>
            <button type="button" onClick={stop} disabled={busy} className="text-red-600 hover:text-red-700">
              Stop sharing
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={startPicking} className={outline}>
          📤 Share your journey with friends &amp; family
        </button>
      )}

      {!picking && (
        <>
          <button type="button" onClick={() => setShowRefer((v) => !v)} aria-expanded={showRefer} className={outline}>
            💬 Recommend Magnolia Skin Center
          </button>
          {showRefer && (
            <ShareSheet
              text="I've been going to Magnolia Skin Center in Burbank and love it. You can book a complimentary consult here:"
              url={`${origin}/`}
              subject="Magnolia Skin Center"
              note="Just the clinic's website — no photos of yours, and nothing about you."
            />
          )}
        </>
      )}
    </div>
  )
}
