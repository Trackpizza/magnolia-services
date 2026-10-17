'use client'
/**
 * Talk to your doctor — time sensitive (10-16). Medication holds Dr. David
 * made in the consultation (records app, lib/medHolds.ts): medications the
 * client may need to pause before a treatment. Magnolia never tells them to
 * stop one — they talk to their own prescribing doctor.
 *
 *  step "agree":  read and sign the agreement (a form on the records app)
 *  step "doctor": "Have you spoken with your doctor?" — Yes opens the form
 *                 asking what the doctor said (signed again); Not yet says
 *                 when to call by.
 *  step "done":   (10-16, Eric) "Your medication plan" — quiet, no buttons:
 *                 what to stop and when to restart, and what their doctor
 *                 said, until the last restart day after the treatment.
 */
import { useState } from 'react'
import Section from './Section'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

export type PortalMedHold = {
  id: string
  treatment: string
  apptDate: string
  deadline: string
  step: 'agree' | 'doctor' | 'done'
  meds: { name: string; stop: string; restart: string }[]
  note: string
  /** Their own answers on "Talking With Your Doctor" — on a done hold. */
  doctorSaid?: { label: string; value: string }[]
}

const longDate = (ymd: string) =>
  ymd ? new Date(`${ymd}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''

/** The form page shows "Back to your page" instead of "close this page". */
const withReturn = (url: string) =>
  typeof window === 'undefined' ? url : `${url}${url.includes('?') ? '&' : '?'}return=${encodeURIComponent(window.location.href)}`

const primary =
  'w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors disabled:opacity-50'
const outline =
  'w-full rounded-xl border border-brand-600 px-6 py-4 text-base font-semibold text-brand-700 hover:bg-brand-50 transition-colors'

/** A finished hold: the plan they agreed with their doctor — nothing to do. */
function Plan({ h }: { h: PortalMedHold }) {
  return (
    <div className="space-y-4">
      <p className="text-base font-semibold text-gray-900">
        Your {h.treatment}
        {h.apptDate && ` on ${longDate(h.apptDate)}`}
      </p>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-700 mb-2">Medications:</p>
        <ul className="space-y-2">
          {h.meds.map((m, i) => (
            <li key={i} className="text-sm text-gray-900">
              <strong>{m.name}</strong> — {m.stop}; {m.restart}.
            </li>
          ))}
        </ul>
        {h.note && <p className="mt-3 text-sm text-gray-700">Note from Dr. David: {h.note}</p>}
      </div>
      {(h.doctorSaid ?? []).length > 0 && (
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">What you told us your doctor said</p>
          <ul className="space-y-1 text-sm text-gray-800">
            {h.doctorSaid!.map((a, i) => (
              <li key={i}>
                <span className="text-gray-600">{a.label}:</span> {a.value}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm text-gray-600">
        Follow your doctor&rsquo;s advice — please don&rsquo;t stop, change or restart any medication without their OK.
        Questions? Call or text us.
      </p>
    </div>
  )
}

function Hold({ h, token, session }: { h: PortalMedHold; token: string; session: string }) {
  const [busy, setBusy] = useState(false)
  const [notYet, setNotYet] = useState(false)
  const [error, setError] = useState('')
  const today = new Date().toLocaleDateString('en-CA')
  const late = !!h.deadline && today > h.deadline
  // Due soon (10-16): the stop date is within 3 days — say so, plainly.
  const daysLeft = h.deadline
    ? Math.round((Date.parse(`${h.deadline}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86_400_000)
    : null
  const soon = !late && daysLeft !== null && daysLeft <= 3
  const dueWords = daysLeft === 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`

  const open = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/public/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, session, action: 'medhold-link', hold: h.id }),
        cache: 'no-store',
      })
      const data = (await res.json().catch(() => ({}))) as { url?: string }
      if (!res.ok || !data.url) throw new Error()
      window.location.href = withReturn(data.url)
    } catch {
      setError('We could not open that just now. Please try again, or call or text us.')
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-base font-semibold text-gray-900">
          Before your {h.treatment}
          {h.apptDate && ` on ${longDate(h.apptDate)}`}
        </p>
        {h.deadline && (
          <p className={`mt-1 text-sm font-semibold ${late ? 'text-red-700' : 'text-amber-900'}`}>
            {late
              ? `⚠ This was due by ${longDate(h.deadline)} — please call us today.`
              : soon
                ? `⏰ Due ${dueWords} — please talk to your doctor by ${longDate(h.deadline)}.`
                : `Talk to your doctor before ${longDate(h.deadline)}.`}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-700 mb-2">Medications to talk over with the doctor who prescribes them:</p>
        <ul className="space-y-2">
          {h.meds.map((m, i) => (
            <li key={i} className="text-sm text-gray-900">
              <strong>{m.name}</strong> — {m.stop}; {m.restart}.
            </li>
          ))}
        </ul>
        {h.note && <p className="mt-3 text-sm text-gray-700">Note from Dr. David: {h.note}</p>}
      </div>

      <p className="text-sm text-gray-600">
        Please don&rsquo;t stop or change any medication without your prescribing doctor&rsquo;s OK — we&rsquo;ll plan
        around what they say.
      </p>

      {h.step === 'agree' ? (
        <button type="button" onClick={open} disabled={busy} className={primary}>
          {busy ? 'Opening…' : 'Read and sign the agreement'}
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-base font-semibold text-gray-900">Have you spoken with your doctor?</p>
          <button type="button" onClick={open} disabled={busy} className={primary}>
            {busy ? 'Opening…' : 'Yes — tell us what they said'}
          </button>
          <button type="button" onClick={() => setNotYet(true)} className={outline}>
            Not yet
          </button>
          {notYet && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Please call your doctor{h.deadline ? ` before ${longDate(h.deadline)}` : ' soon'}, then come back here and tap
              <strong> Yes</strong>. Questions? Call or text us.
            </p>
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default function PortalMedHolds({ holds, token, session }: { holds: PortalMedHold[]; token: string; session: string }) {
  const todo = holds.filter((h) => h.step !== 'done')
  const plans = holds.filter((h) => h.step === 'done')
  return (
    <>
      {todo.length > 0 && (
        <Section title="Talk to your doctor" badge="Time sensitive" urgent>
          <div className="space-y-8">
            {todo.map((h, i) => (
              <div key={h.id} className={i ? 'border-t border-gray-100 pt-6' : ''}>
                <Hold h={h} token={token} session={session} />
              </div>
            ))}
          </div>
        </Section>
      )}
      {plans.length > 0 && (
        <Section title="Your medication plan">
          <div className="space-y-8">
            {plans.map((h, i) => (
              <div key={h.id} className={i ? 'border-t border-gray-100 pt-6' : ''}>
                <Plan h={h} />
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
