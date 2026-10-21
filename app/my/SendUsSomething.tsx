'use client'
/**
 * "Send us something" (10-21, Eric) — two buttons on one card:
 *
 *  📷 Show us a concern — 1–4 photos of a problem area and a short note,
 *     optionally "about" one of their recent treatments. Eileen asks for
 *     these ("send me a picture from your page").
 *  📄 Upload a document — a prescription bottle, a note from another
 *     doctor, other. Photo or PDF, up to 5. A warning they cannot miss
 *     against insurance cards, payment cards and SSNs: insurance goes through
 *     Dr. David's own practice, not the clinic.
 *
 * Talks to the records app's /api/public/portal-upload behind the portal
 * session. Photos are re-encoded as JPEG here: smaller, always viewable on
 * the clinic's computers (HEIC is not), and it drops the phone's location
 * data. Only Eileen is told (records lib/patientUploads.ts).
 */
import { useEffect, useRef, useState } from 'react'
import Section from './Section'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

type Mode = 'concern' | 'document'
type Picked = { blob: Blob; type: string; name: string; preview: string }

const DOC_TYPES: { id: string; label: string }[] = [
  { id: 'medication', label: 'Prescription / medication' },
  { id: 'doctor-note', label: 'Note from another doctor' },
  { id: 'other', label: 'Other' },
]
const MAX: Record<Mode, number> = { concern: 4, document: 5 }

const primary =
  'w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors disabled:opacity-50'
const outline =
  'w-full rounded-xl border border-brand-600 px-6 py-4 text-base font-semibold text-brand-700 hover:bg-brand-50 transition-colors'

/** A phone photo → JPEG, long edge ≤ 2048. Null when it cannot be read. */
async function asJpeg(file: File): Promise<Blob | null> {
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 2048 / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * scale)
    c.height = Math.round(bmp.height * scale)
    const ctx = c.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bmp, 0, 0, c.width, c.height)
    bmp.close?.()
    return await new Promise((res) => c.toBlob((b) => res(b), 'image/jpeg', 0.88))
  } catch {
    return null
  }
}

