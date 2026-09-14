'use client'
/**
 * Patient self-booking for treatments and the in-person consult.
 *
 * This component talks DIRECTLY to the records app's public API from the
 * browser, and must keep doing so. A named person requesting a specific
 * treatment at a med spa is PHI, so routing it through this site's server -- a
 * server action, a proxying route handler, anything added because CORS was
 * annoying -- would turn magnolia-services from a marketing site into a covered
 * workload. See medspa_records/docs/PATIENT-BOOKING-SPEC.md, "Where it lives".
 *
 * Nothing about a patient is ever fetched or shown here. The API returns free
 * times and nothing else.
 */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

interface Treatment { id: string; name: string; durationMin: number; category?: string }
interface Slot { date: string; start: string; end: string }
interface Provider { id: string; name: string }
type Step = 'treatment' | 'provider' | 'visit' | 'time' | 'details' | 'verify' | 'done'

function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function longDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
}

/**
 * The ?treatment= deep link is read HERE, not in the page. Reading searchParams
 * server-side would force /bookings to render per request and lose the ISR
 * caching it has had all along -- for a value only this widget uses.
 */
function BookTreatmentInner({ deposit }: { deposit: boolean }) {
  const preselect = useSearchParams().get('treatment') ?? undefined
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [consultMin, setConsultMin] = useState(30)
  const [providers, setProviders] = useState<Provider[]>([])
  // '' means no preference, which offers the most times.
  const [providerId, setProviderId] = useState('')
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [open, setOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>('treatment')
  const [treatmentId, setTreatmentId] = useState('')
  const [isNewClient, setIsNewClient] = useState<boolean | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slot, setSlot] = useState<Slot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [confirmed, setConfirmed] = useState<{ date: string; start: string; consultMin: number; providerName?: string } | null>(null)
  // Whether the clinic is asking for a texted code. Advisory: the records API
  // enforces it either way, so a stale value here cannot let a booking skip it.
  const [needsVerify, setNeedsVerify] = useState(false)
  const [code, setCode] = useState('')
  // Kept so a retry after 'that time was just taken' does not cost a second
  // text. The API burns it only once a booking actually lands.
  const [verifyToken, setVerifyToken] = useState('')
  const [codeResent, setCodeResent] = useState(false)

  const treatment = treatments.find(t => t.id === treatmentId) ?? null
  // Count as they type rather than rejecting on submit: someone who has typed
  // nine digits wants to know now, not after pressing the button.
  const digits = phone.replace(/\D/g, '')
  const phoneOk = digits.length === 10
  const phoneMsg =
    digits.length === 0 ? '' : digits.length < 10 ? `${10 - digits.length} more to go` : phoneOk ? '' : 'That is too many digits'
  // Never "our nurse": both providers are co-owners and either may take the
  // appointment, so the copy names whoever the patient actually chose.
  const consultWith = providers.find(p => p.id === providerId)?.name ?? 'your provider'

  useEffect(() => {
    let live = true
    fetch(`${API}/api/public/treatments`)
      .then(r => r.json())
      .then((d: { enabled: boolean; treatments: Treatment[]; providers?: Provider[]; newClientConsultMin?: number; phoneVerification?: boolean }) => {
        if (!live) return
        setEnabled(d.enabled)
        setNeedsVerify(d.phoneVerification === true)
        setTreatments(d.treatments ?? [])
        setProviders(d.providers ?? [])
        if (d.newClientConsultMin) setConsultMin(d.newClientConsultMin)
        // Deep link from a service page. An unknown id falls back to the
        // picker rather than erroring.
        if (preselect && (d.treatments ?? []).some(t => t.id === preselect)) {
          setTreatmentId(preselect)
          setOpen(true)
          setStep('provider')
        }
      })
      .catch(() => { if (live) setEnabled(false) })
    return () => { live = false }
  }, [preselect])

  // Each step replaces the card's contents but the page does not move, so
  // picking a treatment from the bottom of a long list leaves you staring at the
  // footer while the next question sits off-screen above you.
  useEffect(() => {
    if (!open) return
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step, open])

  const loadSlots = async (newClient: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/api/public/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ procedureId: treatmentId, isNewClient: newClient, providerId: providerId || undefined }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'failed')
      setSlots(d.slots ?? [])
      setStep('time')
    } catch {
      setError('We could not load available times just now. Please call or text us and we will book you in.')
    } finally {
      setLoading(false)
    }
  }

  /** Ask the records API to text a code. Failing here BLOCKS the booking:
   *  letting it through when the code could not be sent would mean verification
   *  quietly stops happening and nothing says so. */
  const sendCode = async (opts?: { silent?: boolean }) => {
    setLoading(true)
    if (!opts?.silent) setError(null)
    try {
      const res = await fetch(`${API}/api/public/verify/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      })
      const d = await res.json()
      if (!res.ok) {
        setError(d.error === 'too_many'
          ? 'That is a lot of codes for one number. Please wait a little, or call or text us and we will book you in.'
          : 'We could not text you a code just now, so your booking was not taken. Please call or text us.')
        return false
      }
      setStep('verify')
      return true
    } catch {
      setError('We could not text you a code just now, so your booking was not taken. Please call or text us.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const verifyAndBook = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/api/public/verify/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, code: code.replace(/\D/g, '') }),
      })
      const d = await res.json()
      if (!res.ok) {
        setError(d.error === 'too_many'
          ? 'Too many tries. Please call or text us and we will book you in.'
          : 'We could not check that code just now. Please call or text us.')
        return
      }
      if (!d.ok) {
        setError('That code did not match. Check the text and try again.')
        return
      }
      setVerifyToken(d.token)
      // Passed rather than read from state: setVerifyToken has not landed yet.
      await book(d.token)
    } catch {
      setError('We could not check that code just now. Please call or text us.')
    } finally {
      setLoading(false)
    }
  }

  /** Details form submitted. Book straight away unless a code is wanted and we
   *  do not already hold a good one. */
  const submitDetails = async () => {
    if (!needsVerify) return book()
    if (verifyToken) return book(verifyToken)
    setCodeResent(false)
    await sendCode()
  }

  const book = async (token?: string) => {
    if (!slot) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/api/public/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procedureId: treatmentId,
          isNewClient: isNewClient === true,
          providerId: providerId || undefined,
          // Only the deposit preview asks for one. The real page never does —
          // whether a deposit is taken is the clinic's setting, not a page's.
          ...(deposit ? { deposit: true } : {}),
          date: slot.date,
          start: slot.start,
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: digits,
          email: email.trim(),
          ...(token ? { verifyToken: token } : {}),
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        // The one error worth explaining: someone took the time while this form
        // was open. Everything else gets the phone number, not an error code.
        if (d.error === 'deposit_unavailable') {
          setError('Card payments are not switched on yet, so this booking was not taken. Please call or text us.')
          return
        }
        if (d.error === 'verification_required') {
          setVerifyToken('')
          setCode('')
          setError('That code has expired. We have sent you a new one.')
          await sendCode({ silent: true })
          return
        }
        if (d.error === 'slot_taken') {
          setError('Sorry, that time was just taken. Please choose another.')
          setSlot(null)
          setStep('time')
          await loadSlots(isNewClient === true)
          return
        }
        throw new Error(d.error ?? 'failed')
      }
      // A deposit booking is not confirmed here: Stripe is, and the webhook
      // confirms it once the money lands. Hand the patient straight over.
      if (d.checkoutUrl) {
        window.location.href = d.checkoutUrl
        return
      }
      setConfirmed({ date: d.date, start: d.start, consultMin: d.consultMin ?? 0, providerName: d.providerName })
      setStep('done')
    } catch {
      setError('Something went wrong saving your booking. Please call or text us so we can help.')
    } finally {
      setLoading(false)
    }
  }

  // Grouped in the order the API returns them, which is the order the clinic set
  // in Scheduler Setup. Sorting alphabetically would scatter a category the
  // clinic deliberately kept together.
  const byCategory = useMemo(() => {
    const out: { category: string; items: Treatment[] }[] = []
    for (const t of treatments) {
      const c = t.category?.trim() || 'Treatments'
      const last = out[out.length - 1]
      if (last && last.category === c) last.items.push(t)
      else {
        const existing = out.find(g => g.category === c)
        if (existing) existing.items.push(t)
        else out.push({ category: c, items: [t] })
      }
    }
    return out
  }, [treatments])

  const byDate = useMemo(() => {
    const out: Record<string, Slot[]> = {}
    for (const s of slots) {
      if (!out[s.date]) out[s.date] = []
      out[s.date].push(s)
    }
    return out
  }, [slots])

  if (enabled === null) return null
  if (!enabled || treatments.length === 0) return null

  const card = 'bg-white rounded-2xl border border-gray-100 p-8 scroll-mt-6'
  const heading = { fontFamily: 'var(--font-cormorant), Georgia, serif' }

  // Collapsed by default. A list of treatments sitting open under the video-call
  // CTA competes with it and makes the page look like two half-finished things;
  // as a banner it reads as the second of two ways to book, which is what it is.
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-expanded={false}
        className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors"
      >
        Book a service or an in-person consult
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }

  if (step === 'done' && confirmed) {
    return (
      <div ref={cardRef} className={card}>
        <h2 className="text-2xl font-semibold text-plum-900 mb-3" style={heading}>You are booked</h2>
        <p className="text-gray-700 mb-2">
          {longDate(confirmed.date)} at {to12h(confirmed.start)}
          {confirmed.providerName ? ` with ${confirmed.providerName}` : ''}
        </p>
        {confirmed.consultMin > 0 && (
          <p className="text-gray-700 mb-2">
            Your first visit includes {confirmed.consultMin} minutes with {confirmed.providerName || consultWith} before
            your treatment. There is nothing to fill in beforehand.
          </p>
        )}
        <p className="text-sm text-gray-600">
          We have emailed your confirmation. You will get a reminder the day before and again an
          hour before. If you need to change or cancel, that email has a link.
        </p>
      </div>
    )
  }

  return (
    <div ref={cardRef} className={card}>
      <h2 className="text-2xl font-semibold text-plum-900 mb-6" style={heading}>
        Book a service or in-person consult
      </h2>

      {error && (
        <p className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      {step === 'treatment' && (
        <div>
          <p className="text-sm text-gray-600 mb-3">What would you like to book?</p>
          <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
            {byCategory.map(group => (
              <div key={group.category}>
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">
                  {group.category}
                </p>
                <div className="space-y-2">
                  {group.items.map(t => (
                    <button key={t.id} onClick={() => { setTreatmentId(t.id); setStep('provider') }}
                      className="w-full text-left flex items-center justify-between gap-4 border border-gray-200 hover:border-brand-600 rounded-xl px-5 py-4 transition-colors">
                      <span className="font-medium text-gray-900">{t.name}</span>
                      <span className="text-sm text-gray-600 shrink-0">{t.durationMin} min</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'provider' && treatment && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium text-gray-900">{treatment.name}</span> &mdash; who would you like to see?
          </p>
          {providers.map(p => (
            <button key={p.id} onClick={() => { setProviderId(p.id); setStep('visit') }}
              className="w-full text-left border border-gray-200 hover:border-brand-600 rounded-xl px-5 py-4 transition-colors">
              <span className="font-medium text-gray-900">{p.name}</span>
            </button>
          ))}
          <button onClick={() => { setProviderId(''); setStep('visit') }}
            className="w-full text-left border border-gray-200 hover:border-brand-600 rounded-xl px-5 py-4 transition-colors">
            <span className="block font-medium text-gray-900">No preference</span>
            <span className="block text-sm text-gray-600 mt-1">Shows the most available times.</span>
          </button>
          <button onClick={() => setStep('treatment')} className="text-sm text-brand-600 hover:text-brand-700 mt-2">
            &larr; Choose a different treatment
          </button>
        </div>
      )}

      {step === 'visit' && treatment && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium text-gray-900">{treatment.name}</span> &mdash; have you been treated here before?
          </p>
          <button onClick={() => { setIsNewClient(true); loadSlots(true) }} disabled={loading}
            className="w-full text-left border border-gray-200 hover:border-brand-600 rounded-xl px-5 py-4 transition-colors disabled:opacity-50">
            <span className="block font-medium text-gray-900">This is my first visit</span>
            <span className="block text-sm text-gray-600 mt-1">
              Includes {consultMin} minutes with {consultWith} before your treatment. Nothing to fill in now.
            </span>
          </button>
          <button onClick={() => { setIsNewClient(false); loadSlots(false) }} disabled={loading}
            className="w-full text-left border border-gray-200 hover:border-brand-600 rounded-xl px-5 py-4 transition-colors disabled:opacity-50">
            <span className="block font-medium text-gray-900">I have been treated here before</span>
            <span className="block text-sm text-gray-600 mt-1">Straight to your treatment.</span>
          </button>
          <button onClick={() => setStep('provider')} className="text-sm text-brand-600 hover:text-brand-700 mt-2">
            &larr; Choose someone else
          </button>
        </div>
      )}

      {step === 'time' && (
        <div>
          {loading && <p className="text-sm text-gray-600">Finding available times&hellip;</p>}
          {!loading && slots.length === 0 && (
            <p className="text-sm text-gray-700">
              We do not have any times online for this just now. Please call or text us and we will find you one.
            </p>
          )}
          {!loading && slots.length > 0 && (
            <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
              {Object.entries(byDate).map(([date, list]) => (
                <div key={date}>
                  <p className="text-sm font-semibold text-plum-900 mb-2">{longDate(date)}</p>
                  <div className="flex flex-wrap gap-2">
                    {list.map(s => (
                      <button key={`${s.date}-${s.start}`} onClick={() => { setSlot(s); setStep('details') }}
                        className="border border-gray-200 hover:border-brand-600 rounded-lg px-3 py-2 text-sm text-gray-900 transition-colors">
                        {to12h(s.start)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setStep('visit')} className="text-sm text-brand-600 hover:text-brand-700 mt-4">
            &larr; Back
          </button>
        </div>
      )}

      {step === 'details' && slot && (
        <form onSubmit={e => { e.preventDefault(); submitDetails() }} className="space-y-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">{longDate(slot.date)} at {to12h(slot.start)}</span>
            {isNewClient ? ` \u00b7 includes ${consultMin} min with ${consultWith}` : ''}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-gray-900">
              First name
              <input required value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name"
                className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base" />
            </label>
            <label className="block text-sm font-medium text-gray-900">
              Last name
              <input required value={lastName} onChange={e => setLastName(e.target.value)} autoComplete="family-name"
                className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base" />
            </label>
          </div>
          <label className="block text-sm font-medium text-gray-900">
            Mobile number
            <input required type="tel" inputMode="numeric" value={phone} placeholder="5551117777"
              onChange={e => setPhone(e.target.value)} autoComplete="tel"
              className={`mt-1 w-full border rounded-xl px-4 py-3 text-base ${
                phoneMsg ? 'border-red-400' : 'border-gray-300'
              }`} />
            <span className={`block text-xs font-normal mt-1 ${phoneMsg ? 'text-red-700' : 'text-gray-600'}`}>
              {phoneMsg || '10 digits, so we can reach you about your appointment.'}
            </span>
          </label>
          <label className="block text-sm font-medium text-gray-900">
            Email
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base" />
            <span className="block text-xs font-normal text-gray-600 mt-1">
              Your confirmation and reminders go here.
            </span>
          </label>
          <button type="submit" disabled={loading || !phoneOk}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors disabled:opacity-50">
            {loading
              ? (needsVerify && !verifyToken ? 'Texting you a code\u2026' : 'Booking\u2026')
              : (needsVerify && !verifyToken ? 'Text me a code' : 'Confirm booking')}
          </button>
          {needsVerify && !verifyToken && (
            <p className="text-xs text-gray-600">
              We will text a six-digit code to that number to check we can reach you. Your
              booking is not taken until you enter it.
            </p>
          )}
          <p className="text-xs text-gray-600">
            We will email your confirmation straight away, then remind you the day before and
            an hour before. By booking you agree to our{' '}
            {/* New tab, always. This widget holds the whole booking in component
                state, so navigating away and pressing Back does not return you
                to the code step — it returns you to an empty form at step one,
                having already spent a text. Nobody reads a privacy policy badly
                enough to deserve that. */}
            <a href="/privacy" target="_blank" rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700 underline">privacy policy</a>
            <span aria-hidden="true"> ↗</span>.
          </p>
          <button type="button" onClick={() => setStep('time')} className="text-sm text-brand-600 hover:text-brand-700">
            &larr; Pick a different time
          </button>
        </form>
      )}

      {step === 'verify' && slot && (
        <form onSubmit={e => { e.preventDefault(); verifyAndBook() }} className="space-y-4">
          <p className="text-sm text-gray-700">
            We texted a six-digit code to{' '}
            <span className="font-medium text-gray-900">{formatUsPhone(digits)}</span>.
          </p>
          <label className="block text-sm font-medium text-gray-900">
            Your code
            <input
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              type="text"
              inputMode="numeric"
              /* one-time-code lets iOS and Android offer the code from the SMS
                 itself, which removes the app-switch this step otherwise costs */
              autoComplete="one-time-code"
              maxLength={8}
              placeholder="123456"
              autoFocus
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base tracking-[0.3em]"
            />
          </label>
          <button type="submit" disabled={loading || code.replace(/\D/g, '').length < 4}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Confirming…' : 'Confirm booking'}
          </button>
          <div className="flex flex-wrap gap-4 text-sm">
            <button
              type="button"
              disabled={loading || codeResent}
              onClick={async () => { if (await sendCode()) setCodeResent(true) }}
              className="text-brand-600 hover:text-brand-700 disabled:opacity-50"
            >
              {codeResent ? 'Code sent again' : 'Send it again'}
            </button>
            <button
              type="button"
              onClick={() => { setCode(''); setCodeResent(false); setError(null); setStep('details') }}
              className="text-brand-600 hover:text-brand-700"
            >
              Use a different number
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

/** (818) 555-0142 — so the patient can check at a glance that the code went to
 *  the number they meant, which is half the reason this step exists. */
function formatUsPhone(tenDigits: string): string {
  return tenDigits.length === 10
    ? `(${tenDigits.slice(0, 3)}) ${tenDigits.slice(3, 6)}-${tenDigits.slice(6)}`
    : tenDigits
}

export default function BookTreatment({ deposit = false }: { deposit?: boolean }) {
  return (
    <Suspense fallback={null}>
      <BookTreatmentInner deposit={deposit} />
    </Suspense>
  )
}
