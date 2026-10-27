'use client'
import { useEffect, useState } from 'react'
import { PAY_RETURN_KEY } from '../pay'

/** Back from Stripe: on to their own page with ?paid=1 (or ?pay=cancelled).
 *  This page never marks anything paid — the webhook does. */
export default function PaidReturn() {
  const [lost, setLost] = useState(false)
  const [ok, setOk] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paid = params.get('ok') === '1'
    setOk(paid)
    let back = ''
    try {
      back = localStorage.getItem(PAY_RETURN_KEY) ?? ''
      localStorage.removeItem(PAY_RETURN_KEY)
    } catch {
      back = ''
    }
    // Only ever our own portal page.
    let target: URL | null = null
    try {
      const u = new URL(back)
      if (u.origin === window.location.origin && u.pathname === '/my') target = u
    } catch {
      target = null
    }
    if (!target) {
      setLost(true)
      return
    }
    target.searchParams.delete('paid')
    target.searchParams.delete('pay')
    target.searchParams.set(paid ? 'paid' : 'pay', paid ? '1' : 'cancelled')
    window.location.replace(target.toString())
  }, [])

  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      {!lost ? (
        <p className="text-gray-700">One moment…</p>
      ) : ok ? (
        <div className="space-y-3">
          <p className="text-xl font-semibold text-gray-900">Thank you — your payment went through.</p>
          <p className="text-gray-700">Eileen will confirm your package. Open your page from your link to see it.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xl font-semibold text-gray-900">No payment was taken.</p>
          <p className="text-gray-700">Open your page from your link to try again.</p>
        </div>
      )}
    </main>
  )
}