export default function SendUsSomething({ token, session, clinicPhone }: { token: string; session: string; clinicPhone?: string }) {
  const [mode, setMode] = useState<Mode | null>(null)
  const [treatments, setTreatments] = useState<{ visitId: string; label: string }[]>([])
  const [visitId, setVisitId] = useState('')
  const [docType, setDocType] = useState('medication')
  const [note, setNote] = useState('')
  const [files, setFiles] = useState<Picked[]>([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState<Mode | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const call = async (body: Record<string, unknown>) => {
    const res = await fetch(`${API}/api/public/portal-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, session, ...body }),
      cache: 'no-store',
    })
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    return { ok: res.ok, data }
  }

  // Their recent treatments, for "Is this about a treatment?" — once, when
  // the concern form first opens.
  useEffect(() => {
    if (mode !== 'concern' || treatments.length) return
    call({ action: 'options' })
      .then(({ ok, data }) => {
        if (ok && Array.isArray(data.treatments)) setTreatments(data.treatments as { visitId: string; label: string }[])
      })
      .catch((e) => console.warn('portal: upload options failed:', e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const reset = () => {
    files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
    setFiles([])
    setNote('')
    setVisitId('')
    setDocType('medication')
    setError('')
  }

  const open = (m: Mode) => {
    reset()
    setSent(null)
    setMode(m)
  }

  const pick = async (list: FileList | null) => {
    if (!list || !mode) return
    setError('')
    const room = MAX[mode] - files.length
    const chosen = Array.from(list).slice(0, Math.max(0, room))
    if (list.length > room) setError(`Up to ${MAX[mode]} — the extra ones were left out.`)
    const out: Picked[] = []
    for (const f of chosen) {
      if (mode === 'document' && f.type === 'application/pdf') {
        if (f.size > 20 * 1024 * 1024) {
          setError('That PDF is over 20 MB — try a photo of the page instead.')
          continue
        }
        out.push({ blob: f, type: 'application/pdf', name: f.name, preview: '' })
        continue
      }
      const jpg = await asJpeg(f)
      if (!jpg) {
        setError('We could not read one of those pictures. Try another, or take a new photo.')
        continue
      }
      out.push({ blob: jpg, type: 'image/jpeg', name: f.name, preview: URL.createObjectURL(jpg) })
    }
    setFiles((xs) => [...xs, ...out])
    if (input.current) input.current.value = ''
  }

  const send = async () => {
    if (!mode || files.length === 0) return
    setError('')
    try {
      setBusy('Starting…')
      const start = await call({ action: 'start', kind: mode })
      if (!start.ok || !start.data.id) throw new Error(String(start.data.error ?? 'start failed'))
      const id = String(start.data.id)
      for (let i = 0; i < files.length; i++) {
        setBusy(`Sending ${i + 1} of ${files.length}…`)
        const slot = await call({ action: 'file', id, index: i, contentType: files[i].type })
        if (!slot.ok || !slot.data.uploadUrl) throw new Error(String(slot.data.error ?? 'no upload url'))
        const put = await fetch(String(slot.data.uploadUrl), {
          method: 'PUT',
          headers: { 'Content-Type': files[i].type },
          body: files[i].blob,
        })
        if (!put.ok) throw new Error(`upload ${put.status}`)
      }
      setBusy('Finishing…')
      const done = await call({ action: 'finish', id, note, visitId, docType })
      if (!done.ok) throw new Error(String(done.data.error ?? 'finish failed'))
      reset()
      setSent(mode)
      setMode(null)
    } catch (e) {
      console.warn('portal: send failed:', e)
      setError(
        e instanceof Error && e.message === 'rate_limited'
          ? 'That is a lot of sending for one hour — try again a little later.'
          : 'It did not send. Check your connection and try again.',
      )
    } finally {
      setBusy('')
    }
  }

  const tel = clinicPhone ? `tel:+1${clinicPhone.replace(/\D/g, '').slice(-10)}` : ''

  return (
    <Section title="Send us something">
      {sent && (
        <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          ✓ Sent. {sent === 'concern' ? 'Eileen will look at your photos' : 'We will look at it'} during clinic hours.
        </p>
      )}

      {!mode && (
        <div className="space-y-2">
          <button type="button" className={primary} onClick={() => open('concern')}>📷 Show us a concern</button>
          <button type="button" className={outline} onClick={() => open('document')}>📄 Upload a document</button>
        </div>
      )}

      {mode === 'concern' && (
        <div className="space-y-4">
          {/* Not for emergencies — the one thing on this card that cannot wait
              for clinic hours. Wording for Eileen / Dr. David to approve. */}
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            <strong>If your skin is white, gray-blue, or very painful after a filler, or you have trouble seeing or
            breathing — don&apos;t wait.</strong>{' '}
            {tel ? <a href={tel} className="font-semibold underline">Call us now</a> : 'Call us now'} or 911. Photos sent here
            are looked at during clinic hours.
          </div>
          {treatments.length > 0 && (
            <label className="block">
              <span className="block text-sm font-medium text-gray-800 mb-1">Is this about a treatment you had?</span>
              <select
                value={visitId}
                onChange={(e) => setVisitId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base"
              >
                <option value="">Something else / not sure</option>
                {treatments.map((t) => (
                  <option key={t.visitId} value={t.visitId}>{t.label}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      {mode === 'document' && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">Please don&apos;t send insurance cards, credit or debit cards, or Social Security numbers.</p>
            <p className="mt-1">
              Insurance is separate from the clinic — talk to Dr. David about it; it goes through his own practice.
            </p>
          </div>
          <label className="block">
            <span className="block text-sm font-medium text-gray-800 mb-1">What is it?</span>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base"
            >
              {DOC_TYPES.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {mode && (
        <div className="mt-4 space-y-4">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative">
                  {f.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.preview} alt="" className="h-20 w-20 rounded-lg border border-gray-200 object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-1 text-center text-xs text-gray-700">
                      📄 {f.name.slice(0, 18)}
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => {
                      if (f.preview) URL.revokeObjectURL(f.preview)
                      setFiles((xs) => xs.filter((_, j) => j !== i))
                    }}
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-gray-900 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length < MAX[mode] && (
            <>
              <input
                ref={input}
                type="file"
                multiple
                accept={mode === 'document' ? 'image/*,application/pdf' : 'image/*'}
                className="hidden"
                onChange={(e) => void pick(e.target.files)}
              />
              <button type="button" className={outline} onClick={() => input.current?.click()} disabled={!!busy}>
                {files.length === 0
                  ? mode === 'concern' ? '📷 Take or choose photos (1–4)' : '📄 Take a photo or choose a file'
                  : `＋ Add more (${files.length} of ${MAX[mode]})`}
              </button>
            </>
          )}

          <label className="block">
            <span className="block text-sm font-medium text-gray-800 mb-1">
              {mode === 'concern' ? 'A short note' : 'Anything we should know? (optional)'}
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 1000))}
              rows={3}
              placeholder={mode === 'concern' ? 'Where is it? Since when? Itchy, painful, spreading?' : ''}
              className="w-full rounded-xl border border-gray-300 px-3 py-3 text-base"
            />
          </label>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button type="button" className={primary} onClick={send} disabled={files.length === 0 || !!busy}>
            {busy || `Send ${files.length ? `(${files.length})` : ''}`}
          </button>
          <button
            type="button"
            className="w-full text-sm text-gray-600 underline"
            onClick={() => {
              reset()
              setMode(null)
            }}
            disabled={!!busy}
          >
            Cancel
          </button>
        </div>
      )}
    </Section>
  )
}
