'use client'
/**
 * Talks directly to the records app from the browser, like the booking widget
 * and the cancel page, and for the same reason.
 *
 * What it shows is whatever the API returns and no more. The treatment name and
 * the provider come back null when the clinic keeps patient emails minimal, and
 * this renders around that rather than filling the gap — the page must never
 * disclose more than the email that carried the link.
 */
import { useCallback, useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

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

interface View {
  date: string
  start: string
  end: string
  status: 'booked' | 'cancelled' | 'pending'
  treatment: string | null
  provider: string | null
  prepUrl: string | null
  canReschedule: boolean
  rescheduleBlocked: string | null
  leadHours: number
  intakeNeeded: boolean
  clinicPhone: string
}

interface Slot { date: string; start: string; end: string }

type Screen = 'loading' | 'gone' | 'error' | 'main' | 'pick' | 'moved' | 'cancelled'

const heading = { fontFamily: 'var(--font-cormorant), Georgia, serif' }
const card = 'bg-white rounded-2xl border border-gray-100 p-6 sm:p-8'

export default function ManageClient({ token }: { token: string }) {
  const [screen, setScreen] = useState<Screen>('loading')
  const [view, setView] = useState<View | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState('')
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const call = useCallback(
    async (action: string, extra: Record<string, unknown> = {}) => {
      const res = await fetch(`${API}/api/public/appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action, ...extra }),
      })
      return { ok: res.ok, status: res.status, data: await res.json() }
    },
    [token],
  )

  const load = useCallback(async () => {
    if (!token) { setScreen('gone'); return }
    try {
      const { ok, data } = await call('view')
      if (!ok) { setScreen('gone'); return }
      setView(data as View)
      setScreen('main')
    } catch {
      setScreen('error')
    }
  }, [token, call])

  useEffect(() => { load() }, [load])

  const openSlots = async () => {
    setWorking(true)
    setNotice('')
    try {
      const { ok, data } = await call('slots')
      if (!ok) { setNotice('Those times are not available to change online. Please call or text us.'); return }
      setSlots(data.slots ?? [])
      setScreen('pick')
    } catch {
      setNotice('We could not load available times. Please try again.')
    } finally {
      setWorking(false)
    }
  }

  const move = async (slot: Slot) => {
    setWorking(true)
    setNotice('')
    try {
      const { ok, status, data } = await call('reschedule', { date: slot.date, start: slot.start })
      if (status === 409) {
        // Someone took it while they were choosing. Reload the list rather
        // than showing an error next to times that are now wrong.
        setNotice('Sorry — that time was just taken. Here are the times still open.')
        const again = await call('slots')
        setSlots(again.data.slots ?? [])
        return
      }
      if (!ok) { setNotice('We could not move your appointment. Please call or text us.'); return }
      setView(v => (v ? { ...v, date: data.date, start: data.start, end: data.end } : v))
      setScreen('moved')
    } catch {
      setNotice('We could not move your appointment. Please call or text us.')
    } finally {
      setWorking(false)
    }
  }

  // Cancelling goes to the route that has always done it, not through the
  // manage endpoint — one copy of that logic, and the older /bookings/cancel
  // page keeps working off exactly the same code.
  const cancel = async () => {
    setWorking(true)
    try {
      const res = await fetch(`${API}/api/public/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, confirm: true }),
      })
      if (!res.ok) throw new Error('failed')
      setScreen('cancelled')
    } catch {
      setNotice('We could not cancel it. Please call or text us so we can do it for you.')
    } finally {
      setWorking(false)
    }
  }

  const openIntake = async () => {
    setWorking(true)
    try {
      const { ok, data } = await call('intake')
      if (ok && data.url) window.location.href = data.url
      else setNotice('We could not open your forms. Please call or text us.')
    } catch {
      setNotice('We could not open your forms. Please call or text us.')
    } finally {
      setWorking(false)
    }
  }

  const callUs = (phone: string) =>
    phone ? <>Please call or text us on <strong className="text-plum-900">{phone}</strong>.</> : <>Please call or text us.</>

  if (screen === 'loading') {
    return <div className={card}><p className="text-gray-600">Loading your appointment&hellip;</p></div>
  }

  if (screen === 'gone') {
    return (
      <div className={card}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-3" style={heading}>Link not found</h1>
        <p className="text-gray-700">
          This link is not valid any more. If you still need to change an appointment,
          please call or text us and we will sort it out.
        </p>
      </div>
    )
  }

  if (screen === 'error') {
    return (
      <div className={card}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-3" style={heading}>Something went wrong</h1>
        <p className="text-gray-700">
          We could not reach our booking system. Please call or text us and we will help.
        </p>
      </div>
    )
  }

  if (screen === 'cancelled') {
    return (
      <div className={`${card} text-center`}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-3" style={heading}>Appointment cancelled</h1>
        {view && <p className="text-gray-700 mb-2">{longDate(view.date)} at {to12h(view.start)}</p>}
        <p className="text-sm text-gray-600">Nothing further to do. You can rebook any time.</p>
        <a href="/bookings" className="inline-block mt-6 bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors">
          Book another appointment
        </a>
      </div>
    )
  }

  if (screen === 'pick') {
    const byDate = slots.reduce<Record<string, Slot[]>>((acc, s) => {
      (acc[s.date] ||= []).push(s)
      return acc
    }, {})
    return (
      <div className={card}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-2" style={heading}>Choose a new time</h1>
        <p className="text-sm text-gray-600 mb-5">
          You are moving your appointment on {view && longDate(view.date)} at {view && to12h(view.start)}.
        </p>
        {notice && <p className="text-sm text-plum-900 bg-cream-100 rounded-xl px-4 py-3 mb-4">{notice}</p>}
        {slots.length === 0 ? (
          <p className="text-gray-700">
            We do not have other times online just now. {view && callUs(view.clinicPhone)}
          </p>
        ) : (
          <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
            {Object.entries(byDate).map(([date, list]) => (
              <div key={date}>
                <p className="text-sm font-semibold text-plum-900 mb-2">{longDate(date)}</p>
                <div className="flex flex-wrap gap-2">
                  {list.map(s => (
                    <button key={`${s.date}-${s.start}`} onClick={() => move(s)} disabled={working}
                      className="border border-gray-200 hover:border-brand-600 rounded-xl px-4 py-2 text-sm text-gray-900 transition-colors disabled:opacity-50">
                      {to12h(s.start)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => { setScreen('main'); setNotice('') }} disabled={working}
          className="mt-6 text-sm text-brand-600 hover:text-brand-700">
          &larr; Keep my current time
        </button>
      </div>
    )
  }

  if (!view) return null

  const movedJustNow = screen === 'moved'

  // One cancel control, rendered in both branches below. Cancelling is offered
  // whether or not the appointment can still be MOVED online: a slot given back
  // can be refilled, a no-show cannot, and the last thing to do is make giving
  // it back harder than simply not turning up.
  const cancelControl = confirmingCancel ? (
    <div className="mt-4 border border-gray-200 rounded-xl p-4">
      <p className="text-sm text-gray-700 mb-3">
        Cancel your appointment on {longDate(view.date)} at {to12h(view.start)}?
      </p>
      <div className="flex gap-2">
        <button onClick={cancel} disabled={working}
          className="flex-1 border border-gray-300 hover:border-plum-900 text-plum-900 text-sm font-semibold px-4 py-3 rounded-xl transition-colors disabled:opacity-50">
          {working ? 'Cancelling…' : 'Yes, cancel it'}
        </button>
        <button onClick={() => setConfirmingCancel(false)} disabled={working}
          className="flex-1 text-sm text-gray-600 hover:text-gray-900 px-4 py-3">
          Keep it
        </button>
      </div>
    </div>
  ) : (
    <button onClick={() => setConfirmingCancel(true)}
      className="block mt-4 text-sm text-gray-600 hover:text-gray-900 underline">
      Cancel this appointment
    </button>
  )

  return (
    <div className="space-y-4">
      <div className={card}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-4" style={heading}>
          {movedJustNow ? 'Your appointment has been moved' : 'Your appointment'}
        </h1>

        {movedJustNow && (
          <p className="text-sm text-gray-700 bg-cream-100 rounded-xl px-4 py-3 mb-4">
            We have emailed you the new details. Nothing else to do.
          </p>
        )}

        <p className="text-lg text-gray-900">{longDate(view.date)}</p>
        <p className="text-lg text-gray-900 mb-1">{to12h(view.start)} &ndash; {to12h(view.end)}</p>
        {/* Null when the clinic keeps patient emails minimal. Nothing stands in
            for it: an absent line says less than a placeholder would. */}
        {view.treatment && <p className="text-gray-700 mt-2">{view.treatment}</p>}
        {view.provider && <p className="text-sm text-gray-600">with {view.provider}</p>}

        {view.status === 'cancelled' && (
          <p className="mt-4 text-sm text-gray-700 bg-cream-100 rounded-xl px-4 py-3">
            This appointment is cancelled. {callUs(view.clinicPhone)}
          </p>
        )}

        {notice && <p className="mt-4 text-sm text-plum-900 bg-cream-100 rounded-xl px-4 py-3">{notice}</p>}
      </div>

      {view.intakeNeeded && view.status !== 'cancelled' && (
        <div className={card}>
          <h2 className="text-lg font-semibold text-plum-900 mb-2" style={heading}>Before you come in</h2>
          <p className="text-sm text-gray-700 mb-4">
            There are a few health questions to answer. It takes a couple of minutes on your
            phone and saves filling in a form when you arrive.
          </p>
          <button onClick={openIntake} disabled={working}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors disabled:opacity-50">
            {working ? 'Opening…' : 'Fill in my forms'}
          </button>
        </div>
      )}

      {view.prepUrl && view.status !== 'cancelled' && (
        <div className={card}>
          <h2 className="text-lg font-semibold text-plum-900 mb-2" style={heading}>How to prepare</h2>
          <a href={view.prepUrl} className="text-brand-600 hover:text-brand-700 text-sm font-medium">
            Read the pre-treatment instructions &rarr;
          </a>
        </div>
      )}

      {view.status !== 'cancelled' && (
        <div className={card}>
          <h2 className="text-lg font-semibold text-plum-900 mb-3" style={heading}>Need to change it?</h2>

          {view.canReschedule ? (
            <>
              <button onClick={openSlots} disabled={working}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-6 py-4 rounded-xl transition-colors disabled:opacity-50">
                {working ? 'Loading…' : 'Move to another time'}
              </button>

              {cancelControl}
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                {view.rescheduleBlocked === 'too_soon'
                  ? <>Your appointment is less than {view.leadHours} hours away, so it cannot be changed online. {callUs(view.clinicPhone)}</>
                  : view.rescheduleBlocked === 'past'
                  ? <>This appointment has already passed. {callUs(view.clinicPhone)}</>
                  : view.rescheduleBlocked === 'unpaid'
                  ? <>This booking is still waiting on its deposit. {callUs(view.clinicPhone)}</>
                  : <>Appointments cannot be changed online at the moment. {callUs(view.clinicPhone)}</>}
              </p>
              {view.rescheduleBlocked !== 'past' && cancelControl}
            </>
          )}
        </div>
      )}

      {view.clinicPhone && (
        <p className="text-center text-sm text-gray-600 pt-2">
          Questions? Call or text us on <strong className="text-plum-900">{view.clinicPhone}</strong>.
        </p>
      )}
    </div>
  )
}
