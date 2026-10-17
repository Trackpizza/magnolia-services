'use client'
/**
 * Your signed forms (10-16, Eric) — every form this client signed, as signed:
 * the wording, their answers, the name and the drawn signature, from the
 * records app (lib/portalSigned.ts). HIPAA gives them the right to copies of
 * their record; this is the self-serve copy. View opens it as a white "paper"
 * sheet (outside the dark portal on purpose — a signature is black ink), with
 * Print. Nothing here can be changed.
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import Section from './Section'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

export type SignedFormRow = { id: string; name: string; signedOn: string; paper: boolean; withdrawnOn: string }
type Detail = SignedFormRow & {
  body: string
  answers: { label: string; value: string }[]
  signedBy: string
  guardian: string
  signature: string
}

const longDate = (ymd: string) =>
  ymd ? new Date(`${ymd}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''

function Sheet({ d, onClose }: { d: Detail; onClose: () => void }) {
  // Print only the sheet: everything else on the page is hidden while it is open.
  useEffect(() => {
    document.body.classList.add('printing')
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => {
      document.body.classList.remove('printing')
      window.removeEventListener('keydown', esc)
    }
  }, [onClose])

  return createPortal(
    <div id="print-root" className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 text-gray-900 shadow-xl sm:p-10" style={{ color: '#111827', background: '#fff' }}>
        <div className="mb-6 flex flex-wrap items-center justify-end gap-2 print:hidden">
          <button type="button" onClick={() => window.print()} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold" style={{ color: '#111827' }}>
            🖨 Print
          </button>
          <button type="button" onClick={onClose} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold" style={{ color: '#fff' }}>
            Close
          </button>
        </div>
        <p className="text-xs uppercase tracking-wide" style={{ color: '#6b7280' }}>Magnolia Skin Center · signed {longDate(d.signedOn)}</p>
        <h2 className="mt-1 text-2xl font-semibold">{d.name}</h2>
        {d.withdrawnOn && (
          <p className="mt-2 rounded-lg px-3 py-2 text-sm" style={{ background: '#fef3c7', color: '#78350f' }}>
            You withdrew this authorization on {longDate(d.withdrawnOn)}.
          </p>
        )}
        <div className="mt-6 space-y-3 text-sm leading-relaxed [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc [&_hr]:my-4">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{d.body}</ReactMarkdown>
        </div>
        {d.answers.length > 0 && (
          <div className="mt-6 rounded-xl border p-4" style={{ borderColor: '#e5e7eb' }}>
            <p className="mb-2 text-sm font-semibold">Your answers</p>
            <ul className="space-y-1 text-sm">
              {d.answers.map((a, i) => (
                <li key={i}>
                  <span style={{ color: '#4b5563' }}>{a.label}:</span> {a.value}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-8 border-t pt-4 text-sm" style={{ borderColor: '#e5e7eb' }}>
          <p>
            Signed by <strong>{d.signedBy}</strong>
            {d.guardian && ` (${d.guardian})`} on {longDate(d.signedOn)}
            {d.paper && ' — on paper; the signed pages are on file at the clinic'}
          </p>
          {d.signature && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.signature} alt="Your signature" className="mt-3 max-h-28 rounded border p-2" style={{ borderColor: '#d1d5db', background: '#fff' }} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function SignedForms({ forms, token, session }: { forms: SignedFormRow[]; token: string; session: string }) {
  const [open, setOpen] = useState<Detail | null>(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const view = async (id: string) => {
    setBusy(id)
    setError('')
    try {
      const res = await fetch(`${API}/api/public/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, session, action: 'signed-form', form: id }),
        cache: 'no-store',
      })
      const data = (await res.json().catch(() => ({}))) as { form?: Detail }
      if (!res.ok || !data.form) throw new Error()
      setOpen(data.form)
    } catch {
      setError('We could not open that just now. Please try again, or call or text us for a copy.')
    } finally {
      setBusy('')
    }
  }

  return (
    <Section title="Your signed forms" badge={`${forms.length}`}>
      <p className="text-sm text-gray-600 mb-4">Every form you have signed with us, exactly as you signed it. Tap one to read or print it.</p>
      <ul className="divide-y divide-gray-100">
        {forms.map((f) => (
          <li key={f.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{f.name}</p>
              <p className="text-xs text-gray-600">
                Signed {longDate(f.signedOn)}
                {f.paper && ' · on paper'}
                {f.withdrawnOn && ` · withdrawn ${longDate(f.withdrawnOn)}`}
              </p>
            </div>
            <button type="button" onClick={() => view(f.id)} disabled={!!busy} className="shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700">
              {busy === f.id ? 'Opening…' : 'View'}
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {open && <Sheet d={open} onClose={() => setOpen(null)} />}
    </Section>
  )
}
