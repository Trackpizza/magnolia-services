'use client'
/**
 * Talks to the records app from the browser, like the booking widget and the
 * manage page, and for the same reason: the data stays over there.
 *
 * The plan is the top of the page on purpose. It is the reason to open the
 * link — what is coming and why — and everything else on here is admin.
 */
import { useCallback, useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

/** "Aug 12, 2026" — for things that already happened, where the weekday is
 *  noise and the year is not. Also just narrower, which matters in a two-column
 *  row on a 375px screen. */
function pastDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

function longDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
}

interface Appt {
  date: string
  start: string
  end: string
  treatment: string
  provider: string
  manageUrl: string | null
}

interface PlanItem {
  title: string
  timing: string
  note: string
  walkthroughUrl: string | null
  done: boolean
}

interface ConsentItem { names: string[]; url: string }

interface PastVisit { date: string; treatment: string; provider: string }
interface SignedConsent { names: string[]; signedAt: string | null }
interface History { visits: PastVisit[]; consents: SignedConsent[] }

interface View {
  firstName: string
  upcoming: Appt[]
  plan: PlanItem[]
  consents: ConsentItem[]
  questionnaireNeeded: boolean
  bookingUrl: string
  clinicPhone: string
  clinicAddress: string
  historyAvailable: boolean
  unlocked: boolean
  history: History | null
}

/**
 * Where the 90-day device trust lives.
 *
 * localStorage, per browser, and it is only a KEY — the server decides what
 * it unlocks and which patient it belongs to. A stolen one is worth nothing on
 * anyone else's link. Wrapped because a private window or blocked site data
 * makes these throw rather than return empty.
 */
const SESSION_KEY = 'msc_portal_session'
function readSession(): string {
  try { return localStorage.getItem(SESSION_KEY) ?? '' } catch { return '' }
}
function writeSession(v: string) {
  try { localStorage.setItem(SESSION_KEY, v) } catch { /* history just asks again next time */ }
}

const heading = { fontFamily: 'var(--font-cormorant), Georgia, serif' }
const card = 'bg-white rounded-2xl border border-gray-100 p-6 sm:p-8'

