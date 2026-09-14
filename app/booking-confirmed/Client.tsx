'use client'
/**
 * Asks whether the deposit actually landed, rather than assuming it did.
 *
 * Stripe redirects the moment the card is accepted, but the booking is only
 * confirmed when the WEBHOOK arrives — that is what writes the calendar event
 * and sends the confirmation email. Those are seconds apart, usually, so a page
 * that simply declared success would be right most of the time and confidently
 * wrong the rest, which is the worst way to be wrong about someone's money.
 *
 * So it polls, briefly, and says which of the three things is true.
 */
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import BookingConfirmed from '@/components/BookingConfirmed'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

/** ~16 seconds. Long enough for a webhook having a slow moment, short enough
 *  that nobody sits watching a spinner wondering if their card was charged. */
const POLL_EVERY_MS = 2000
const MAX_POLLS = 8

type Status = 'checking' | 'confirmed' | 'pending' | 'cancelled' | 'unknown'

interface StatusResponse {
  status: 'confirmed' | 'pending' | 'cancelled' | 'unknown'
  date?: string
  start?: string
  consultMin?: number
  providerName?: string
}

export default function BookingConfirmedClient() {
  const params = useSearchParams()
  const sessionId = params.get('session_id') ?? ''
  const wasCancelled = params.get('cancelled') === '1'

  const [status, setStatus] = useState<Status>(sessionId ? 'checking' : 'unknown')
  const [details, setDetails] = useState<StatusResponse | null>(null)

  useEffect(() => {
    if (!sessionId || wasCancelled) return
    let live = true
    let tries = 0

    const ask = async () => {
      tries++
      try {
        const res = await fetch(`${API}/api/public/booking-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        const d = (await res.json()) as StatusResponse
        if (!live) return
        if (d.status === 'confirmed' || d.status === 'cancelled') {
          setDetails(d)
          setStatus(d.status)
          return
        }
        if (tries >= MAX_POLLS) {
          // Deliberately 'pending', not an error. The money is very likely
          // fine; what has not happened is our confirmation, and saying so
          // plainly beats a spinner or a false success.
          setStatus('pending')
          return
        }
        setTimeout(ask, POLL_EVERY_MS)
      } catch {
        if (!live) return
        if (tries >= MAX_POLLS) setStatus('pending')
        else setTimeout(ask, POLL_EVERY_MS)
      }
    }

    ask()
    return () => { live = false }
  }, [sessionId, wasCancelled])

  if (wasCancelled) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-plum-900"
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
          Payment not completed
        </h2>
        <p className="text-gray-700">
          Nothing has been charged and the time you picked has been released. You are welcome to
          book again whenever suits you.
        </p>
        <Link href="/bookings"
          className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-base font-semibold px-8 py-4 rounded-xl transition-colors">
          Back to booking
        </Link>
      </div>
    )
  }

  if (status === 'checking') {
    return (
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-plum-900"
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
          Confirming your booking…
        </h2>
        <p className="text-gray-700">Your payment went through. This takes a moment.</p>
      </div>
    )
  }

  if (status === 'confirmed') {
    return (
      <BookingConfirmed
        date={details?.date}
        start={details?.start}
        consultMin={details?.consultMin}
        providerName={details?.providerName}
      />
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-plum-900"
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
          This appointment was cancelled
        </h2>
        <p className="text-gray-700">
          If that was not you, or you would like to rebook, call or text us and we will sort it out.
        </p>
      </div>
    )
  }

  // 'pending' after polling out, or someone who arrived here without a session.
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-plum-900"
        style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
        {sessionId ? 'Almost there' : 'Your booking'}
      </h2>
      <p className="text-gray-700">
        {sessionId
          ? 'Your payment went through, and your confirmation email is on its way. If it has not arrived in a few minutes, call or text us and we will confirm it by hand — nothing is lost.'
          : 'If you have just booked, your confirmation email has the date, the time and a link to change or cancel.'}
      </p>
      <Link href="/bookings" className="inline-block text-brand-600 hover:text-brand-700 underline">
        Back to booking
      </Link>
    </div>
  )
}
