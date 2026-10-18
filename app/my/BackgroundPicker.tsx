'use client'
/**
 * "🎨 Your background" (10-17, Eric) — the client picks what sits behind the
 * cards: a colour, two colours, or a drawn scene. It applies at once and is
 * saved on their chart (records portal action "set-background"), so it follows
 * them to every device. The cards, wording and Magnolia colours never change.
 * Photos show as thumbnails here; the full photo loads only once chosen.
 */
import { useRef, useState } from 'react'
import { GRADIENTS, PHOTOS, SOLIDS, backgroundFor, type BgOption } from './backgrounds'

const swatch = 'relative h-14 rounded-xl border-2 transition-transform hover:scale-[1.03] focus:outline-none'

function Swatch({ o, picked, onPick, tall }: { o: BgOption; picked: boolean; onPick: (v: string) => void; tall?: boolean }) {
  const look = backgroundFor(o.value)
  return (
    <button
      type="button"
      onClick={() => onPick(o.value)}
      aria-pressed={picked}
      title={o.name}
      className={`${swatch} ${tall ? 'h-28' : ''}`}
      style={{ background: look?.thumb ?? look?.css, backgroundSize: 'cover', backgroundPosition: 'center', borderColor: picked ? '#ffffff' : 'transparent', boxShadow: picked ? '0 0 0 2px #79a090' : undefined }}
    >
      <span className="absolute inset-x-0 bottom-0 rounded-b-[10px] bg-black/45 px-1 py-0.5 text-[11px] font-semibold text-white">{o.name}</span>
    </button>
  )
}

export default function BackgroundPicker({ value, onChange, onClose }: {
  value: string
  /** Apply now; resolves false if it could not be saved. */
  onChange: (next: string) => Promise<boolean>
  onClose: () => void
}) {
  const [one, setOne] = useState(value.startsWith('solid:') ? value.slice(6) : '#f4b6c2')
  const [two, setTwo] = useState<[string, string]>(
    value.startsWith('grad:') ? (value.slice(5).split(',') as [string, string]) : ['#ff9a8b', '#6a5acd'],
  )
  const [error, setError] = useState('')
  // "Pick any": apply once the colour stops moving (dragging fires on every step).
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pick = async (v: string) => {
    setError('')
    if (!(await onChange(v))) setError('We could not save that just now — it will go back next time. Please try again.')
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-gray-900">🎨 Your background</p>
        <button type="button" onClick={onClose} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          Done
        </button>
      </div>

      {/* First, so nobody has to hunt for the way back (10-17, Eric). */}
      <button
        type="button"
        onClick={() => pick('')}
        aria-pressed={value === ''}
        className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors ${
          value === '' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-900 hover:bg-gray-50'
        }`}
      >
        {value === '' ? '✓ ' : ''}Standard — no background
      </button>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Colors</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {SOLIDS.map((o) => <Swatch key={o.value} o={o} picked={value === o.value} onPick={pick} />)}
          <label className={`${swatch} flex cursor-pointer items-center justify-center border-dashed border-gray-300 text-xs font-semibold text-gray-700`}>
            Pick any
            <input
              type="color"
              value={one}
              onChange={(e) => {
                const c = e.target.value.toLowerCase()
                setOne(c)
                if (settle.current) clearTimeout(settle.current)
                settle.current = setTimeout(() => pick(`solid:${c}`), 500)
              }}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Pick any color"
            />
          </label>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Two colors</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADIENTS.map((o) => <Swatch key={o.value} o={o} picked={value === o.value} onPick={pick} />)}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-700">
          Your own:
          <input type="color" value={two[0]} onChange={(e) => setTwo([e.target.value, two[1]])} aria-label="First color" className="h-9 w-12 cursor-pointer rounded border border-gray-300" />
          <input type="color" value={two[1]} onChange={(e) => setTwo([two[0], e.target.value])} aria-label="Second color" className="h-9 w-12 cursor-pointer rounded border border-gray-300" />
          <button type="button" onClick={() => pick(`grad:${two[0].toLowerCase()},${two[1].toLowerCase()}`)} className="rounded-lg border border-brand-600 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            Use these
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Photos</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {PHOTOS.map((o) => <Swatch key={o.value} o={o} picked={value === o.value} onPick={pick} tall />)}
        </div>
        <p className="mt-2 text-[11px] text-gray-500">Photos from Unsplash.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
