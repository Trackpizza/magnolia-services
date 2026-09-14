'use client'
/**
 * A patient records their own video testimonial.
 *
 * The page is hosted here, on the marketing site, because this is the domain
 * patients recognise. The VIDEO never is: the file goes straight from the
 * browser to the records project's storage bucket using a signed URL that the
 * records API mints. A patient talking about their treatment is PHI, and
 * routing it through this site's server would make magnolia-services a covered
 * workload — the same rule the booking widget follows.
 *
 * ── Record in the page, don't hand off to the camera app ────────────────────
 * A file input with `capture` opens the camera and comes back with whatever it
 * produced. There is no countdown, no way to see it before committing, and no
 * retake — so a first take with a bad angle either gets sent or the whole thing
 * gets abandoned. Almost nobody sends a second one.
 *
 * So: three-second countdown, record, WATCH IT BACK, then keep or redo. The
 * pattern is lifted from autobody-review's WalkthroughStudio, including its
 * feature-detected mimeType, because Safari and Chrome disagree about what
 * MediaRecorder can produce and hard-coding either one breaks half the phones.
 *
 * The file picker stays as a fallback for browsers with no MediaRecorder, and
 * for anyone who would rather film it in their own camera app.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

const ACCEPT = 'video/mp4,video/quicktime,video/webm'
/** Comfortably above a couple of minutes of phone video, low enough that a
 *  mistaken twenty-minute clip fails fast instead of after ten. */
const MAX_BYTES = 500 * 1024 * 1024
/** Long enough for a real answer, short enough that nobody rambles into a file
 *  too big to upload on a phone connection. */
const MAX_SECONDS = 180

/** Safari records mp4; Chrome and Firefox record webm. Asking the browser what
 *  it supports is the only thing that works on both. */
const MIME_CANDIDATES = [
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
]

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return ''
  for (const c of MIME_CANDIDATES) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c
    } catch {
      /* Safari has thrown here historically rather than returning false */
    }
  }
  return ''
}

type Stage = 'loading' | 'intro' | 'countdown' | 'recording' | 'review' | 'uploading' | 'done' | 'invalid'

