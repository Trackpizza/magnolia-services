'use client'

/**
 * Agnes RF Targeted — "Build your journey" (11-07, Eric). Tap an area on the
 * face or body map (or its label) → what it does + its price + Add to total.
 * Packages are offered when they cover what was picked for less. 1 / 2 / 3
 * sessions (2 or 3 = that many times the price, less the package discount).
 * "Text us this plan" opens a text to the clinic with the list.
 *
 * "Use my photo": the front camera with the same head-and-shoulders guide the
 * records app uses; the dotted areas are then drawn over the client's own
 * face. THE PHOTO NEVER LEAVES THE DEVICE — it is held in this page's memory
 * only (no upload, no storage), and is gone on refresh.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { TargetedArea, TargetedPackage, TargetedView } from '@/config/targetedAreas'

type Area = TargetedArea
type Pkg = TargetedPackage

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`

// Small shapes drawn last so they stay tappable on top of big ones.
const DRAW_ORDER = ['forehead', 'neck', 'perioral', 'jawline', 'buccal', 'submental', 'nose', 'fat-pads', 'brow', 'upper-eyes', 'lower-eyes', 'lip', 'ear-lobe']
const drawRank = (id: string) => {
  const i = DRAW_ORDER.indexOf(id)
  return i < 0 ? 0 : i
}

const VIEWS: Record<Exclude<TargetedView, 'other'>, { box: string; leftX: number; rightX: number; font: number }> = {
  face: { box: '0 36 92 68', leftX: 25, rightX: 67, font: 2.45 },
  body: { box: '-14 0 128 170', leftX: 27, rightX: 73, font: 4.2 },
}

/** The line drawing behind the face map (when there's no photo). */
function FaceDrawing() {
  return (
    <g fill="none" stroke="#3d2b54" strokeOpacity={0.55} strokeWidth={0.45} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx={46} cy={62} rx={18} ry={24} />
      <path d="M28.2,58 C25.6,58 25.4,66 28.4,68.6 M63.8,58 C66.4,58 66.6,66 63.6,68.6" />
      <path d="M38,85 L38,96 C30,99 20,102 10,110 M54,85 L54,96 C62,99 72,102 82,110" />
      <path d="M36,52.2 Q39.5,50.9 43.4,52.2 M48.6,52.2 Q52.5,50.9 56,52.2" strokeOpacity={0.35} />
      <path d="M36.2,56.4 Q39.5,54.6 42.8,56.4 Q39.5,57.6 36.2,56.4 Z M49.2,56.4 Q52.5,54.6 55.8,56.4 Q52.5,57.6 49.2,56.4 Z" />
      <path d="M46,56 L46,63.8 M43.6,65.6 Q46,67 48.4,65.6" strokeOpacity={0.4} />
      <path d="M41.6,71.6 Q46,69.6 50.4,71.6 Q46,74.2 41.6,71.6 Z" />
    </g>
  )
}