export default function PortalClient({ token }: { token: string }) {
  const [view, setView] = useState<View | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'gone' | 'error'>('loading')

  // 'idle' → 'sending' → 'entering' → unlocked (which lives on `view`)
  const [gate, setGate] = useState<'idle' | 'sending' | 'entering' | 'checking'>('idle')
  const [code, setCode] = useState('')
  const [last4, setLast4] = useState('')
  const [gateError, setGateError] = useState('')

  const call = useCallback(
    async (extra: Record<string, unknown> = {}) => {
      const res = await fetch(`${API}/api/public/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...extra }),
      })
      return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) }
    },
    [token],
  )

  const load = useCallback(async () => {
    if (!token) { setState('gone'); return }
    try {
      // The stored session rides along on the first call, so a trusted device
      // arrives with history already open rather than being asked again.
      const { ok, data } = await call({ session: readSession() })
      if (!ok) { setState('gone'); return }
      setView(data as View)
      setState('ok')
    } catch {
      setState('error')
    }
  }, [token, call])

  useEffect(() => { load() }, [load])

  const sendCode = async () => {
    setGate('sending')
    setGateError('')
    try {
      const { ok, data } = await call({ action: 'code' })
      if (!ok) {
        setGateError('We could not send a code just now. Please call or text us.')
        setGate('idle')
        return
      }
      setLast4(String(data.last4 ?? ''))
      setGate('entering')
    } catch {
      setGateError('We could not send a code just now. Please call or text us.')
      setGate('idle')
    }
  }

  const unlock = async () => {
    setGate('checking')
    setGateError('')
    try {
      const { ok, data } = await call({ action: 'unlock', code })
      if (!ok) {
        setGateError('That code did not work. Check it and try again, or send a new one.')
        setGate('entering')
        return
      }
      writeSession(String(data.session ?? ''))
      setView((v) => (v ? { ...v, unlocked: true, history: data.history as History } : v))
      setGate('idle')
      setCode('')
    } catch {
      setGateError('Something went wrong. Please try again.')
      setGate('entering')
    }
  }

  if (state === 'loading') {
    return <div className={card}><p className="text-gray-600">Loading your page&hellip;</p></div>
  }

  if (state === 'gone') {
    return (
      <div className={card}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-3" style={heading}>Link not found</h1>
        <p className="text-gray-700">
          This link is not valid any more. Please call or text us and we will send you a new one.
        </p>
      </div>
    )
  }

  if (state === 'error' || !view) {
    return (
      <div className={card}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-3" style={heading}>Something went wrong</h1>
        <p className="text-gray-700">
          We could not load your page just now. Please try again, or call or text us.
        </p>
      </div>
    )
  }

  const toDo = view.consents.length + (view.questionnaireNeeded ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h1 className="text-3xl font-semibold text-plum-900" style={heading}>
          Hello{view.firstName ? `, ${view.firstName}` : ''}
        </h1>
      </div>

      {/* ── Still to do ───────────────────────────────────────────────────
          First when there is anything, because it is the only part of this
          page with a deadline attached to it. Absent entirely when there is
          nothing — an empty "nothing to do" card is noise on every visit. */}
      {toDo > 0 && (
        <div className={card}>
          <h2 className="text-lg font-semibold text-plum-900 mb-1" style={heading}>
            Before your next visit
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            A couple of minutes on your phone, and there is nothing to fill in when you arrive.
          </p>
          <div className="space-y-2">
            {view.questionnaireNeeded && (
              <p className="text-sm text-gray-700">
                Your health history — we will text or email you the form.
              </p>
            )}
            {view.consents.map((c) => (
              <a
                key={c.url}
                href={c.url}
                className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors"
              >
                Read and sign: {c.names.join(' · ')}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── What is booked ────────────────────────────────────────────── */}
      <div className={card}>
        <h2 className="text-lg font-semibold text-plum-900 mb-3" style={heading}>
          Your appointments
        </h2>
        {view.upcoming.length === 0 ? (
          <>
            <p className="text-sm text-gray-700 mb-4">Nothing booked at the moment.</p>
            <a
              href={view.bookingUrl}
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              Book an appointment
            </a>
          </>
        ) : (
          <div className="space-y-4">
            {view.upcoming.map((a) => (
              <div key={`${a.date}-${a.start}`} className="border-l-2 border-brand-600 pl-4">
                <p className="text-base font-medium text-gray-900">{longDate(a.date)}</p>
                <p className="text-base text-gray-900">{to12h(a.start)} &ndash; {to12h(a.end)}</p>
                <p className="text-sm text-gray-700 mt-1">{a.treatment}</p>
                <p className="text-sm text-gray-600">with {a.provider}</p>
                {/* Only self-booked appointments carry a token, so one booked
                    for them over the phone simply shows no link, exactly as
                    their confirmation email does. */}
                {a.manageUrl && (
                  <a href={a.manageUrl} className="inline-block mt-2 text-sm text-brand-600 hover:text-brand-700">
                    Reschedule or cancel &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── The plan ──────────────────────────────────────────────────── */}
      {view.plan.length > 0 && (
        <div className={card}>
          <h2 className="text-lg font-semibold text-plum-900 mb-1" style={heading}>
            Where we are going
          </h2>
          {/* "Discussed", never "agreed". This is a clinical conversation
              written down, not a contract, and the wording is the whole
              difference between the two. */}
          <p className="text-sm text-gray-600 mb-5">
            What we discussed for the months ahead. Nothing here is booked or fixed — we
            adjust as we go.
          </p>
          <ol className="space-y-5">
            {view.plan.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                    s.done ? 'bg-brand-600 text-white' : 'border border-gray-300 text-gray-500'
                  }`}
                >
                  {s.done ? '✓' : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${s.done ? 'text-gray-500' : 'text-gray-900'}`}>
                    {s.title}
                  </p>
                  {s.timing && <p className="text-sm text-gray-600">{s.timing}</p>}
                  {s.note && <p className="text-sm text-gray-700 mt-1">{s.note}</p>}
                  {s.walkthroughUrl && (
                    <a
                      href={s.walkthroughUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      ▶ Watch Dr. David explain this &rarr;
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <a
            href={view.bookingUrl}
            className="block w-full text-center mt-6 border border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors"
          >
            Book your next visit
          </a>
        </div>
      )}

      {/* Treatment history, behind a code.
          The code goes to the number already on their chart, never one typed
          here — so whoever holds this link can make a phone buzz but cannot
          receive the code. Hidden entirely when there is no mobile on file:
          offering a code we cannot send is worse than not offering one. */}
      {view.historyAvailable && !view.unlocked && (
        <div className={card}>
          <h2 className="text-lg font-semibold text-plum-900 mb-1" style={heading}>
            Your treatment history
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Everything you have had done with us. We will text a code to the mobile on your
            file first — just once on this phone.
          </p>

          {/* 'checking' keeps this branch open on purpose — branching on
              'entering' alone made the code box disappear the instant they
              pressed the button, which reads as the page losing what they
              typed. */}
          {gate === 'entering' || gate === 'checking' ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                We sent a code to the number ending <strong className="text-plum-900">{last4}</strong>.
              </p>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg tracking-widest text-center"
              />
              <button
                onClick={unlock}
                disabled={gate === 'checking' || code.length < 4}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {gate === 'checking' ? 'Checking…' : 'Show my history'}
              </button>
              <button
                onClick={sendCode}
                disabled={gate === 'checking'}
                className="text-sm text-brand-600 hover:text-brand-700"
              >
                Send a new code
              </button>
            </div>
          ) : (
            <button
              onClick={sendCode}
              disabled={gate === 'sending'}
              className="w-full border border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {gate === 'sending' ? 'Sending…' : 'Text me a code'}
            </button>
          )}

          {gateError && <p className="mt-3 text-sm text-plum-900 bg-cream-100 rounded-xl px-4 py-3">{gateError}</p>}
        </div>
      )}

      {view.unlocked && view.history && (
        <div className={card}>
          <h2 className="text-lg font-semibold text-plum-900 mb-4" style={heading}>
            Your treatment history
          </h2>

          {view.history.visits.length === 0 ? (
            <p className="text-sm text-gray-700">Nothing recorded yet — your first visit is still to come.</p>
          ) : (
            <ul className="space-y-3">
              {view.history.visits.map((v, i) => (
                <li key={i} className="flex justify-between gap-4 border-b border-gray-100 pb-3 last:border-0">
                  <span className="min-w-0">
                    <span className="block text-gray-900">{v.treatment}</span>
                    <span className="block text-sm text-gray-600">with {v.provider}</span>
                  </span>
                  <span className="shrink-0 text-sm text-gray-600">{pastDate(v.date)}</span>
                </li>
              ))}
            </ul>
          )}

          {view.history.consents.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Forms you have signed</h3>
              <ul className="space-y-1.5">
                {view.history.consents.map((c, i) => (
                  <li key={i} className="flex justify-between gap-4 text-sm">
                    <span className="min-w-0 text-gray-700">{c.names.join(' · ')}</span>
                    {c.signedAt && (
                      <span className="shrink-0 text-gray-500">
                        {new Date(c.signedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="text-xs text-gray-500 mt-5">
            Need your photos or treatment notes? Ask us — they are part of your medical record
            and we will go through them with you.
          </p>
        </div>
      )}

      {/* ── Reaching a person ─────────────────────────────────────────── */}
      <div className={`${card} text-center`}>
        <h2 className="text-lg font-semibold text-plum-900 mb-2" style={heading}>Questions?</h2>
        {view.clinicPhone ? (
          <p className="text-gray-700">
            Text or call us on{' '}
            <a href={`tel:${view.clinicPhone.replace(/\D/g, '')}`} className="font-semibold text-plum-900 hover:text-brand-700">
              {view.clinicPhone}
            </a>
            . You will get one of us, not a robot.
          </p>
        ) : (
          <p className="text-gray-700">Give us a call or a text any time.</p>
        )}
        {/* From settings, not hardcoded. A clinic that moves should not need a
            deploy to stop sending patients to the old address. */}
        {view.clinicAddress && (
          <p className="text-sm text-gray-600 mt-3">{view.clinicAddress}</p>
        )}
      </div>

      <p className="text-center text-xs text-gray-500 px-4">
        This page is yours — keep the link. It stays up to date on its own.
      </p>
    </div>
  )
}
