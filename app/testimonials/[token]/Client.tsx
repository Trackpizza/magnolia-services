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
 * So: nothing about a patient is ever fetched or stored here. This page holds a
 * token, asks the records API what to do with it, and gets out of the way.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

const ACCEPT = 'video/mp4,video/quicktime,video/webm'
/** Comfortably above a couple of minutes of phone video, low enough that a
 *  mistaken twenty-minute clip fails fast instead of after ten minutes. */
const MAX_BYTES = 500 * 1024 * 1024

type Stage = 'loading' | 'ready' | 'uploading' | 'done' | 'invalid' | 'error'

export default function TestimonialUploader() {
  const { token } = useParams<{ token: string }>()
  const [stage, setStage] = useState<Stage>('loading')
  const [firstName, setFirstName] = useState('')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const post = useCallback(
    async (payload: Record<string, unknown>) => {
      const res = await fetch(`${API}/api/public/testimonial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...payload }),
      })
      return { ok: res.ok, data: await res.json().catch(() => ({})) }
    },
    [token],
  )

  useEffect(() => {
    let live = true
    post({})
      .then(({ ok, data }) => {
        if (!live) return
        if (!ok) { setStage('invalid'); return }
        setFirstName(String(data.firstName ?? ''))
        setStage('ready')
      })
      .catch(() => { if (live) setStage('invalid') })
    return () => { live = false }
  }, [post])

  const upload = async (file: File) => {
    if (file.size > MAX_BYTES) {
      setMessage('That video is very large. Please send a shorter clip, or text it to us instead.')
      return
    }
    setStage('uploading')
    setProgress(0)
    setMessage('')

    try {
      const start = await post({ action: 'start', contentType: file.type })
      if (!start.ok || !start.data.uploadUrl) {
        setStage('error')
        setMessage('We could not start the upload. Please call or text us and we will sort it out.')
        return
      }

      // XHR rather than fetch: this is the one place a progress bar genuinely
      // matters, and fetch still cannot report upload progress.
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', String(start.data.uploadUrl))
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(String(xhr.status))))
        xhr.onerror = () => reject(new Error('network'))
        xhr.send(file)
      })

      // The records app checks the file actually landed before it writes
      // anything to the chart, so this is a claim it verifies rather than trusts.
      const finish = await post({ action: 'finish' })
      if (!finish.ok) {
        setStage('error')
        setMessage('Your video uploaded, but we could not file it. Please call or text us — nothing is lost.')
        return
      }
      setStage('done')
    } catch {
      setStage('error')
      setMessage('The upload stopped partway. Please try again on a stronger connection.')
    }
  }

  if (stage === 'loading') return <p className="text-gray-700">One moment…</p>

  if (stage === 'invalid') {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-plum-900" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
          This link has expired
        </h1>
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
        <h1 className="text-2xl font-semibold text-plum-900" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
          Thank you{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-gray-700">
          We have your video. Nothing goes anywhere public without the permission you already
          gave us, and you can change your mind at any time — just tell us.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-plum-900" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
          {firstName ? `${firstName}, share your story` : 'Share your story'}
        </h1>
        <p className="text-gray-700 mt-2">
          A short clip is perfect — thirty seconds to a minute. What brought you in, and how you
          feel about the result.
        </p>
      </div>

      <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
        <p className="text-sm text-gray-800">
          Film it however is easiest. Somewhere quiet, with a window in front of you rather than
          behind, and hold the phone upright. It does not need to be perfect — the ones people
          trust rarely are.
        </p>
      </div>

      {/* `capture` lets a phone open the camera directly; on a laptop the same
          control is an ordinary file picker. One input, both behaviours. */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        capture="user"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) upload(f)
        }}
      />

      {stage === 'uploading' ? (
        <div className="space-y-2">
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-gray-700">
            Uploading… {progress}%. Please keep this page open.
          </p>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors"
        >
          Record or choose a video
        </button>
      )}

      {message && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{message}</p>
      )}

      <p className="text-xs text-gray-600">
        You already signed the authorization that lets us use this. If you would rather not after
        all, just say so and we will delete it.
      </p>
    </div>
  )
}
