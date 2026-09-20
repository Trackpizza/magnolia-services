'use client'
/**
 * Talks to the records app from the browser, like the booking widget and the
 * manage page, and for the same reason: the data stays over there.
 *
 * The plan is the top of the page on purpose. It is the reason to open the
 * link — what is coming and why — and everything else on here is admin.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import FindMyPage from './FindMyPage'
import { readSession, writeSession } from './session'
import BookTreatment from '@/components/BookTreatment'

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
  /** The rest of the same visit, when the clinic stacked treatments into one
   *  appointment. Absent on every plan written before stacking existed. */
  also?: string[]
  timing: string
  note: string
  walkthroughUrl: string | null
  done: boolean
}

interface ConsentItem { names: string[]; url: string }

/** Clinic-editable buttons. `href` arrives already normalised and filtered by
 *  the records app, so this renders it without interpreting anything. */
interface PortalLink { label: string; href: string; emoji: string }

interface PastVisit { date: string; treatment: string; provider: string }
interface SignedConsent { names: string[]; signedAt: string | null }

/** An ISO timestamp as a patient would say it. Used for "we have your video
 *  from ..." — a date, never a time, because the time it was uploaded is not
 *  something anyone needs to be reminded of. */
function shortDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}
interface History { visits: PastVisit[]; consents: SignedConsent[] }

/**
 * What the API sends before anyone has proved anything: which ways a code can
 * be sent, and the clinic's own number. Nothing about the patient — not even a
 * first name, because "Hello, Jane" to whoever opened a forwarded link is
 * already a disclosure.
 */
interface LockedView {
  locked: true
  /** Offering a button the API answers 503 to is worse than offering nothing. */
  channels: { sms: boolean; email: boolean }
  clinicPhone: string
  /** Public documents. They belong on the login screen too — the privacy
   *  policy should not sit behind the login it describes. */
  legalLinks?: PortalLink[]
}

interface OpenView {
  locked?: false
  firstName: string
  upcoming: Appt[]
  plan: PlanItem[]
  consents: ConsentItem[]
  questionnaireNeeded: boolean
  bookingUrl: string
  clinicPhone: string
  clinicAddress: string
  links: PortalLink[]
  legalLinks?: PortalLink[]
  /** Share your story. `signed` is the authorization; `sent` is what they have
   *  already given, newest first. */
  testimonial?: { signed: boolean; sent: string[] }
  /** Photos the clinic has asked for and is still waiting on. */
  photoRequests?: { label: string; slots: string[]; procedureName: string; url: string }[]
  history: History | null
}

type View = LockedView | OpenView


const heading = { fontFamily: 'var(--font-cormorant), Georgia, serif' }
const card = 'bg-white rounded-2xl border border-gray-100 p-6 sm:p-8'
const primaryBtn =
  'w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors disabled:opacity-50'
const quietBtn = 'text-sm text-brand-600 hover:text-brand-700'