export default function TestimonialUploader() {
  const { token } = useParams<{ token: string }>()
  const [stage, setStage] = useState<Stage>('loading')
  const [firstName, setFirstName] = useState('')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [count, setCount] = useState(3)
  const [seconds, setSeconds] = useState(0)
  const [canRecord, setCanRecord] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const blobRef = useRef<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const post = useCallback(
    async (payload: Record<string, unknown>) => {
      const res = await fetch(`${API}/api/public/testimonial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...payload }),
      })
      return { ok: res.ok, data: await res.json().catch(() => ({} as Record<string, unknown>)) }
    },
    [token],
  )

  useEffect(() => {
    setCanRecord(typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia)
    let live = true
    post({})
      .then(({ ok, data }) => {
        if (!live) return
        if (!ok) { setStage('invalid'); return }
        setFirstName(String(data.firstName ?? ''))
        setStage('intro')
      })
      .catch(() => { if (live) setStage('invalid') })
    return () => { live = false }
  }, [post])

  // Camera and object URLs are the two things that outlive a component if you
  // let them: one keeps the light on, the other leaks memory.
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => () => {
    stopCamera()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [stopCamera, previewUrl])

  const beginCountdown = async () => {
    setMessage('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
    } catch {
      setMessage('We could not reach your camera. Check the permission prompt, or use "choose a video" below.')
      return
    }

    setStage('countdown')
    setCount(3)
    for (let n = 3; n > 0; n--) {
      setCount(n)
      await new Promise((r) => setTimeout(r, 1000))
    }
    startRecording()
  }

  const startRecording = () => {
    const stream = streamRef.current
    if (!stream) return
    const mime = pickMimeType()
    chunksRef.current = []
    const recorder = new MediaRecorder(stream, {
      ...(mime ? { mimeType: mime } : {}),
      videoBitsPerSecond: 2_500_000,
    })
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.onstop = () => {
      // recorder.mimeType is the authority — the browser may have chosen
      // something other than what we asked for.
      const type = recorder.mimeType || mime || 'video/webm'
      const blob = new Blob(chunksRef.current, { type })
      blobRef.current = blob
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      stopCamera()
      setStage('review')
    }
    recorderRef.current = recorder
    recorder.start(1000)
    setSeconds(0)
    setStage('recording')
  }

  // Tick, and stop on its own at the cap rather than letting someone film a
  // file they can never upload.
  useEffect(() => {
    if (stage !== 'recording') return
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_SECONDS) {
          recorderRef.current?.stop()
          return s + 1
        }
        return s + 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [stage])

  const redo = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    blobRef.current = null
    setStage('intro')
  }

  const upload = async (file: Blob, contentType: string) => {
    if (file.size > MAX_BYTES) {
      setMessage('That video is very large. Please record a shorter one, or text it to us instead.')
      return
    }
    setStage('uploading')
    setProgress(0)
    setMessage('')

    try {
      const start = await post({ action: 'start', contentType })
      if (!start.ok || !start.data.uploadUrl) {
        // Say WHICH thing failed. "Could not start the upload" sent us looking
        // at the camera when the answer was a missing IAM role on the server.
        const code = String(start.data.error ?? 'unknown')
        const detail = String(start.data.detail ?? '')
        setStage('review')
        setMessage(
          code === 'bad_type'
            ? 'Your browser recorded a format we cannot accept yet. Please tell us — it helps us fix it.'
            : code === 'too_many'
              ? 'That is a lot of attempts. Please wait a few minutes, or call or text us.'
              : `We could not start the upload (${code}${detail ? `: ${detail}` : ''}). Please call or text us and we will sort it out.`,
        )
        return
      }

      // XHR, not fetch: this is the one place a progress bar genuinely matters
      // and fetch still cannot report upload progress. A minute-long video
      // crawling up a phone connection with no feedback reads as a failure.
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', String(start.data.uploadUrl))
        // Must match the type the URL was signed for, exactly.
        xhr.setRequestHeader('Content-Type', contentType)
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(String(xhr.status))))
        xhr.onerror = () => reject(new Error('network'))
        xhr.send(file)
      })

      const finish = await post({ action: 'finish' })
      if (!finish.ok) {
        setStage('review')
        setMessage('Your video uploaded, but we could not file it. Please call or text us — nothing is lost.')
        return
      }
      setStage('done')
    } catch {
      setStage('review')
      setMessage('The upload stopped partway. Please try again, ideally on wifi.')
    }
  }

  const heading = { fontFamily: 'var(--font-cormorant), Georgia, serif' }
  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  if (stage === 'loading') return <p className="text-gray-700">One moment…</p>

  if (stage === 'invalid') {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-plum-900" style={heading}>This link has expired</h1>
        <p className="text-gray-700">
          It may already have been used. Give us a call or text and we will send a new one.
        </p>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div className="space-y-3">
        <div className="text-3xl" aria-hidden="true">💚</div>
        <h1 className="text-2xl font-semibold text-plum-900" style={heading}>
          Thank you{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-gray-700">
          We have your video. Nothing goes anywhere public without the permission you already gave
          us, and you can change your mind at any time — just tell us.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {stage === 'intro' && (
        <div>
          <h1 className="text-2xl font-semibold text-plum-900" style={heading}>
            {firstName ? `${firstName}, share your story` : 'Share your story'}
          </h1>
          <p className="text-gray-700 mt-2">
            Thirty seconds to a minute is perfect. What brought you in, and how you feel about the
            result. You can watch it back and record it again as many times as you like — nothing
            is sent until you say so.
          </p>
        </div>
      )}

      {/* Live camera, countdown and playback all share this frame so the layout
          does not jump between stages. */}
      {(stage === 'countdown' || stage === 'recording' || stage === 'review') && (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] sm:aspect-video">
          {stage === 'review' && previewUrl ? (
            <video src={previewUrl} controls playsInline className="w-full h-full object-contain" />
          ) : (
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
          )}

          {stage === 'countdown' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-white text-7xl font-bold">
              {count}
            </div>
          )}

          {stage === 'recording' && (
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-sm font-medium tabular-nums">{mmss}</span>
            </div>
          )}
        </div>
      )}

      {stage === 'intro' && (
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
          <p className="text-sm text-gray-800">
            Somewhere quiet, with a window in front of you rather than behind, and hold the phone
            upright. It does not need to be perfect — the ones people trust rarely are.
          </p>
        </div>
      )}

      {stage === 'uploading' && (
        <div className="space-y-2">
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-gray-700">Uploading… {progress}%. Please keep this page open.</p>
        </div>
      )}

      {message && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{message}</p>
      )}

      {stage === 'intro' && (
        <div className="space-y-3">
          {canRecord && (
            <button
              onClick={beginCountdown}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              Start recording
            </button>
          )}
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full border border-gray-300 text-gray-700 text-sm font-medium px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {canRecord ? 'Or choose a video you already filmed' : 'Choose a video'}
          </button>
        </div>
      )}

      {stage === 'recording' && (
        <button
          onClick={() => recorderRef.current?.stop()}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors"
        >
          Stop recording
        </button>
      )}

      {stage === 'review' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Happy with it? Nothing has been sent yet.
          </p>
          <button
            onClick={() => blobRef.current && upload(blobRef.current, blobRef.current.type)}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors"
          >
            Send this one
          </button>
          <button
            onClick={redo}
            className="w-full border border-gray-300 text-gray-700 text-sm font-medium px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Record it again
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) upload(f, f.type || 'video/mp4')
        }}
      />

      {stage === 'intro' && (
        <p className="text-xs text-gray-600">
          You already signed the authorization that lets us use this. If you would rather not after
          all, just say so and we will delete it.
        </p>
      )}
    </div>
  )
}
