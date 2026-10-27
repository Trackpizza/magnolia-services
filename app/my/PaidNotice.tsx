'use client'
import { useEffect, useState } from 'react'

/** Back from Stripe (10-26): ?paid=1 or ?pay=cancelled — said once, then the
 *  parameter is taken off the address so a refresh does not repeat it. Says
 *  nothing about the package itself: the webhook records it, sometimes a few
 *  seconds after they land here. */
export default function PaidNotice() {
  const [state, setState] = useState<'' | 'paid' | 'cancelled'>('')
  useEffect(() => {
    const u = new URL(window.location.href)
    const s = u.searchParams.get('paid') === '1' ? 'paid' : u.searchParams.get('pay') === 'cancelled' ? 'cancelled' : ''
    if (!s) return
    setState(s)
    u.searchParams.delete('paid')
    u.searchParams.delete('pay')
    window.history.replaceState(null, '', u.toString())
  }, [])
  if (!state) return null
  return state === 'paid' ? (
    <p className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-900">
      ✓ Thank you — your payment went through. A receipt is on its way by email, and Eileen will confirm your package.
    </p>
  ) : (
    <p className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-gray-700">No payment was taken. You can try again any time.</p>
  )
}
