'use client'
/**
 * One angle, full screen, stepping through time — with the zoom held still.
 *
 * A port of the staff app's viewer (medspa_records components/PhotoLightbox),
 * so the patient's popup behaves exactly like the clinic's (2026-09-28, Eric):
 * zoom and pan live ABOVE the slides, so framing one part of the face — the
 * jawline, a spot — and stepping Before → After → 1 month keeps the same
 * square inch in view. That is the whole point of comparing.
 *
 * Differences from the staff copy, both for a patient on a phone:
 *  - pinch to zoom (two fingers), as well as the − / + buttons and the wheel;
 *  - rendered into document.body through a portal, so nothing on the page
 *    (a sticky bar, a card) can sit on top of it.
 *
 * Photos come through `load` — the portal session, or a share link — never a
 * path or a public URL. White-on-black on purpose: a clinical photograph is
 * judged against a neutral dark surround. Colours are arbitrary values
 * (`bg-[#fff]`) where they must not follow `.portal-dark`'s remapping.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PortalPhoto, type PhotoLoader } from './PortalJourney'

export interface LightboxSlide {
  /** "Before · Agnes RF", "1 month" — the timepoint. */
  label: string
  /** Caption under the label — the date. */
  sub?: string
  /** Opaque photo id. */
  id: string
}

const MIN_ZOOM = 1
const MAX_ZOOM = 6

export default function PhotoLightbox({ slides, index, title, load, onIndex, onClose }: {
  slides: LightboxSlide[]
  index: number
  /** The angle being compared, shown in the corner. */
  title: string
  load: PhotoLoader
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  /** Active pointers, for pinch: id → position. */
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null)

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))

  const reset = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onIndex(Math.min(slides.length - 1, index + 1))
      else if (e.key === 'ArrowLeft') onIndex(Math.max(0, index - 1))
      else if (e.key === '+' || e.key === '=') setZoom((z) => clampZoom(z + 0.5))
      else if (e.key === '-') setZoom((z) => clampZoom(z - 0.5))
      else if (e.key === '0') reset()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, slides.length, onIndex, onClose, reset])

  // The page must not scroll behind the overlay — on a phone you end up
  // dragging the page instead of the photograph.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const slide = slides[index]
  if (!slide || typeof document === 'undefined') return null

  const distance = () => {
    const [a, b] = Array.from(pointers.current.values())
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0
  }

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      // Second finger down: a pinch, not a drag.
      dragRef.current = null
      pinchRef.current = { dist: distance(), zoom }
      return
    }
    if (zoom === 1) return
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
    setDragging(true)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pinch = pinchRef.current
    if (pinch && pointers.current.size >= 2 && pinch.dist > 0) {
      setZoom(clampZoom(pinch.zoom * (distance() / pinch.dist)))
      return
    }
    const d = dragRef.current
    if (!d) return
    setPan({ x: d.panX + (e.clientX - d.x), y: d.panY + (e.clientY - d.y) })
  }
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchRef.current = null
    dragRef.current = null
    setDragging(false)
    // Zoomed all the way out: centre it again, or a leftover pan leaves the
    // photo off to one side at 1×.
    if (zoom <= MIN_ZOOM) setPan({ x: 0, y: 0 })
  }

  const ctl = 'rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white'

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — ${slide.label}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="text-xs text-white/70">
            {slide.label}
            {slide.sub ? ` · ${slide.sub}` : ''} · {index + 1} of {slides.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          Close ✕
        </button>
      </div>

      <div
        className="relative flex-1 touch-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={(e) => setZoom((z) => clampZoom(z - Math.sign(e.deltaY) * 0.25))}
        style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <PortalPhoto
            key={slide.id}
            load={load}
            id={slide.id}
            alt={`${title} — ${slide.label}`}
            className="pointer-events-none max-h-full max-w-full select-none object-contain"
          />
        </div>

        {index > 0 && (
          <button
            onClick={() => onIndex(index - 1)}
            className="absolute left-2 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-black/50 text-xl text-white hover:bg-black/70"
            aria-label="Previous"
          >
            ‹
          </button>
        )}
        {index < slides.length - 1 && (
          <button
            onClick={() => onIndex(index + 1)}
            className="absolute right-2 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-black/50 text-xl text-white hover:bg-black/70"
            aria-label="Next"
          >
            ›
          </button>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 px-4 py-3 text-white">
        <button onClick={() => setZoom((z) => clampZoom(z - 0.5))} disabled={zoom <= MIN_ZOOM} className={`${ctl} h-10 w-10 text-lg`} aria-label="Zoom out">
          −
        </button>
        <span className="w-12 text-center text-xs tabular-nums">{zoom.toFixed(1)}×</span>
        <button onClick={() => setZoom((z) => clampZoom(z + 0.5))} disabled={zoom >= MAX_ZOOM} className={`${ctl} h-10 w-10 text-lg`} aria-label="Zoom in">
          +
        </button>
        <button onClick={reset} disabled={zoom === 1 && pan.x === 0 && pan.y === 0} className={`${ctl} ml-2 h-10 px-3 text-xs`}>
          Reset view
        </button>

        <div className="flex w-full flex-wrap justify-center gap-1.5 sm:ml-4 sm:w-auto">
          {slides.map((s, i) => (
            <button
              key={`${s.label}-${i}`}
              onClick={() => onIndex(i)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                i === index ? 'bg-[#ffffff] text-[#111827]' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {zoom > 1 && (
        <p className="pb-3 text-center text-[11px] text-white/60">
          Drag to move. The zoom stays put as you step through — frame the spot once, then compare.
        </p>
      )}
    </div>,
    document.body,
  )
}