function BodyDrawing() {
  return (
    <g fill="none" stroke="#3d2b54" strokeOpacity={0.55} strokeWidth={0.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={50} cy={13} r={8.5} />
      <path d="M46.5,21 L46.5,25 M53.5,21 L53.5,25" />
      <path d="M36,29 Q50,24.5 64,29 L62.6,56 Q61.4,70 64.6,88 L35.4,88 Q38.6,70 37.4,56 Z" />
      <path d="M36,29.6 Q31,31.6 30.4,44 L29,80 M64,29.6 Q69,31.6 69.6,44 L71,80" />
      <path d="M35.4,88 L39,159 L46.8,160.6 L49,96 M51,96 L53.2,160.6 L61,159 L64.6,88" />
    </g>
  )
}

function Map({
  view,
  areas,
  photo,
  selected,
  covered,
  active,
  onTap,
}: {
  view: 'face' | 'body'
  areas: Area[]
  photo: string | null
  selected: Set<string>
  covered: Set<string>
  active: string | null
  onTap: (id: string) => void
}) {
  const v = VIEWS[view]
  const onPhoto = view === 'face' && !!photo
  const shown = [...areas].filter((a) => a.view === view).sort((a, b) => drawRank(a.id) - drawRank(b.id))
  return (
    <svg viewBox={v.box} className="w-full h-auto select-none" role="group" aria-label={view === 'face' ? 'Face areas' : 'Body areas'}>
      {onPhoto ? (
        <>
          <image href={photo!} x={0} y={0} width={92} height={160} preserveAspectRatio="xMidYMid slice" />
          <rect x={0} y={0} width={92} height={160} fill="#000" opacity={0.12} />
        </>
      ) : view === 'face' ? (
        <FaceDrawing />
      ) : (
        <BodyDrawing />
      )}

      {shown.map((a) => {
        const on = selected.has(a.id)
        const inPkg = covered.has(a.id)
        const isActive = active === a.id
        const fill = on ? '#4d8e7b' : inPkg ? '#68a693' : onPhoto ? '#ffffff' : '#4d8e7b'
        const fillOpacity = on ? 0.5 : inPkg ? 0.35 : isActive ? 0.3 : onPhoto ? 0.04 : 0.06
        return (
          <g key={a.id} onClick={() => onTap(a.id)} className="cursor-pointer" role="button" aria-label={a.name} aria-pressed={on}>
            {(a.shapes ?? []).map((d, i) => (
              <g key={i}>
                {onPhoto && <path d={d} fill="none" stroke="#000" strokeOpacity={0.45} strokeWidth={view === 'face' ? 0.7 : 1.1} />}
                <path
                  d={d}
                  fillRule="evenodd"
                  fill={fill}
                  fillOpacity={fillOpacity}
                  stroke={onPhoto ? '#fff' : on || inPkg ? '#325f52' : '#3d7464'}
                  strokeWidth={(view === 'face' ? 0.32 : 0.55) * (isActive ? 1.8 : 1)}
                  strokeDasharray={on || inPkg ? undefined : view === 'face' ? '0.9 0.7' : '1.4 1.1'}
                />
              </g>
            ))}
          </g>
        )
      })}

      {/* Labels with leader lines — tappable too (small areas are hard to hit). */}
      {shown.map((a) => {
        if (!a.label) return null
        const left = a.label.side === 'left'
        const x = left ? v.leftX : v.rightX
        const on = selected.has(a.id) || covered.has(a.id)
        const isActive = active === a.id
        const short = a.name.replace(/\s*\(.*\)$/, '')
        const text = `${on ? '✓ ' : ''}${short}`
        const w = text.length * v.font * 0.56
        return (
          <g key={`l-${a.id}`} onClick={() => onTap(a.id)} className="cursor-pointer">
            <line
              x1={left ? x + v.font * 0.35 : x - v.font * 0.35}
              y1={a.label.y - v.font * 0.32}
              x2={a.label.to[0]}
              y2={a.label.to[1]}
              stroke={onPhoto ? '#fff' : '#3d7464'}
              strokeOpacity={0.8}
              strokeWidth={view === 'face' ? 0.18 : 0.3}
            />
            <rect
              x={left ? x - w - 1 : x - 1}
              y={a.label.y - v.font * 1.05}
              width={w + 2}
              height={v.font * 1.45}
              rx={v.font * 0.35}
              fill={on ? '#325f52' : isActive ? '#e0ede8' : onPhoto ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.85)'}
            />
            <text
              x={left ? x : x}
              y={a.label.y}
              textAnchor={left ? 'end' : 'start'}
              fontSize={v.font}
              fontWeight={on || isActive ? 700 : 500}
              fill={on ? '#fff' : onPhoto && !isActive ? '#fff' : '#1e1428'}
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {text}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Front camera with the head-and-shoulders guide; returns a 9:16 JPEG data URL. */
function SelfieCamera({ onShot, onClose }: { onShot: (dataUrl: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },
          audio: false,
        })
        if (!live) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          await videoRef.current.play().catch(() => {})
        }
      } catch {
        setError('The camera didn’t open. You can allow it in your browser settings, or choose a photo instead.')
      }
    })()
    return () => {
      live = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const snap = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const W = 900, H = 1600
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const ctx = c.getContext('2d')!
    // Cover-crop the camera frame to 9:16, mirrored like the preview.
    const scale = Math.max(W / v.videoWidth, H / v.videoHeight)
    const dw = v.videoWidth * scale, dh = v.videoHeight * scale
    ctx.translate(W, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(v, (W - dw) / 2, (H - dh) / 2, dw, dh)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    onShot(c.toDataURL('image/jpeg', 0.9))
  }

  const pickFile = (f: File | undefined) => {
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      onShot(String(r.result))
    }
    r.readAsDataURL(f)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <p className="text-white text-sm mb-3 text-center max-w-xs">
        Face the camera, straight on. Line your head up with the oval and your shoulders with the lines.
      </p>
      <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900">
        <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 h-full w-full object-cover" style={{ transform: 'scaleX(-1)' }} />
        <svg viewBox="0 0 92 160" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          {[{ s: 'rgba(0,0,0,0.45)', w: 1.6, d: undefined }, { s: 'rgba(255,255,255,0.9)', w: 0.8, d: '3 2' }].map((l, i) => (
            <g key={i} fill="none" stroke={l.s} strokeWidth={l.w} strokeDasharray={l.d} strokeLinecap="round">
              <ellipse cx={46} cy={62} rx={18} ry={24} />
              <path d="M46,44 L46,82 M34,58 L58,58" strokeDasharray="1.5 2.5" strokeWidth={0.6} />
              <path d="M8,150 C10,122 22,112 36,108 L38,96 M54,96 L56,108 C70,112 82,122 84,150" />
            </g>
          ))}
        </svg>
        {error && <p className="absolute inset-x-4 top-1/3 text-center text-sm text-white">{error}</p>}
      </div>
      <p className="text-white/70 text-xs mt-3 text-center max-w-xs">🔒 Your photo stays on this device. It isn’t uploaded or saved anywhere.</p>
      <div className="flex items-center gap-3 mt-4">
        <button onClick={onClose} className="px-4 py-2.5 rounded-full text-sm font-medium text-white/80 hover:text-white">
          Cancel
        </button>
        {!error && (
          <button onClick={snap} className="px-6 py-2.5 rounded-full bg-white text-plum-900 text-sm font-semibold shadow">
            📸 Take photo
          </button>
        )}
        <button onClick={() => fileRef.current?.click()} className="px-4 py-2.5 rounded-full text-sm font-medium text-white/80 hover:text-white underline">
          Choose a photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
      </div>
    </div>
  )
}

export default function TargetedBuilder({
  areas,
  packages,
  discountPct,
  phone,
}: {
  areas: Area[]
  packages: Pkg[]
  discountPct: number
  phone: string
}) {
  const [view, setView] = useState<'face' | 'body'>('face')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [active, setActive] = useState<string | null>(null)
  const [sessions, setSessions] = useState<1 | 2 | 3>(1)
  const [photo, setPhoto] = useState<string | null>(null)
  const [camera, setCamera] = useState(false)
  /** Phone: the bottom plan bar opens on tap (closed by default). */
  const [planOpen, setPlanOpen] = useState(false)

  const byId = useMemo(() => {
    const m: Record<string, { id: string; name: string; price: number | null; blurb: string; pkg?: Pkg }> = {}
    areas.forEach((a) => (m[a.id] = a))
    packages.forEach((p) => (m[p.id] = { ...p, pkg: p }))
    return m
  }, [areas, packages])

  /** Areas inside a chosen package. */
  const covered = useMemo(() => {
    const s = new Set<string>()
    packages.forEach((p) => selected.has(p.id) && p.includes.forEach((id) => s.add(id)))
    return s
  }, [packages, selected])
  const coveringPkg = (id: string) => packages.find((p) => selected.has(p.id) && p.includes.includes(id))

  const add = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      const pkg = packages.find((p) => p.id === id)
      if (pkg) {
        // A package replaces the single areas it covers, and any smaller package inside it.
        pkg.includes.forEach((a) => next.delete(a))
        packages.forEach((o) => o.id !== pkg.id && o.includes.every((a) => pkg.includes.includes(a)) && next.delete(o.id))
      }
      next.add(id)
      return next
    })
  const remove = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })

  const picked = Array.from(selected).map((id) => byId[id]).filter(Boolean)
  const priced = picked.filter((x) => x.price !== null)
  const atConsult = picked.filter((x) => x.price === null)
  const perSession = priced.reduce((s, x) => s + (x.price ?? 0), 0)
  const gross = perSession * sessions
  const discount = sessions > 1 ? Math.round((gross * discountPct) / 100) : 0
  const total = gross - discount

  // A package that covers singles already picked — for less.
  const suggestion = useMemo(() => {
    let best: { pkg: Pkg; save: number; names: string[] } | null = null
    for (const p of packages) {
      if (selected.has(p.id) || p.price === null) continue
      if (!p.includes.every((id) => selected.has(id))) continue
      const parts = p.includes.map((id) => byId[id])
      if (parts.some((x) => x?.price == null)) continue
      const save = parts.reduce((s, x) => s + (x!.price ?? 0), 0) - p.price
      if (save > 0 && (!best || save > best.save)) best = { pkg: p, save, names: parts.map((x) => x!.name.replace(/\s*\(.*\)$/, '')) }
    }
    return best
  }, [packages, selected, byId])

  const act = active ? byId[active] : null
  const actCover = active ? coveringPkg(active) : undefined

  const digits = phone.replace(/\D/g, '')
  const e164 = digits.length === 10 ? `+1${digits}` : digits ? `+${digits}` : ''
  const smsBody =
    `Hi! I built an Agnes RF Targeted plan on your site: ${picked.map((x) => x.name).join('; ')}` +
    ` — ${sessions} session${sessions > 1 ? 's' : ''}` +
    (priced.length ? `, estimate ${money(total)}${atConsult.length ? ' plus what’s priced at consultation' : ''}` : '') +
    `. I’d like to book a consultation.`
  const smsHref = `sms:${e164}?&body=${encodeURIComponent(smsBody)}`

  const others = areas.filter((a) => a.view === 'other')

  const short = (n: string) => n.replace(/\s*\(.*\)$/, '')

  // The tapped area: under the map on a phone, at the top of the side panel on a computer.
  const infoCard = act && (
    <div className="rounded-2xl bg-white border border-brand-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold text-plum-900" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
          {act.name}
        </h3>
        <button onClick={() => setActive(null)} className="text-gray-400 hover:text-gray-700 text-lg leading-none px-1" aria-label="Close">
          ✕
        </button>
      </div>
      <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{act.blurb}</p>
      {act.pkg && <p className="text-xs text-gray-500 mt-1.5">Includes: {act.pkg.includes.map((id) => short(byId[id]?.name ?? '')).join(', ')}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <p className="text-lg font-semibold text-plum-900">
          {act.price === null ? <span className="text-base text-gray-600">Priced at your consultation</span> : <>{money(act.price)} <span className="text-sm font-normal text-gray-500">per session</span></>}
        </p>
        {actCover ? (
          <p className="text-sm text-brand-700 font-medium">✓ Included in {short(actCover.name)}</p>
        ) : selected.has(act.id) ? (
          <button onClick={() => remove(act.id)} className="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Remove from total
          </button>
        ) : (
          <button onClick={() => add(act.id)} className="px-5 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700">
            + Add to total
          </button>
        )}
      </div>
    </div>
  )

  const suggestionBox = suggestion && (
    <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900 flex flex-wrap items-center justify-between gap-2">
      <span>
        💡 <strong>{short(suggestion.pkg.name)}</strong> covers {suggestion.names.join(', ')} for {money(suggestion.pkg.price!)} — save {money(suggestion.save)}.
      </span>
      <button onClick={() => add(suggestion.pkg.id)} className="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-semibold">
        Switch
      </button>
    </div>
  )

  const sessionsPicker = (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600">Sessions</span>
      <div className="inline-flex rounded-full border border-cream-200 p-0.5">
        {([1, 2, 3] as const).map((n) => (
          <button key={n} onClick={() => setSessions(n)} className={`w-8 py-1 rounded-full text-sm font-medium ${sessions === n ? 'bg-plum-900 text-white' : 'text-plum-800'}`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  )

  const totalLine = (
    <div className="text-right">
      <p className="text-xl font-semibold text-plum-900 leading-tight">
        {priced.length ? money(total) : '—'}
        {atConsult.length > 0 && <span className="text-xs font-normal text-gray-500"> + consult pricing</span>}
      </p>
      {sessions > 1 && discount > 0 && (
        <p className="text-[11px] text-gray-500">
          {sessions} × {money(perSession)} − {discountPct}% package savings ({money(discount)})
        </p>
      )}
    </div>
  )

  const chips = (
    <div className="flex flex-wrap gap-1.5">
      {picked.map((x) => (
        <span key={x.id} className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 pl-3 pr-1 py-0.5 text-xs text-plum-900">
          {short(x.name)} · {x.price === null ? 'at consult' : money(x.price)}
          <button onClick={() => remove(x.id)} className="px-1.5 text-gray-500 hover:text-red-600" aria-label={`Remove ${x.name}`}>
            ✕
          </button>
        </span>
      ))}
    </div>
  )

  const textButton = (cls = '') => (
    <a href={smsHref} className={`text-center px-5 py-2.5 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 ${cls}`}>
      💬 Text us this plan
    </a>
  )
  const finePrint = <p className="text-[11px] text-gray-500">Estimate only — your final plan and price are set at your consultation. Or call {phone}.</p>
  const countLabel = `${picked.length} ${picked.length === 1 ? 'item' : 'items'}`

  return (
    <div className="pb-28 lg:pb-12 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:items-start">
      <div>
        {/* View + photo controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <div className="inline-flex rounded-full bg-white border border-cream-200 p-1">
            {(['face', 'body'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${view === v ? 'bg-plum-900 text-white' : 'text-plum-800 hover:bg-cream-100'}`}
              >
                {v === 'face' ? 'Face' : 'Body'}
              </button>
            ))}
          </div>
          {view === 'face' &&
            (photo ? (
              <div className="flex items-center gap-2 text-sm">
                <button onClick={() => setCamera(true)} className="px-3 py-1.5 rounded-full border border-cream-200 bg-white text-plum-800 hover:bg-cream-100">
                  Retake
                </button>
                <button onClick={() => setPhoto(null)} className="px-3 py-1.5 rounded-full border border-cream-200 bg-white text-plum-800 hover:bg-cream-100">
                  Remove my photo
                </button>
              </div>
            ) : (
              <button onClick={() => setCamera(true)} className="px-4 py-1.5 rounded-full bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">
                📸 Use my photo
              </button>
            ))}
        </div>
        {view === 'face' && photo && <p className="text-center text-xs text-gray-500 -mt-2 mb-3">🔒 Your photo stays on this device only — it isn’t uploaded or saved.</p>}

        <div className={`mx-auto rounded-3xl overflow-hidden border border-cream-200 ${view === 'face' && photo ? 'bg-black' : 'bg-white'} ${view === 'face' ? 'max-w-2xl' : 'max-w-md'}`}>
          <Map view={view} areas={areas} photo={photo} selected={selected} covered={covered} active={active} onTap={setActive} />
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">Tap an area or its name.</p>

        {/* Anywhere */}
        {others.length > 0 && (
          <div className="mt-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Also treated</p>
            <div className="flex flex-wrap justify-center gap-2">
              {others.map((a) => {
                const on = selected.has(a.id)
                return (
                  <button
                    key={a.id}
                    onClick={() => setActive(a.id)}
                    className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                      on ? 'bg-brand-700 border-brand-700 text-white' : active === a.id ? 'bg-brand-50 border-brand-400 text-plum-900' : 'bg-white border-cream-200 text-plum-800 hover:bg-cream-100'
                    }`}
                  >
                    {on ? '✓ ' : ''}
                    {a.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Phone: the tapped area right under the map. */}
        {infoCard && <div className="mt-5 max-w-xl mx-auto lg:hidden">{infoCard}</div>}

        {/* Packages */}
        <div className="mt-8 max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 text-center">Packages</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {packages.map((p) => {
              const on = selected.has(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => setActive(p.id)}
                  className={`text-left rounded-xl border px-4 py-3 transition-colors ${on ? 'border-brand-600 bg-brand-50' : active === p.id ? 'border-brand-400 bg-white' : 'border-cream-200 bg-white hover:bg-cream-50'}`}
                >
                  <span className="block text-sm font-medium text-plum-900">
                    {on ? '✓ ' : ''}
                    {p.name}
                  </span>
                  <span className="block text-sm text-gray-600 mt-0.5">{p.price === null ? 'Priced at consultation' : money(p.price)}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Computer: the plan beside the map, staying in view while scrolling. */}
      <aside className="hidden lg:block sticky top-6 space-y-4">
        {infoCard}
        <div className="rounded-2xl bg-white border border-cream-200 shadow-sm p-5 space-y-3">
          <h3 className="text-xl font-semibold text-plum-900" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            Your plan
          </h3>
          {picked.length === 0 ? (
            <p className="text-sm text-gray-600">Tap an area, then <strong>Add to total</strong>.</p>
          ) : (
            <>
              {suggestionBox}
              {chips}
              <div className="flex items-center justify-between gap-3 pt-1">
                {sessionsPicker}
                {totalLine}
              </div>
              {textButton('block w-full')}
              {finePrint}
            </>
          )}
        </div>
      </aside>

      {/* Phone: a bar along the bottom, closed by default — one line, tap to open. */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-cream-200 bg-white/95 backdrop-blur shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl mx-auto px-4 py-2.5">
          {picked.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-1.5">Tap an area, then <strong>Add to total</strong>.</p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button onClick={() => setPlanOpen((o) => !o)} className="flex-1 min-w-0 text-left" aria-expanded={planOpen}>
                  <span className="block text-xs text-gray-600">
                    Your plan · {countLabel}
                    {sessions > 1 ? ` · ${sessions} sessions` : ''}
                    {suggestion ? ' · 💡' : ''} <span className="text-brand-700 font-medium">{planOpen ? 'Hide ▾' : 'Show ▴'}</span>
                  </span>
                  <span className="block text-lg font-semibold text-plum-900 leading-tight">
                    {priced.length ? money(total) : '—'}
                    {atConsult.length > 0 && <span className="text-xs font-normal text-gray-500"> + consult pricing</span>}
                  </span>
                </button>
                {textButton('shrink-0')}
              </div>
              {planOpen && (
                <div className="mt-3 space-y-3 max-h-[55vh] overflow-y-auto pb-1">
                  {suggestionBox}
                  {chips}
                  <div className="flex items-center justify-between gap-3">
                    {sessionsPicker}
                    {sessions > 1 && discount > 0 && (
                      <p className="text-[11px] text-gray-500 text-right">
                        {sessions} × {money(perSession)} − {discountPct}% ({money(discount)})
                      </p>
                    )}
                  </div>
                  {finePrint}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {camera && (
        <SelfieCamera
          onShot={(d) => {
            setPhoto(d)
            setCamera(false)
            setView('face')
          }}
          onClose={() => setCamera(false)}
        />
      )}
    </div>
  )
}
