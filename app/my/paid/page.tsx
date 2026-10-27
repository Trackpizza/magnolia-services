import type { Metadata } from 'next'
import PaidReturn from './PaidReturn'

/**
 * Where Stripe Checkout sends a client back to (records lib/packagePay.ts,
 * 10-26). The URL carries no portal token — this page sends them on to the
 * page they paid from, which the browser remembered (app/my/pay.ts).
 */
export const metadata: Metadata = {
  title: 'Payment | Magnolia Skin Center',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default function PaidPage() {
  return (
    <div className="portal-dark min-h-screen">
      <PaidReturn />
    </div>
  )
}
