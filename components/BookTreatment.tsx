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
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

interface Treatment { id: string; name: string; durationMin: number }
interface Slot { date: string; start: string; end: string }
interface Provider { id: string; name: string }
type Step = 'treatment' | 'provider' | 'visit' | 'time' | 'details' | 'done'

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
function BookTreatmentInner() {
  const preselect = useSearchParams().get('treatment') ?? undefined
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [consultMin, setConsultMin] = useState(30)
  const [providers, setProviders] = useState<Provider[]>([])
  // '' means no preference, which offers the most times.
  const [providerId, setProviderId] = useState('')
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [step, setStep] = useState<Step>('treatment')
  const [treatmentId, setTreatmentId] = useState('')
  const [isNewClient, setIsNewClient] = useState<boolean | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slot, setSlot] = useState<Slot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [confirmed, setConfirmed] = useState<{ date: string; start: string; consultMin: number; providerName?: string } | null>(null)

  const treatment = treatments.find(t => t.id === treatmentId) ?? null
  // Never "our nurse": both providers are co-owners and either may take the
  // appointment, so the copy names whoever the patient actually chose.
  const consultWith = providers.find(p => p.id === providerId)?.name ?? 'your provider'

  useEffect(() => {
    let live = true
    fetch(`${API}/api/public/treatments`)
      .then(r => r.json())
      .then((d: { enabled: boolean; treatments: Treatment[]; providers?: Provider[]; newClientConsultMin?: number }) => {
        if (!live) return
        setEnabled(d.enabled)
        setTreatments(d.treatments ?? [])
        setProviders(d.providers ?? [])
        if (d.newClientConsultMin) setConsultMin(d.newClientConsultMin)
        // Deep link from a service page. An unknown id falls back to the
        // picker rather than erroring.
        if (preselect && (d.treatments ?? []).some(t => t.id === preselect)) {
          setTreatmentId(preselect)
          setStep('provider')
        }
      })
      .catch(() => { if (live) setEnabled(false) })
    return () => { live = false }
  }, [preselect])

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

  const book = async () => {
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
          date: slot.date,
          start: slot.start,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        // The one error worth explaining: someone took the time while this form
        // was open. Everything else gets the phone number, not an error code.
        if (d.error === 'slot_taken') {
          setError('Sorry, that time was just taken. Please choose another.')
          setSlot(null)
          setStep('time')
          await loadSlots(isNewClient === true)
          return
        }
        throw new Error(d.error ?? 'failed')
      }
      setConfirmed({ date: d.date, start: d.start, consultMin: d.consultMin ?? 0, providerName: d.providerName })
      setStep('done')
    } catch {
      setError('Something went wrong saving your booking. Please call or text us so we can help.')
    } finally {
      setLoading(false)
    }
  }

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

  const card = 'bg-white rounded-2xl border border-gray-100 p-8'
  const heading = { fontFamily: 'var(--font-cormorant), Georgia, serif' }

  if (step === 'done' && confirmed) {
    return (
      <div className={card}>
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
          We have emailed your confirmation. If you need to change it, that email has a link.
        </p>
      </div>
    )
  }

  return (
    <div className={card}>
      <h2 className="text-2xl font-semibold text-plum-900 mb-6" style={heading}>
        Book a service or in-person consult
      </h2>

      {error && (
        <p className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      {step === 'treatment' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-3">What would you like to book?</p>
          {treatments.map(t => (
            <button key={t.id} onClick={() => { setTreatmentId(t.id); setStep('provider') }}
              className="w-full text-left flex items-center justify-between gap-4 border border-gray-200 hover:border-brand-600 rounded-xl px-5 py-4 transition-colors">
              <span className="font-medium text-gray-900">{t.name}</span>
              <span className="text-sm text-gray-600 shrink-0">{t.durationMin} min</span>
            </button>
          ))}
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
        <form onSubmit={e => { e.preventDefault(); book() }} className="space-y-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">{longDate(slot.date)} at {to12h(slot.start)}</span>
            {isNewClient ? ` \u00b7 includes ${consultMin} min with ${consultWith}` : ''}
          </p>
          <label className="block text-sm font-medium text-gray-900">
            Your name
            <input required value={name} onChange={e => setName(e.target.value)} autoComplete="name"
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base" />
          </label>
          <label className="block text-sm font-medium text-gray-900">
            Mobile number
            <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel"
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base" />
          </label>
          <label className="block text-sm font-medium text-gray-900">
            Email
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
              className="mt-1 w-full border border-gray-300 rounded-xl px-4 py-3 text-base" />
            <span className="block text-xs font-normal text-gray-600 mt-1">
              Your confirmation and reminders go here.
            </span>
          </label>
          <button type="submit" disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Booking\u2026' : 'Confirm booking'}
          </button>
          <button type="button" onClick={() => setStep('time')} className="text-sm text-brand-600 hover:text-brand-700">
            &larr; Pick a different time
          </button>
        </form>
      )}
    </div>
  )
}

export default function BookTreatment() {
  return (
    <Suspense fallback={null}>
      <BookTreatmentInner />
    </Suspense>
  )
}
