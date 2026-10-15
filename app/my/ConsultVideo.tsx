'use client'
/**
 * One of Dr. David's videos, played IN the portal card (10-15, Eric: it opened
 * a new tab). The records API sends the video file and poster from the Visage
 * share behind the link; ⤢ Full screen expands it. Without a file (an older
 * API, or Visage slow to answer) it falls back to the old Watch link.
 *
 * 📤 Share this video uses `shareUrl` — the take's notes-free copy on Visage,
 * the same one Visage's own "share your photo consult" hands out — NEVER `url`,
 * which carries Dr. David's notes. Same share sheet as "Your progress".
 */
import { useRef, useState } from 'react'
import ShareSheet from '@/components/ShareSheet'

export type ConsultVideoItem = {
  url: string
  file?: string
  poster?: string
  shareUrl?: string
  kind?: 'ai' | 'real'
}

const outline =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-brand-600 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors'

export default function ConsultVideo({ v, watchClass }: { v: ConsultVideoItem; watchClass: string }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [sharing, setSharing] = useState(false)

  const expand = () => {
    const el = ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (!el) return
    // iPhone Safari has no element fullscreen for video — only its own player.
    if (el.requestFullscreen) el.requestFullscreen().catch(() => el.webkitEnterFullscreen?.())
    else el.webkitEnterFullscreen?.()
  }

  return (
    <div className="space-y-3">
      {v.file ? (
        <>
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: '9 / 16', maxHeight: '70vh' }}>
            <video
              ref={ref}
              src={v.file}
              poster={v.poster}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={expand} className={outline}>⤢ Full screen</button>
            {v.shareUrl && (
              <button type="button" onClick={() => setSharing((s) => !s)} aria-expanded={sharing} className={outline}>
                📤 Share this video
              </button>
            )}
          </div>
          <p className="text-center">
            <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:text-brand-700">
              Open the full page, with Dr. David&rsquo;s notes ↗
            </a>
          </p>
        </>
      ) : (
        <a href={v.url} target="_blank" rel="noopener noreferrer" className={watchClass + ' text-center block'}>
          ▶ Watch
        </a>
      )}
      {sharing && v.shareUrl && (
        <ShareSheet
          text={
            v.kind === 'real'
              ? 'Here is my journey at Magnolia Skin Center in Burbank — have a look:'
              : 'Here is my consultation preview from Magnolia Skin Center in Burbank — have a look:'
          }
          url={v.shareUrl}
          subject="My video from Magnolia Skin Center"
          note={
            <>
              The video only — Dr. David&rsquo;s notes are not included. Anyone with the link can watch it.
              {v.kind !== 'real' && ' AI images are simulations, not a guarantee of results.'}
            </>
          }
        />
      )}
    </div>
  )
}

/** An earlier video: its label, and ▶ Play opens the player right here. */
export function EarlierVideo({ v, label, title, note, watchClass }: {
  v: ConsultVideoItem
  label: string
  title: string
  note: string
  watchClass: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <li className="py-3 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {title && <p className="text-sm text-gray-700 truncate">{title}</p>}
          <p className="text-xs text-gray-600 mt-0.5">{note}</p>
        </div>
        {v.file ? (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700">
            {open ? 'Close' : '▶ Play'}
          </button>
        ) : (
          <a href={v.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700">
            ▶ Watch
          </a>
        )}
      </div>
      {open && v.file && <ConsultVideo v={v} watchClass={watchClass} />}
    </li>
  )
}
