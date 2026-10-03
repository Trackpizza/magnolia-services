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
import AngleGuide from './AngleGuide'
import { allSessions, writeSession } from '../../my/session'

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
  /** Whether a live preview is running. Not derived from the ref: a ref does
   *  not re-render, and this decides what the shooting stage draws. Somebody
   *  who only ever picks photos from their library never starts a camera. */
  const [cameraOn, setCameraOn] = useState(false)
  /** Which camera. The FRONT one by default — they are photographing
   *  themselves — or the BACK one when a friend or family member is taking
   *  them (10-03): better camera, and the helper sees the preview. */
  const [facing, setFacing] = useState<'user' | 'environment'>('user')
  const [uploading, setUploading] = useState(false)

  // ── The ghost: their earlier photo of this angle, at 50%, with a slider ──
  // The clinic camera's overlay (10-03). Served only to a portal sign-in for
  // this chart — this link opens without a code, and a ghost would show their
  // face to anyone it was forwarded to. Signed in on this phone already: it
  // appears. Otherwise "Show my earlier photo as a guide" sends a code.
  const [guide, setGuide] = useState<{ slots: string[]; sms: boolean; email: boolean; last4: string } | null>(null)
  const [guideSession, setGuideSession] = useState('')
  const [guideUrls, setGuideUrls] = useState<Record<string, string>>({})
  const [ghost, setGhost] = useState(0.5)
  const [gate, setGate] = useState<'idle' | 'sending' | 'entering' | 'checking'>('idle')
  const [gateCode, setGateCode] = useState('')
  const [gateChannel, setGateChannel] = useState<'sms' | 'email'>('sms')
  const [gateError, setGateError] = useState('')

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

  // Which angles have an earlier photo, and whether this phone may see them.
  useEffect(() => {
    if (!view) return
    let live = true
    ;(async () => {
      const { ok, data } = await post({ action: 'guide', sessions: allSessions() })
      if (!live || !ok || !Array.isArray(data.slots) || data.slots.length === 0) return
      setGuide({ slots: data.slots, sms: !!data.sms, email: !!data.email, last4: String(data.last4 ?? '') })
      setGateChannel(data.sms ? 'sms' : 'email')
      if (data.session) setGuideSession(String(data.session))
    })()
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  // Signed in: fetch each angle's earlier photo once, as a local image.
  useEffect(() => {
    if (!guide || !guideSession) return
    let live = true
    const made: string[] = []
    ;(async () => {
      for (const slot of guide.slots) {
        try {
          const res = await fetch(`${API}/api/public/photo-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, action: 'guide-photo', session: guideSession, slot }),
          })
          if (!res.ok) continue
          const url = URL.createObjectURL(await res.blob())
          made.push(url)
          if (live) setGuideUrls((m) => ({ ...m, [slot]: url }))
        } catch {
          /* no ghost for that angle — the camera still works */
        }
      }
    })()
    return () => {
      live = false
      made.forEach((u) => URL.revokeObjectURL(u))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide, guideSession])

  const sendGuideCode = async (channel = gateChannel) => {
    setGate('sending')
    setGateError('')
    setGateChannel(channel)
    const { ok } = await post({ action: 'guide-code', channel })
    if (!ok) {
      setGateError('We could not send a code just now. You can still take the photos without the guide.')
      setGate('idle')
      return
    }
    setGate('entering')
  }

  const checkGuideCode = async () => {
    setGate('checking')
    setGateError('')
    const { ok, data } = await post({ action: 'guide-unlock', channel: gateChannel, code: gateCode })
    if (!ok || !data.session) {
      setGateError('That code did not work. Check it and try again, or send a new one.')
      setGate('entering')
      return
    }
    // Remembered like a portal sign-in, so the next follow-up link opens with
    // the guide straight away.
    writeSession(`photo:${token}`, String(data.session))
    setGuideSession(String(data.session))
    setGate('idle')
    setGateCode('')
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
    setCameraOn(false)
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

  const startCamera = async (face: 'user' | 'environment' = facing) => {
    setMessage('')
    // Switching cameras: let go of the one that is running first, or some
    // phones refuse the second.
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setFacing(face)
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: {
          // FRONT by default: they are photographing themselves, at arm's
          // length, and cannot see a rear-camera preview while they do it.
          // BACK when somebody else is holding the phone.
          facingMode: { ideal: face },
          aspectRatio: { ideal: TARGET_RATIO },
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: false,
      })
      setCameraOn(true)
      setStage('shooting')
      // The <video> is already on screen when switching, so the effect that
      // attaches a new stream on a stage change will not run — attach here.
      const el = videoRef.current
      if (el && streamRef.current) {
        el.srcObject = streamRef.current
        el.play().catch(() => {})
      }
    } catch {
      // Not a dead end any more: there is a file picker underneath this, and
      // a phone that will not give up its camera will still give up its
      // camera roll.
      setMessage(
        'We could not reach your camera. Check the permission prompt, or use "Choose a photo" below instead.',
      )
      setStage('shooting')
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

  /**
   * A photo from the phone's library instead of the camera.
   *
   * Asked for because not every one of these is taken on the spot: somebody
   * photographs themselves in better light in the morning, somebody has a
   * partner take it, somebody's browser will not hand over the camera at all.
   * Before this, any of those meant replying to the email with an attachment
   * that then had to be filed by hand.
   *
   * Cropped through exactly the same 9:16 rectangle as a capture, and
   * re-encoded as JPEG. These sit in a comparison row beside the clinic's own
   * photographs, and a set that does not match is a set nobody can compare —
   * so the crop is not optional, and neither is the format the upload step
   * has already told the server to expect.
   */
  const chooseFile = async (file: File) => {
    setMessage('')
    try {
      const bmp = await createImageBitmap(file)
      const { x, y, w, h } = cropRect(bmp.width, bmp.height)
      // Cap the long edge where the camera path caps it, so a 12-megapixel
      // library photo does not become a 9 MB upload on clinic wifi.
      const scale = Math.min(1, 1920 / h)
      const c = document.createElement('canvas')
      c.width = Math.round(w * scale)
      c.height = Math.round(h * scale)
      const ctx = c.getContext('2d')
      if (!ctx) throw new Error('no canvas')
      ctx.drawImage(bmp, x, y, w, h, 0, 0, c.width, c.height)
      bmp.close?.()
      c.toBlob(
        (blob) => {
          if (!blob) {
            setMessage('We could not read that picture. Try another one.')
            return
          }
          setShot({ blob, url: URL.createObjectURL(blob) })
          setStage('review')
        },
        'image/jpeg',
        0.92,
      )
    } catch {
      // HEIC on a browser that cannot decode it is the likely one. iPhones
      // convert on the way out of the picker most of the time, but not all.
      setMessage('We could not read that picture. Try another one, or use the camera.')
    }
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
  const outline =
    'block w-full cursor-pointer text-center border border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors'

  /** The library picker. A <label> wrapping a hidden input, so it is the same
   *  size and shape as the buttons beside it — a bare file input is a control
   *  nobody recognises as the way out of a camera that will not start. */
  const filePicker = (label: string, className: string) => (
    <label className={className}>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          // Cleared so choosing the SAME file twice still fires a change —
          // which is exactly what happens after "take it again".
          e.target.value = ''
          if (f) void chooseFile(f)
        }}
      />
      {label}
    </label>
  )

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
          <button onClick={() => startCamera('user')} className={primary}>
            Start — I&rsquo;ll take them myself
          </button>
          <button
            onClick={() => startCamera('environment')}
            className={outline + ' mt-3'}
          >
            Someone else is taking them for me
          </button>
          <div className="mt-3">
            {filePicker('Choose photos from your phone', outline)}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Somewhere bright, with a window in front of you rather than behind, and hold the
            phone upright. A friend or family member using the back camera usually gets the
            clearest photos.
          </p>
        </>
      )}

      {(stage === 'shooting' || stage === 'review' || stage === 'sending') && (
        <>
          <p className="text-sm font-medium text-gray-900 mb-2">
            {slot} <span className="text-gray-500">· {index + 1} of {total}</span>
          </p>

          {/* What this angle actually means, in a picture. Shown while
              shooting AND while reviewing: the moment somebody looks at a
              shot and thinks "is that right?" is the moment the diagram is
              worth most. */}
          {stage !== 'sending' && <AngleGuide slot={slot} />}

          <div className="relative mx-auto mb-4 h-[60vh] max-w-full aspect-[9/16] overflow-hidden rounded-xl bg-black">
            {stage === 'review' && shot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key="shot" src={shot.url} alt={slot} className="h-full w-full object-cover" />
            ) : !cameraOn ? (
              /* No preview to show — the camera was refused, or this patient
                 is picking from their library and never started one. A black
                 rectangle here looks like a broken camera, which is the one
                 thing it must not look like when the way forward is the
                 button underneath it. */
              <div className="flex h-full w-full items-center justify-center px-6 text-center">
                <p className="text-sm text-white/70">
                  Choose a photo below, or switch the camera on.
                </p>
              </div>
            ) : (
              <video
                key="live"
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
                // Mirrored for the selfie camera only (what people expect to
                // see). The captured file is never flipped.
                style={{ transform: facing === 'user' ? 'scaleX(-1)' : 'none' }}
              />
            )}
            {/* The earlier shot of this angle over the live preview, mirrored
                with it so it lines up with what they see. Never part of the
                captured photo. */}
            {stage === 'shooting' && cameraOn && guideUrls[slot] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={guideUrls[slot]}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                style={{ opacity: ghost, transform: facing === 'user' ? 'scaleX(-1)' : 'none' }}
              />
            )}
          </div>

          {stage === 'shooting' && cameraOn && guideUrls[slot] && (
            <label className="mb-4 flex items-center gap-3 text-xs text-gray-600">
              <span className="shrink-0">Earlier photo</span>
              <input
                type="range"
                min={0}
                max={0.9}
                step={0.05}
                value={ghost}
                onChange={(e) => setGhost(Number(e.target.value))}
                className="flex-1 accent-brand-600"
                aria-label="Earlier photo overlay strength"
              />
            </label>
          )}

          {/* Not signed in: offer the guide behind the same code as their page. */}
          {stage === 'shooting' && guide && !guideSession && (
            <div className="mb-4 rounded-xl bg-cream-100 px-4 py-3 text-sm text-gray-700">
              {gate === 'entering' || gate === 'checking' ? (
                <div className="space-y-2">
                  <p>
                    {gateChannel === 'sms'
                      ? `We texted a code to the mobile ending ${guide.last4}.`
                      : 'We emailed a code to the address we have for you.'}
                  </p>
                  <input
                    value={gateCode}
                    onChange={(e) => setGateCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Code"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base tracking-widest"
                  />
                  <button onClick={checkGuideCode} disabled={gate === 'checking' || gateCode.length < 4} className={primary}>
                    {gate === 'checking' ? 'Checking…' : 'Show the guide'}
                  </button>
                  <button onClick={() => sendGuideCode()} className={quiet}>Send a new code</button>
                </div>
              ) : (
                <>
                  <p className="mb-2">
                    Line up with your earlier photo: we show it faintly over the camera so every set
                    matches. For your privacy we check it is you first.
                  </p>
                  <button onClick={() => sendGuideCode()} disabled={gate === 'sending'} className={outline}>
                    {gate === 'sending' ? 'Sending…' : 'Show my earlier photo as a guide'}
                  </button>
                  {guide.sms && guide.email && (
                    <button onClick={() => sendGuideCode(gateChannel === 'sms' ? 'email' : 'sms')} className={quiet + ' mt-2'}>
                      {gateChannel === 'sms' ? 'Email me the code instead' : 'Text me the code instead'}
                    </button>
                  )}
                </>
              )}
              {gateError && <p className="mt-2 text-plum-900">{gateError}</p>}
            </div>
          )}

          {stage === 'shooting' && (
            <div className="space-y-3">
              {cameraOn ? (
                <button onClick={capture} className={primary}>
                  Take the photo
                </button>
              ) : (
                <button onClick={() => startCamera()} className={primary}>
                  Use the camera
                </button>
              )}
              {cameraOn && (
                <button
                  onClick={() => startCamera(facing === 'user' ? 'environment' : 'user')}
                  className={outline}
                >
                  {facing === 'user'
                    ? 'Someone else taking it? Use the back camera'
                    : 'Taking it yourself? Use the selfie camera'}
                </button>
              )}
              {filePicker(
                cameraOn ? 'Choose a photo instead' : 'Choose a photo from your phone',
                outline,
              )}
            </div>
          )}

          {stage === 'review' && (
            <div className="space-y-3">
              <button onClick={keep} disabled={uploading} className={primary}>
                {uploading ? 'Sending…' : index + 1 >= total ? 'Send them' : 'Use this one'}
              </button>
              <button onClick={retake} disabled={uploading} className={quiet}>
                {cameraOn ? 'Take it again' : 'Choose a different one'}
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
