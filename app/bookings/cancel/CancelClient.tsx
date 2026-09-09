'use client'
/**
 * Cancel an appointment from the link in a confirmation or reminder email.
 *
 * Talks directly to the records app from the browser, like the booking widget
 * and for the same reason. It shows the date and time only -- the API returns
 * nothing else, deliberately.
 */
import { useEffect, useState } from 'react'

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

interface Appt { date: string; start: string; end: string }
type State = 'loading' | 'found' | 'gone' | 'cancelled' | 'already' | 'error'

export default function CancelClient({ token }: { token: string }) {
  const [state, setState] = useState<State>('loading')
  const [appt, setAppt] = useState<Appt | null>(null)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    if (!token) { setState('gone'); return }
    let live = true
    // No `confirm`, so this only looks it up. Nobody should cancel simply by
    // opening a link -- a mail client that prefetches would do it for them.
    fetch(`${API}/api/public/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async r => ({ ok: r.ok, d: await r.json() }))
      .then(({ ok, d }) => {
        if (!live) return
        if (!ok) { setState('gone'); return }
        setAppt({ date: d.date, start: d.start, end: d.end })
        setState(d.alreadyCancelled ? 'already' : 'found')
      })
      .catch(() => { if (live) setState('error') })
    return () => { live = false }
  }, [token])

  const cancel = async () => {
    setWorking(true)
    try {
      const res = await fetch(`${API}/api/public/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, confirm: true }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error('failed')
      setAppt({ date: d.date, start: d.start, end: d.end })
      setState('cancelled')
    } catch {
      setState('error')
    } finally {
      setWorking(false)
    }
  }

  const heading = { fontFamily: 'var(--font-cormorant), Georgia, serif' }
  const card = 'bg-white rounded-2xl border border-gray-100 p-8 text-center'

  if (state === 'loading') {
    return <div className={card}><p className="text-gray-600">Loading your appointment&hellip;</p></div>
  }

  if (state === 'gone') {
    return (
      <div className={card}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-3" style={heading}>Link not found</h1>
        <p className="text-gray-700">
          This cancellation link is not valid any more. If you still need to change an
          appointment, please call or text us and we will sort it out.
        </p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className={card}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-3" style={heading}>Something went wrong</h1>
        <p className="text-gray-700">
          We could not reach our booking system. Please call or text us so we can cancel it for you.
        </p>
      </div>
    )
  }

  if (state === 'cancelled' || state === 'already') {
    return (
      <div className={card}>
        <h1 className="text-2xl font-semibold text-plum-900 mb-3" style={heading}>
          {state === 'already' ? 'Already cancelled' : 'Appointment cancelled'}
        </h1>
        {appt && (
          <p className="text-gray-700 mb-2">{longDate(appt.date)} at {to12h(appt.start)}</p>
        )}
        <p className="text-sm text-gray-600">
          Nothing further to do. If you would like to rebook, you can do that any time.
        </p>
        <a href="/bookings"
          className="inline-block mt-6 bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors">
          Book another appointment
        </a>
      </div>
    )
  }

  return (
    <div className={card}>
      <h1 className="text-2xl font-semibold text-plum-900 mb-3" style={heading}>Cancel this appointment?</h1>
      {appt && (
        <p className="text-gray-700 mb-6">
          {longDate(appt.date)} at {to12h(appt.start)}
        </p>
      )}
      <button onClick={cancel} disabled={working}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors disabled:opacity-50">
        {working ? 'Cancelling\u2026' : 'Yes, cancel it'}
      </button>
      <a href="/bookings" className="block mt-4 text-sm text-brand-600 hover:text-brand-700">
        No, keep my appointment
      </a>
    </div>
  )
}
