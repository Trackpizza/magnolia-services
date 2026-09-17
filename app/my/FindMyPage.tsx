'use client'

/**
 * "Find your page" — the way back in when the link is gone.
 *
 * A patient who wants their page eight months later is hunting for a text or
 * an email they lost long ago, and the only fix used to be ringing the clinic
 * to have Eileen open the chart and send it again: a phone call about a URL.
 * Prove a mobile or an email and the browser walks straight into the portal.
 *
 * Every silence the booking form keeps, this keeps. The code goes out whether
 * or not the contact is known, the reply is the same either way, and nothing
 * comes back until the code is checked. Zero charts and TWO charts on one
 * mobile both end in the same place — so what it says there is "we could not
 * match that to a single page", which is true of both and gives away neither.
 */
import { useState } from 'react'
import { writeSession } from './session'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/** Digits → the shape the field shows, the same convention as the booking
 *  form: the closing bracket lands as soon as the area code is complete. */
function formatPhoneInput(digits: string): string {
  const d = digits.slice(0, 10)
  if (d.length === 0) return ''
  if (d.length < 3) return `(${d}`
  if (d.length === 3) return `(${d})`
  if (d.length <= 6) return `(${d.slice(0, 3)})-${d.slice(3)}`
  return `(${d.slice(0, 3)})-${d.slice(3, 6)}-${d.slice(6)}`
}

/** One edit of the phone field. Backspacing over a separator has to delete a
 *  digit or the key looks dead, and a pasted "+1 818…" must lose the country
 *  code rather than its last digit. */
function nextPhoneValue(raw: string, prev: string): string {
  const prevDigits = prev.replace(/\D/g, '')
  let d = raw.replace(/\D/g, '')
  if (prevDigits.length === 0 && d.length === 11 && d.startsWith('1')) d = d.slice(1)
  d = d.slice(0, 10)
  if (raw.length < prev.length && d === prevDigits) d = d.slice(0, -1)
  return formatPhoneInput(d)
}

export default function FindMyPage() {
  const [channel, setChannel] = useState<'sms' | 'email'>('sms')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'contact' | 'sending' | 'code' | 'checking' | 'nomatch'>('contact')
  const [error, setError] = useState('')

  const digits = phone.replace(/\D/g, '')
  const ready = channel === 'email' ? EMAIL_RE.test(email.trim()) : digits.length === 10
  const contact = () =>
    channel === 'email' ? { channel: 'email', email: email.trim() } : { phone: digits }

  const send = async () => {
    setStep('sending')
    setError('')
    try {
      const res = await fetch(`${API}/api/public/findme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', ...contact() }),
      })
      if (!res.ok) {
        setError('We could not send a code just now. Please call or text us.')
        setStep('contact')
        return
      }
      setStep('code')
    } catch {
      setError('We could not send a code just now. Please call or text us.')
      setStep('contact')
    }
  }

  const check = async () => {
    setStep('checking')
    setError('')
    try {
      const res = await fetch(`${API}/api/public/findme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', ...contact(), code }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError('That code did not work. Check it and try again, or send a new one.')
        setStep('code')
        return
      }
      if (d.token) {
        // Logged in already: the code they just read back is the same proof
        // the portal's own login asks for, and sending them to a locked page
        // to do it twice would be two codes to open one page.
        if (d.session) writeSession(String(d.session))
        // A whole navigation rather than a router push: the token belongs in
        // the address bar, so the page they land on is one they can bookmark.
        window.location.href = `/my?t=${encodeURIComponent(String(d.token))}`
        return
      }
      setStep('nomatch')
    } catch {
      setError('Something went wrong. Please try again.')
      setStep('code')
    }
  }

  // The same card as the rest of the portal, so arriving here does not look
  // like a different site.
  const card = 'bg-white rounded-2xl border border-gray-100 p-6 sm:p-8'
  const field = 'mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base'
  const primary =
    'w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors disabled:opacity-50'
  const quiet = 'text-sm text-brand-600 hover:text-brand-700'

  return (
    <div className={card}>
      <h1 className="text-2xl font-semibold text-plum-900 mb-2">Find your page</h1>
      <p className="text-sm text-gray-600 mb-5">
        Your page lives at a link we sent you. Lost it? Give us the mobile or email you use
        with us and we will send a code to check it is you.
      </p>

      {(step === 'contact' || step === 'sending') && (
        <div className="space-y-3">
          {channel === 'sms' ? (
            <label className="block text-sm font-medium text-gray-900">
              Your mobile
              <input
                value={phone}
                onChange={(e) => setPhone(nextPhoneValue(e.target.value, phone))}
                inputMode="tel"
                autoComplete="tel"
                placeholder="(555)-111-7777"
                className={field}
              />
            </label>
          ) : (
            <label className="block text-sm font-medium text-gray-900">
              Your email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={field}
              />
            </label>
          )}
          <button onClick={send} disabled={step === 'sending' || !ready} className={primary}>
            {step === 'sending' ? 'Sending…' : 'Send me a code'}
          </button>
          <button
            onClick={() => {
              setChannel((c) => (c === 'sms' ? 'email' : 'sms'))
              setError('')
            }}
            className={quiet}
          >
            {channel === 'sms' ? 'Use my email instead' : 'Use my mobile instead'}
          </button>
        </div>
      )}

      {(step === 'code' || step === 'checking') && (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            {channel === 'email'
              ? 'We sent a code to that address, if it is one we have.'
              : 'We sent a code to that number, if it is one we have.'}
          </p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg tracking-widest text-center"
          />
          <button onClick={check} disabled={step === 'checking' || code.length < 4} className={primary}>
            {step === 'checking' ? 'Checking…' : 'Open my page'}
          </button>
          <button onClick={send} disabled={step === 'checking'} className={quiet}>
            Send a new code
          </button>
        </div>
      )}

      {step === 'nomatch' && (
        /* Worded the same for "we have never seen this" and "two people here
           share it", because telling those apart would answer "is this person
           a patient at a med spa" for anybody who asked. */
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            We could not match that to a single page. Call or text us and we will send your
            link straight over.
          </p>
          <button
            onClick={() => {
              setStep('contact')
              setCode('')
              setError('')
            }}
            className={quiet}
          >
            Try the other one
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-plum-900 bg-cream-100 rounded-xl px-4 py-3">{error}</p>}
    </div>
  )
}
