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
import BookingConfirmed from '@/components/BookingConfirmed'

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
  /** A client portal token, when they came from their own page. Means we know
   *  exactly who this is, so the form fills itself in and the "have you been
   *  here before?" question answers itself. */
  const portalToken = useSearchParams().get('c') ?? ''
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
  const [emailTouched, setEmailTouched] = useState(false)
  const [confirmed, setConfirmed] = useState<{ date: string; start: string; consultMin: number; providerName?: string } | null>(null)
  // Whether the clinic is asking for a texted code. Advisory: the records API
  // enforces it either way, so a stale value here cannot let a booking skip it.
  const [needsVerify, setNeedsVerify] = useState(false)
  const [code, setCode] = useState('')
  // Kept so a retry after 'that time was just taken' does not cost a second
  // text. The API burns it only once a booking actually lands.
  const [verifyToken, setVerifyToken] = useState('')
  const [codeResent, setCodeResent] = useState(false)
  /** True once we know who they are — arrived with a portal token and it
   *  resolved. Drives both the prefill and skipping the first-visit question. */
  const [known, setKnown] = useState(false)
  // "I have been here before" on the details step: prove a contact detail, fill
  // the form in. 'idle' -> 'phone' -> 'code' -> done (which sets `known`).
  // 'phone' is the step that asks for the detail, whichever kind it is.
  const [idStep, setIdStep] = useState<'idle' | 'phone' | 'sending' | 'code' | 'checking'>('idle')
  // Mobile or email. Somebody who has changed their number, or who is at a
  // desk with the phone in another room, has no way through an SMS-only door
  // — and they are exactly the returning patient this is for.
  const [idChannel, setIdChannel] = useState<'sms' | 'email'>('sms')
  const [idPhone, setIdPhone] = useState('')
  const [idEmail, setIdEmail] = useState('')
  const [idCode, setIdCode] = useState('')
  const [idError, setIdError] = useState('')

  const idTarget = idChannel === 'email' ? idEmail.trim() : idPhone.replace(/\D/g, '')
  const idReady = idChannel === 'email' ? EMAIL_RE.test(idEmail.trim()) : idTarget.length === 10

  const idSend = async () => {
    setIdStep('sending')
    setIdError('')
    try {
      const res = await fetch(`${API}/api/public/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          idChannel === 'email'
            ? { action: 'start', channel: 'email', email: idTarget }
            : { action: 'start', phone: idTarget },
        ),
      })
      if (!res.ok) {
        setIdError(
          idChannel === 'email'
            ? 'We could not send a code to that address. Check it, or just fill the form in.'
            : 'We could not send a code to that number. Check it, or just fill the form in.',
        )
        setIdStep('phone')
        return
      }
      setIdStep('code')
    } catch {
      setIdError('We could not send a code just now. Please fill the form in.')
      setIdStep('phone')
    }
  }

  const idCheck = async () => {
    setIdStep('checking')
    setIdError('')
    try {
      const res = await fetch(`${API}/api/public/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          idChannel === 'email'
            ? { action: 'check', channel: 'email', email: idTarget, code: idCode }
            : { action: 'check', phone: idTarget, code: idCode },
        ),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        setIdError('That code did not work. Check it and try again, or send a new one.')
        setIdStep('code')
        return
      }
      // A proved MOBILE means booking must not ask for a second code. A proved
      // address means nothing about a handset, so the API sends no token and
      // the phone step below stands — which is correct, not an oversight.
      if (d.verifyToken) setVerifyToken(String(d.verifyToken))
      // Fill in the detail they just proved, either way.
      if (idChannel === 'email') setEmail(idTarget)
      else setPhone(formatPhoneInput(idTarget))
      if (d.client) {
        setFirstName(String(d.client.firstName ?? ''))
        setLastName(String(d.client.lastName ?? ''))
        // Each channel returns the OTHER detail — that is the point of proving
        // one of them.
        if (d.client.email) setEmail(String(d.client.email))
        if (d.client.phone) setPhone(formatPhoneInput(String(d.client.phone).replace(/\D/g, '')))
        setKnown(true)
      }
      // No chart, or more than one on this mobile or address: what they proved
      // is filled in and the rest is typed, exactly as before. Saying which of
      // those happened would answer "is this person a patient here", so it
      // says neither.
      setIdStep('idle')
      setIdCode('')
    } catch {
      setIdError('Something went wrong. Please fill the form in.')
      setIdStep('code')
    }
  }

  /**
   * Where to go after picking a provider.
   *
   * Someone who arrived from their own portal has already told us they are a
   * patient here — asking "have you been treated here before?" of a person
   * standing inside their own account is the kind of question that makes
   * software feel like it is not paying attention. Straight to the times.
   */
  const afterProvider = (pid: string) => {
    if (known) { setIsNewClient(false); void loadSlots(false, pid) }
    else setStep('visit')
  }

  // Fill the form in from their chart when they arrived from their own portal.
  // Best-effort: a token that no longer resolves just means they type it in,
  // which is exactly what happened before this existed.
  useEffect(() => {
    if (!/^[0-9a-f]{32}$/.test(portalToken)) return
    let live = true
    ;(async () => {
      try {
        const res = await fetch(`${API}/api/public/portal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: portalToken, action: 'prefill' }),
        })
        if (!res.ok || !live) return
        const d = await res.json()
        if (!live) return
        setFirstName(String(d.firstName ?? ''))
        setLastName(String(d.lastName ?? ''))
        setPhone(formatPhoneInput(String(d.phone ?? '').replace(/\D/g, '')))
        setEmail(String(d.email ?? ''))
        // They are on their own portal page, so they are not a first visit.
        setIsNewClient(false)
        setKnown(true)
      } catch {
        /* They type it in, as before. */
      }
    })()
    return () => { live = false }
  }, [portalToken])

  const treatment = treatments.find(t => t.id === treatmentId) ?? null
  // Count as they type rather than rejecting on submit: someone who has typed
  // nine digits wants to know now, not after pressing the button.
  // `phone` holds the FORMATTED string; digits stay the single source of truth
  // for validation and for everything sent to the API.
  const digits = phone.replace(/\D/g, '')
  const phoneOk = digits.length === 10
  const phoneMsg =
    digits.length === 0 ? '' : digits.length < 10 ? `${10 - digits.length} more to go` : phoneOk ? '' : 'That is too many digits'
  const emailTrimmed = email.trim()
  const emailOk = EMAIL_RE.test(emailTrimmed)
  // Only complain once they have left the field. Telling someone their address
  // is malformed while they are still on the third character is noise, and it
  // trains people to ignore the line that will later say something true.
  const emailMsg = emailTouched && emailTrimmed && !emailOk
    ? 'That does not look like an email address — it needs an @ and a dot, like you@gmail.com.'
    : ''
  const emailSuggestion = emailOk ? suggestEmailDomain(emailTrimmed) : null

  const onPhoneChange = (raw: string) => setPhone(nextPhoneValue(raw, phone))
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

  /**
   * `providerOverride` exists because setState is not synchronous. The skip
   * path picks a provider and loads times in the same click, so reading
   * `providerId` back out of state here would use the PREVIOUS value and quietly
   * offer times for the wrong person. The longer path is unaffected: it goes via
   * another screen, by which point state has settled.
   */
  const loadSlots = async (newClient: boolean, providerOverride?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/api/public/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procedureId: treatmentId,
          isNewClient: newClient,
          providerId: (providerOverride ?? providerId) || undefined,
        }),
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
        <div className="flex justify-end mb-1">
          <CollapseButton onClick={() => setOpen(false)} />
        </div>
        {/* The SAME component /booking-confirmed renders. A patient who paid a
            deposit and one who did not should be told the same things — the
            prep email, the reminders, the welcome video — and two copies of
            that copy would drift apart within a month. */}
        <BookingConfirmed
          date={confirmed.date}
          start={confirmed.start}
          consultMin={confirmed.consultMin}
          providerName={confirmed.providerName || consultWith}
        />
      </div>
    )
  }

  return (
    <div ref={cardRef} className={card}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-plum-900" style={heading}>
          Book a service or in-person consult
        </h2>
        <CollapseButton onClick={() => setOpen(false)} />
      </div>

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
            <button key={p.id} onClick={() => { setProviderId(p.id); afterProvider(p.id) }}
              className="w-full text-left border border-gray-200 hover:border-brand-600 rounded-xl px-5 py-4 transition-colors">
              <span className="font-medium text-gray-900">{p.name}</span>
            </button>
          ))}
          <button onClick={() => { setProviderId(''); afterProvider('') }}
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
          {/* "I have been here before", right where they would otherwise start
              typing. Hidden once we know them — offering to identify somebody
              whose name is already in the box is noise. */}
          {!known && (
            <div className="rounded-xl border border-gray-200 p-4">
              {idStep === 'idle' && (
                <button type="button" onClick={() => { setIdStep('phone'); setIdPhone(phone); setIdEmail(email) }}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  Been here before? We&apos;ll fill this in for you &rarr;
                </button>
              )}

              {(idStep === 'phone' || idStep === 'sending') && (
                <div className="space-y-2">
                  {idChannel === 'sms' ? (
                    <label className="block text-sm font-medium text-gray-900">
                      Your mobile
                      <input value={idPhone} onChange={e => setIdPhone(nextPhoneValue(e.target.value, idPhone))}
                        inputMode="tel" autoComplete="tel" placeholder="(555)-111-7777"
                        className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base" />
                    </label>
                  ) : (
                    <label className="block text-sm font-medium text-gray-900">
                      Your email
                      <input value={idEmail} onChange={e => setIdEmail(e.target.value)}
                        inputMode="email" autoComplete="email" placeholder="you@example.com"
                        className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base" />
                    </label>
                  )}
                  <p className="text-xs text-gray-600">
                    {idChannel === 'sms' ? <>We&apos;ll text you a code.</> : <>We&apos;ll email you a code.</>}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={idSend}
                      disabled={idStep === 'sending' || !idReady}
                      className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                      {idStep === 'sending'
                        ? 'Sending…'
                        : idChannel === 'sms' ? 'Text me a code' : 'Email me a code'}
                    </button>
                    {/* The way out for a changed number or a phone in another
                        room. Without it, the only returning patients this
                        helps are the ones who needed the least help. */}
                    <button type="button"
                      onClick={() => { setIdChannel(c => (c === 'sms' ? 'email' : 'sms')); setIdError('') }}
                      className="text-sm text-brand-600 hover:text-brand-700">
                      {idChannel === 'sms' ? 'Use my email instead' : 'Use my mobile instead'}
                    </button>
                    <button type="button" onClick={() => { setIdStep('idle'); setIdError('') }}
                      className="text-sm text-gray-600 hover:text-gray-900">
                      I&apos;ll type it in
                    </button>
                  </div>
                </div>
              )}

              {(idStep === 'code' || idStep === 'checking') && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    {idChannel === 'sms' ? 'Code we texted you' : 'Code we emailed you'}
                    <input value={idCode} onChange={e => setIdCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code"
                      className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base tracking-widest text-center" />
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={idCheck}
                      disabled={idStep === 'checking' || idCode.length < 4}
                      className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                      {idStep === 'checking' ? 'Checking…' : 'Continue'}
                    </button>
                    <button type="button" onClick={idSend} disabled={idStep === 'checking'}
                      className="text-sm text-brand-600 hover:text-brand-700">
                      Send a new code
                    </button>
                  </div>
                </div>
              )}

              {idError && <p className="mt-2 text-sm text-plum-900">{idError}</p>}
            </div>
          )}

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
            <input required type="tel" inputMode="numeric" value={phone} placeholder="(555)-111-7777"
              onChange={e => onPhoneChange(e.target.value)} autoComplete="tel" maxLength={14}
              className={`mt-1 w-full border rounded-xl px-4 py-3 text-base ${
                phoneMsg ? 'border-red-400' : 'border-gray-300'
              }`} />
            <span className={`block text-xs font-normal mt-1 ${phoneMsg ? 'text-red-700' : 'text-gray-600'}`}>
              {phoneMsg || '10 digits, so we can reach you about your appointment.'}
            </span>
          </label>
          <label className="block text-sm font-medium text-gray-900">
            Email
            <input required type="email" value={email} autoComplete="email"
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className={`mt-1 w-full border rounded-xl px-4 py-3 text-base ${
                emailMsg ? 'border-red-400' : 'border-gray-300'
              }`} />
            {emailSuggestion ? (
              <span className="block text-xs font-normal text-amber-800 mt-1">
                Did you mean{' '}
                <button type="button" onClick={() => setEmail(emailSuggestion)}
                  className="underline font-medium hover:text-amber-900">{emailSuggestion}</button>?
              </span>
            ) : (
              <span className={`block text-xs font-normal mt-1 ${emailMsg ? 'text-red-700' : 'text-gray-600'}`}>
                {emailMsg || 'Your confirmation and reminders go here.'}
              </span>
            )}
          </label>
          <button type="submit" disabled={loading || !phoneOk || !emailOk}
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

/**
 * Closes the card back to the banner.
 *
 * Collapsing does NOT reset the booking: the step, the chosen time and any
 * verification already done all survive, so reopening lands where you left off.
 * Throwing it away would mean a mistaken tap costs a slot and — with
 * verification on — a second text.
 */
function CollapseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded
      aria-label="Hide booking"
      className="shrink-0 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
    >
      Hide
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}

/**
 * The SAME test the booking API applies (app/api/public/book/route.ts).
 *
 * Copied deliberately rather than loosened: a form that accepts what the server
 * rejects hands the patient a generic "something went wrong" for a typo the
 * field could have pointed at. Deliberately not a full RFC 5322 pattern —
 * those reject real addresses, and the only claim worth making here is "this
 * has a name, an @, and a domain with a dot in it".
 */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/** Domains this clinic's patients actually use. */
const COMMON_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'me.com',
  'aol.com', 'comcast.net', 'sbcglobal.net', 'att.net', 'verizon.net', 'live.com', 'msn.com',
]

/**
 * Real providers that sit one keystroke from a common one.
 *
 * `mail.com` is a genuine mailbox provider and is a single inserted 'g' away
 * from `gmail.com`; so are `ymail.com` and `email.com`. Nothing structural
 * separates those from a typo, so they are listed. Telling a mail.com user
 * their own address is wrong is the one outcome this feature must not produce.
 */
const KNOWN_REAL_LOOKALIKES = ['mail.com', 'ymail.com', 'email.com', 'googlemail.com', 'mac.com']

function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1))
      diag = tmp
    }
  }
  return prev[b.length]
}

/**
 * "gmial.com" → "gmail.com". A SUGGESTION, never a correction.
 *
 * An undeliverable address is the most expensive typo in this flow: no
 * confirmation, no cancel link, no reminders and no intake form, and nobody
 * finds out until the patient does not arrive. But auto-correcting someone's
 * own address is worse — plenty of real domains look like near-misses — so this
 * only ever asks.
 */
function suggestEmailDomain(email: string): string | null {
  const at = email.lastIndexOf('@')
  if (at < 1) return null
  const domain = email.slice(at + 1).toLowerCase()
  if (!domain || COMMON_DOMAINS.includes(domain)) return null
  if (KNOWN_REAL_LOOKALIKES.includes(domain)) return null
  for (const candidate of COMMON_DOMAINS) {
    // Tight threshold: one slip on a short domain, two on a long one. Any
    // looser and it starts second-guessing legitimate company addresses.
    const limit = candidate.length > 8 ? 2 : 1
    if (editDistance(domain, candidate) <= limit) return `${email.slice(0, at + 1)}${candidate}`
  }
  return null
}

/**
 * One edit of a phone field, reformatted as they type: the raw value the
 * browser now holds, and what the field held before it.
 *
 * BOTH phone inputs go through this. "Been here before" once formatted its own
 * field, and passed the already-formatted value to `formatPhoneInput`, which
 * takes DIGITS — so the brackets were fed back in as characters and typing 310
 * gave "(((3)-1)0".
 *
 * Two things break naive live formatting, both handled here:
 *
 *  - Backspacing over a separator removes a character that is not a digit, so
 *    the stripped value is unchanged and the field reformats straight back.
 *    The key looks dead. Detect a shortening edit that left the digits alone
 *    and drop a digit instead.
 *  - Pasting "+1 818 555 3333" gives eleven digits, and truncating to ten
 *    silently keeps the country code and loses the last digit. Strip a leading
 *    1 only when pasting into an empty field — typing it as an area code is
 *    invalid anyway, but stripping mid-edit would corrupt a number in progress.
 */
function nextPhoneValue(raw: string, prev: string): string {
  const prevDigits = prev.replace(/\D/g, '')
  let d = raw.replace(/\D/g, '')
  if (prevDigits.length === 0 && d.length === 11 && d.startsWith('1')) d = d.slice(1)
  d = d.slice(0, 10)
  if (raw.length < prev.length && d === prevDigits) d = d.slice(0, -1)
  return formatPhoneInput(d)
}

/**
 * Digits → the shape the field shows, at every length along the way.
 *
 *   8          (8
 *   818        (818)
 *   818555     (818)-555
 *   8185553333 (818)-555-3333
 *
 * The closing bracket lands the moment the area code is complete, so the field
 * confirms it back before they have typed anything else.
 */
function formatPhoneInput(digits: string): string {
  const d = digits.slice(0, 10)
  if (d.length === 0) return ''
  if (d.length < 3) return `(${d}`
  if (d.length === 3) return `(${d})`
  if (d.length <= 6) return `(${d.slice(0, 3)})-${d.slice(3)}`
  return `(${d.slice(0, 3)})-${d.slice(3, 6)}-${d.slice(6)}`
}

/** The same shape, for reading back on the code step — so the number they are
 *  checking looks like the number they typed rather than a second convention. */
function formatUsPhone(tenDigits: string): string {
  return tenDigits.length === 10 ? formatPhoneInput(tenDigits) : tenDigits
}

export default function BookTreatment({ deposit = false }: { deposit?: boolean }) {
  return (
    <Suspense fallback={null}>
      <BookTreatmentInner deposit={deposit} />
    </Suspense>
  )
}
