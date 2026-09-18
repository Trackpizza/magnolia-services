'use client'

/**
 * A patient sending back follow-up photos.
 *
 * Staff asked, weeks ago, for "a front and two 45s in a month". This walks
 * through those angles one at a time, on a phone, and puts each one straight
 * onto the chart.
 *
 * ── The frame is 9:16 and the preview COVERS it ───────────────────────────
 * The same rule as the clinical capture screen in the records app, for the
 * same reason: these sit beside the photographs staff took, and a set that
 * does not match is a set nobody can compare. What the patient sees inside the
 * frame is exactly what gets cropped and uploaded — a preview that shows more
 * than it saves is how people cut their own chin off.
 *
 * ── One angle at a time ───────────────────────────────────────────────────
 * Not a grid of five empty boxes. Somebody holding a phone at arm's length,
 * with the front camera on, can follow "now the right 45" and cannot follow a
 * form. Each one uploads as it is taken, so a patient who gives up halfway has
 * still given the clinic something.
 */
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

/** Portrait, because every one of these is a face. */
const TARGET_RATIO = 9 / 16

/** The largest centred rectangle of TARGET_RATIO that fits the frame — the
 *  crop is what decides the shape, since a camera is free to ignore every
 *  constraint it is given and hand back 1920x1080. */
function cropRect(sw: number, sh: number) {
  let w = sw
  let h = Math.round(sw / TARGET_RATIO)
  if (h > sh) {
    h = sh
    w = Math.round(sh * TARGET_RATIO)
  }
  return { x: Math.round((sw - w) / 2), y: Math.round((sh - h) / 2), w, h }
}

interface View {
  firstName: string
  label: string
  procedureName: string
  slots: string[]
  done: string[]
}

type Stage = 'loading' | 'intro' | 'shooting' | 'review' | 'sending' | 'done' | 'gone'

