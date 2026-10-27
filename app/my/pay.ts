/**
 * Paying for a package on the portal (records lib/packagePay.ts, 10-26) —
 * test charts only. Asks the records app for a Stripe Checkout page and goes
 * there. The way back is remembered HERE, in this browser, because the
 * return URL Stripe holds carries no portal token: /my/paid reads this key
 * and sends them back to their own page.
 */
const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''
export const PAY_RETURN_KEY = 'msc_pay_return'

/** Goes to Stripe, or resolves with a message to show. */
export async function startPayment(token: string, session: string, body: { action: 'pay'; id: string } | { action: 'buy'; catalogId: string }): Promise<string> {
  try {
    const res = await fetch(`${API}/api/public/portal-pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, session, ...body }),
      cache: 'no-store',
    })
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
    if (!res.ok || !data.url) {
      if (data.error === 'not_due') return 'This one is already paid — refresh the page.'
      if (data.error === 'rate_limited') return 'Too many tries for one hour — try again a little later.'
      return 'Online payment is not available right now. Please call or text us.'
    }
    try {
      localStorage.setItem(PAY_RETURN_KEY, window.location.href)
    } catch {
      // Private window: /my/paid then just says thank you.
    }
    window.location.href = data.url
    return ''
  } catch (e) {
    console.warn('portal: payment start failed:', e)
    return 'It did not go through. Check your connection and try again.'
  }
}

export const money = (c: number | null | undefined) =>
  typeof c === 'number' ? `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: c % 100 ? 2 : 0, maximumFractionDigits: 2 })}` : ''