export default function PortalClient({ token }: { token: string }) {
  const [view, setView] = useState<View | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'gone' | 'error'>('loading')

  // 'idle' → 'sending' → 'entering' → unlocked (which lives on `view`)
  const [gate, setGate] = useState<'idle' | 'sending' | 'entering' | 'checking'>('idle')
  const [code, setCode] = useState('')
  const [last4, setLast4] = useState('')
  const [sentTo, setSentTo] = useState('')
  // Which way the code went. A patient whose number changed is the reason the
  // email route exists, and they are also the one most likely to be staring at
  // a page saying "check your phone".
  const [gateChannel, setGateChannel] = useState<'sms' | 'email'>('sms')
  const [gateError, setGateError] = useState('')
  // The booking widget, shown on request. Both Book buttons open it and scroll
  // to it — a picker that is always open would make the page about booking,
  // and the page is about the plan.
  // Minted on demand rather than handed out with the page: a testimonial link
  // sitting unused in a payload is a live upload link for whoever sees it.
  const [busy, setBusy] = useState('')
  const [linkError, setLinkError] = useState('')
  const openLink = async (action: 'video-consent' | 'testimonial-link') => {
    setBusy(action)
    setLinkError('')
    try {
      const { ok, data } = await call({ action, session: readSession() })
      if (!ok || !data.url) {
        setLinkError('We could not open that just now. Please try again, or call or text us.')
        return
      }
      window.location.href = String(data.url)
    } catch {
      setLinkError('We could not open that just now. Please try again, or call or text us.')
    } finally {
      setBusy('')
    }
  }

  const [booking, setBooking] = useState(false)
  const bookingRef = useRef<HTMLDivElement | null>(null)
  const openBooking = () => {
    setBooking(true)
    // After paint, or it scrolls to where the card is about to be.
    requestAnimationFrame(() =>
      bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

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

  const sendCode = async (channel: 'sms' | 'email' = gateChannel) => {
    setGate('sending')
    setGateError('')
    setGateChannel(channel)
    try {
      const { ok, data } = await call({ action: 'code', channel })
      if (!ok) {
        setGateError('We could not send a code just now. Please call or text us.')
        setGate('idle')
        return
      }
      setLast4(String(data.last4 ?? ''))
      setSentTo(String(data.sentTo ?? ''))
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
      const { ok, data } = await call({ action: 'unlock', code, channel: gateChannel })
      if (!ok) {
        setGateError('That code did not work. Check it and try again, or send a new one.')
        setGate('entering')
        return
      }
      // Saved first, then the page asks for itself again WITH the session —
      // which is also exactly what every later visit on this device does, so
      // the logged-in path is the same code as the returning path rather than
      // a second one that can drift.
      writeSession(String(data.session ?? ''))
      setGate('idle')
      setCode('')
      await load()
    } catch {
      setGateError('Something went wrong. Please try again.')
      setGate('entering')
    }
  }

  if (state === 'loading') {
    return <div className={card}><p className="text-gray-600">Loading your page&hellip;</p></div>
  }

  // No token at all, or one that no longer resolves. Both used to end at
  // "call us"; both are now the same question — which mobile or email do you
  // use with us — answered on the spot.
  if (state === 'gone') {
    return <FindMyPage />
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

  // ── Locked: the link named the chart, the code says it is them ───────────
  //
  // This is the whole portal now, not a second gate on one section. The page
  // below never renders for somebody who has only got hold of a link.
  if (view.locked) {
    const canSms = view.channels.sms
    const canEmail = view.channels.email
    return (
      <div className={card}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-2" style={heading}>
          Your page
        </h1>
        {/* The pitch, not an apology. A code is worth typing for something,
            and this says what — without saying anything about the chart. */}
        <p className="text-sm text-gray-600 mb-5">
          Your treatment plan, your appointments and anything still to sign are inside. To
          keep them private we send a code first, to the number or address we already have
          for you — there is nothing to type.
        </p>

        {gate === 'entering' || gate === 'checking' ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              {gateChannel === 'email' ? (
                <>We sent a code to <strong className="text-plum-900">{sentTo}</strong>.</>
              ) : (
                <>We sent a code to the number ending <strong className="text-plum-900">{last4}</strong>.</>
              )}
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg tracking-widest text-center"
            />
            <button onClick={unlock} disabled={gate === 'checking' || code.length < 4} className={primaryBtn}>
              {gate === 'checking' ? 'Checking…' : 'Open my page'}
            </button>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => sendCode()} disabled={gate === 'checking'} className={quietBtn}>
                Send a new code
              </button>
              {gateChannel === 'sms' && canEmail && (
                <button onClick={() => sendCode('email')} disabled={gate === 'checking'} className={quietBtn}>
                  Not your number any more? Email it instead
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* SMS first whenever we have a mobile, and that is security
                rather than taste: the LINK usually arrives by email, so a
                code to the same inbox would put the door and its key in one
                place. */}
            {canSms && (
              <button onClick={() => sendCode('sms')} disabled={gate === 'sending'} className={primaryBtn}>
                {gate === 'sending' ? 'Sending…' : 'Text me a code'}
              </button>
            )}
            {canEmail && (
              <button
                onClick={() => sendCode('email')}
                disabled={gate === 'sending'}
                className={canSms ? quietBtn : primaryBtn}
              >
                {canSms ? 'Or email it to me instead' : gate === 'sending' ? 'Sending…' : 'Email me a code'}
              </button>
            )}
            {!canSms && !canEmail && (
              /* Nothing on the chart to send to. The records app now refuses
                 to mint a link for one of these, so this is an older link
                 rather than a new mistake — and there is no self-serve way
                 out of it by design. */
              <p className="text-sm text-gray-700">
                We do not have a mobile or an email on file for this page, so we cannot send
                a code. Please call or text us{view.clinicPhone ? ` on ${view.clinicPhone}` : ''} and
                we will sort it out.
              </p>
            )}
          </div>
        )}

        {gateError && <p className="mt-3 text-sm text-plum-900 bg-cream-100 rounded-xl px-4 py-3">{gateError}</p>}

        <div className="mt-6">
          <LegalFooter links={view.legalLinks} />
        </div>
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
            <button
              onClick={openBooking}
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              Book an appointment
            </button>
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
                  {/* Stacked treatments sit under the first one, inside the
                      SAME numbered step — one visit, several things done at
                      it. Numbering them separately would read as extra trips,
                      and a plan that looks longer than it is gets declined. */}
                  {(s.also ?? []).map((t, j) => (
                    <p
                      key={j}
                      className={`font-medium ${s.done ? 'text-gray-500' : 'text-gray-900'}`}
                    >
                      <span className="text-gray-400 mr-1" aria-hidden>
                        +
                      </span>
                      {t}
                    </p>
                  ))}
                  {(s.also ?? []).length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">Together, in one visit</p>
                  )}
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
          <button
            onClick={openBooking}
            className="block w-full text-center mt-6 border border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors"
          >
            Book your next visit
          </button>
        </div>
      )}

      {/* Photos the clinic is waiting on.
          Near the top, above the plan, because it is the one thing on this
          page somebody else is waiting for — everything else is theirs to
          read whenever. It also makes "check your page" a real instruction:
          an email from three weeks ago is not somewhere a patient can be
          sent, and this is why Eileen can text four words instead of
          re-sending a link. */}
      {(view.photoRequests ?? []).map((r) => (
        <div key={r.url} className={card}>
          <h2 className="text-lg font-semibold text-plum-900 mb-1" style={heading}>
            Could you send us a photo?
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            It has been {r.label}
            {r.procedureName ? ` since your ${r.procedureName}` : ""}. A couple of photos lets
            your provider see how it is settling — it takes a minute on your phone, and they
            go straight onto your record.
          </p>
          {r.slots.length > 0 && (
            <p className="text-sm text-gray-600 mb-4">
              We will ask for {r.slots.length}: {r.slots.join(', ')}.
            </p>
          )}
          <a href={r.url} className={primaryBtn + ' text-center block'}>
            Take the photos
          </a>
        </div>
      ))}

      {/* Share your story.
          Eileen had to remember to ask, chart by chart, at the moment she is
          busiest. The person best placed to decide is the patient reading
          their own plan and looking at what has changed — so it is offered
          here, on their own time, and she stops being the bottleneck.

          Authorization first, recording second, the same order staff follow.
          Filming a testimonial before somebody has agreed to it being used is
          collecting footage you have no right to. */}
      {view.testimonial && (
        <div className={card}>
          <h2 className="text-lg font-semibold text-plum-900 mb-1" style={heading}>
            Share your story
          </h2>

          {view.testimonial.sent.length > 0 && (
            <p className="text-sm text-gray-600 mb-3">
              {view.testimonial.sent.length === 1
                ? `Thank you — we have your video${view.testimonial.sent[0] ? ` from ${shortDate(view.testimonial.sent[0])}` : ''}.`
                : `Thank you — we have ${view.testimonial.sent.length} videos from you${
                    view.testimonial.sent[0] ? `, the most recent from ${shortDate(view.testimonial.sent[0])}` : ''
                  }.`}
            </p>
          )}

          {!view.testimonial.signed ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                If you are happy with how things are going, a short video helps someone else
                decide. First there is a one-page authorization to read and sign — nothing is
                ever used without it, and you can withdraw it at any time.
              </p>
              <button onClick={() => openLink('video-consent')} disabled={busy !== ''} className={primaryBtn}>
                {busy === 'video-consent' ? 'Opening…' : 'Read the authorization'}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {view.testimonial.sent.length > 0
                  ? 'Happy to record another? A minute is plenty, filmed on your own phone.'
                  : 'A minute is plenty, filmed on your own phone, whenever suits you. You can watch it back and record it again before anything is sent.'}
              </p>
              <button onClick={() => openLink('testimonial-link')} disabled={busy !== ''} className={primaryBtn}>
                {busy === 'testimonial-link' ? 'Opening…' : 'Record a video'}
              </button>
            </>
          )}

          {linkError && <p className="mt-3 text-sm text-plum-900">{linkError}</p>}
        </div>
      )}

      {/* Booking, in the portal rather than off it.
          The widget already knows who this is, so there is no form to fill in
          and no code to wait for: the session it carries IS the proof, and it
          is a stronger one than the text the booking form would otherwise
          send. Rendered only once asked for, so the page still opens on the
          plan rather than on a treatment picker. */}
      {booking && (
        <div ref={bookingRef}>
          <BookTreatment portal={{ token, session: readSession() }} />
        </div>
      )}

      {view.history && (
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

      {/* ── The clinic's own buttons ────────────────────────────────
          Whatever the clinic would otherwise have typed into a text message:
          book, leave a review, the services site, a number to tap. Editable in
          Settings, so the list changes without a deploy. */}
      {view.links.length > 0 && (
        <div className={card}>
          <div className="space-y-2">
            {view.links.map((l) => (
              <a
                key={l.href + l.label}
                href={l.href}
                {...(l.href.startsWith('http')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className="flex items-center gap-3 w-full border border-gray-200 hover:border-brand-600 rounded-xl px-5 py-4 transition-colors"
              >
                <span className="text-xl shrink-0" aria-hidden>{l.emoji}</span>
                <span className="font-medium text-gray-900">{l.label}</span>
              </a>
            ))}
          </div>
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

      <LegalFooter links={view.legalLinks} />
    </div>
  )
}

/** Privacy, Terms and whatever else the clinic lists in Settings. Quiet, at
 *  the bottom, present for the person who goes looking. Renders nothing at all
 *  when the list is empty rather than leaving an orphaned separator. */
function LegalFooter({ links }: { links?: PortalLink[] }) {
  if (!links?.length) return null
  return (
    <p className="text-center text-xs text-gray-400 px-4 pb-2">
      {links.map((l, i) => (
        <span key={l.href}>
          {i > 0 && <span className="mx-1.5">·</span>}
          <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 underline">
            {l.label}
          </a>
        </span>
      ))}
    </p>
  )
}