export default function PhotoRequestClient() {
  const { token } = useParams<{ token: string }>()
  const [view, setView] = useState<View | null>(null)
  const [stage, setStage] = useState<Stage>('loading')
  const [index, setIndex] = useState(0)
  const [message, setMessage] = useState('')
  const [shot, setShot] = useState<{ blob: Blob; url: string } | null>(null)
  const [uploading, setUploading] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const post = async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API}/api/public/photo-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...payload }),
    })
    return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) }
  }

  useEffect(() => {
    let live = true
    ;(async () => {
      const { ok, status, data } = await post({})
      if (!live) return
      if (!ok) {
        setStage(status === 410 ? 'gone' : 'gone')
        return
      }
      const v = data as View
      setView(v)
      // Pick up where they left off if they already sent some.
      const first = v.slots.findIndex((s) => !v.done.includes(s))
      setIndex(first < 0 ? 0 : first)
      setStage(v.done.length >= v.slots.length ? 'done' : 'intro')
    })()
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // The camera outlives the component if you let it — the light stays on.
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }
  useEffect(() => () => stopCamera(), [])

  // Attach the stream once the <video> is actually on screen. Setting
  // srcObject at the moment the stream arrives cannot work: the element only
  // exists from the shooting stage onward, so the ref is still null and the
  // preview is a black rectangle.
  useEffect(() => {
    const el = videoRef.current
    const stream = streamRef.current
    if (!el || !stream) return
    if (el.srcObject !== stream) el.srcObject = stream
    el.play().catch(() => {})
  }, [stage, index])

  const startCamera = async () => {
    setMessage('')
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: {
          // The FRONT camera: they are photographing themselves, at arm's
          // length, and cannot see a rear-camera preview while they do it.
          facingMode: { ideal: 'user' },
          aspectRatio: { ideal: TARGET_RATIO },
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: false,
      })
      setStage('shooting')
    } catch {
      setMessage(
        'We could not reach your camera. Check the permission prompt, or reply to our email with the photos instead.',
      )
    }
  }

  const capture = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const { x, y, w, h } = cropRect(v.videoWidth, v.videoHeight)
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    if (!ctx) return
    // Mirrored preview, UNMIRRORED file. A front camera shows people the
    // reflection they expect, but a clinical photo that is flipped compares
    // the wrong side against the one staff took.
    ctx.drawImage(v, x, y, w, h, 0, 0, w, h)
    c.toBlob(
      (blob) => {
        if (!blob) return
        setShot({ blob, url: URL.createObjectURL(blob) })
        setStage('review')
      },
      'image/jpeg',
      0.92,
    )
  }

  const keep = async () => {
    if (!shot || !view) return
    setUploading(true)
    setMessage('')
    const slot = view.slots[index]
    try {
      const start = await post({ action: 'start', slot, contentType: 'image/jpeg' })
      if (!start.ok || !start.data.uploadUrl) throw new Error('no upload url')

      const put = await fetch(String(start.data.uploadUrl), {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: shot.blob,
      })
      if (!put.ok) throw new Error(`upload ${put.status}`)

      const done = await post({ action: 'uploaded', slot })
      if (!done.ok) throw new Error('confirm failed')

      URL.revokeObjectURL(shot.url)
      setShot(null)
      const next = index + 1
      if (next >= view.slots.length) {
        setStage('sending')
        await post({ action: 'finish' })
        stopCamera()
        setStage('done')
      } else {
        setIndex(next)
        setStage('shooting')
      }
    } catch {
      setMessage('That did not upload. Check your signal and try again — nothing is lost.')
      setStage('review')
    } finally {
      setUploading(false)
    }
  }

  const retake = () => {
    if (shot) URL.revokeObjectURL(shot.url)
    setShot(null)
    setStage('shooting')
  }

  const card = 'bg-white rounded-2xl border border-gray-100 p-6 sm:p-8'
  const primary =
    'w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors disabled:opacity-50'
  const quiet = 'text-sm text-brand-600 hover:text-brand-700'

  if (stage === 'loading') {
    return (
      <div className={card}>
        <p className="text-gray-600">Loading&hellip;</p>
      </div>
    )
  }

  if (stage === 'gone') {
    return (
      <div className={card}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-3">This link has expired</h1>
        <p className="text-gray-700">
          It may already have been used. Give us a call or text and we will send a new one.
        </p>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div className={card}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-3">Thank you</h1>
        <p className="text-gray-700">
          They are on your record and your provider will take a look. Nothing is used anywhere
          else without your written permission.
        </p>
      </div>
    )
  }

  const slot = view?.slots[index] ?? ''
  const total = view?.slots.length ?? 0

  return (
    <div className={card}>
      <h1 className="text-2xl font-semibold text-plum-900 mb-2">
        {view?.firstName ? `${view.firstName}, how are things looking?` : 'How are things looking?'}
      </h1>
      <p className="text-sm text-gray-600 mb-5">
        {view?.procedureName
          ? `It has been ${view.label} since your ${view.procedureName}. `
          : `It has been ${view?.label}. `}
        A couple of photos is all we need — they go straight onto your record.
      </p>

      {stage === 'intro' && (
        <>
          <p className="text-sm text-gray-700 mb-2">We will ask for {total} in turn:</p>
          <ul className="text-sm text-gray-600 mb-5 list-disc pl-5 space-y-1">
            {view?.slots.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <button onClick={startCamera} className={primary}>
            Start
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Somewhere bright, with a window in front of you rather than behind, and hold the
            phone upright.
          </p>
        </>
      )}

      {(stage === 'shooting' || stage === 'review' || stage === 'sending') && (
        <>
          <p className="text-sm font-medium text-gray-900 mb-2">
            {slot} <span className="text-gray-500">· {index + 1} of {total}</span>
          </p>

          <div className="relative mx-auto mb-4 h-[60vh] max-w-full aspect-[9/16] overflow-hidden rounded-xl bg-black">
            {stage === 'review' && shot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key="shot" src={shot.url} alt={slot} className="h-full w-full object-cover" />
            ) : (
              <video
                key="live"
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
                // Mirrored for them only. The captured file is not flipped.
                style={{ transform: 'scaleX(-1)' }}
              />
            )}
          </div>

          {stage === 'shooting' && (
            <button onClick={capture} className={primary}>
              Take the photo
            </button>
          )}

          {stage === 'review' && (
            <div className="space-y-3">
              <button onClick={keep} disabled={uploading} className={primary}>
                {uploading ? 'Sending…' : index + 1 >= total ? 'Send them' : 'Use this one'}
              </button>
              <button onClick={retake} disabled={uploading} className={quiet}>
                Take it again
              </button>
            </div>
          )}

          {stage === 'sending' && <p className="text-sm text-gray-600">Sending…</p>}
        </>
      )}

      {message && (
        <p className="mt-3 text-sm text-plum-900 bg-cream-100 rounded-xl px-4 py-3">{message}</p>
      )}
    </div>
  )
}
