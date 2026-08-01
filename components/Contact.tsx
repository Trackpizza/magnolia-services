// Shared call/text contact links. The phone comes from admin config
// (mainFooter.phone) so it stays editable. tel:/sms: use E.164 (+1…) so the
// text link fires reliably on both iOS and Android.

type Variant = 'light' | 'dark'

function e164(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('1')) return `+${d}`
  if (d.length === 10) return `+1${d}`
  return `+${d}`
}
const telHref = (p: string) => `tel:${e164(p)}`
const smsHref = (p: string) => `sms:${e164(p)}`

const PhoneIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)
const ChatIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.83L3 20l1.05-3.15A7.6 7.6 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

// Secondary green "pill" — clearly clickable, but subordinate to the solid-green
// "Book a Video Call" primary button.
function pillClass(variant: Variant): string {
  const base = 'inline-flex items-center gap-2 rounded-full text-sm font-semibold px-5 py-2.5 border transition-colors'
  return variant === 'dark'
    ? `${base} border-brand-400/70 text-brand-100 hover:bg-brand-400/15`
    : `${base} border-brand-400 text-brand-700 bg-white hover:bg-brand-50 hover:border-brand-500`
}

/** Compact secondary "Text Us" pill for page headers (always on a plum bar → dark variant by default). */
export function TextUsButton({ phone, variant = 'dark', className = '' }: { phone: string; variant?: Variant; className?: string }) {
  if (!phone) return null
  const base = 'inline-flex items-center gap-1.5 rounded-full text-sm font-medium px-4 py-2 border transition-colors'
  const cls = variant === 'dark'
    ? `${base} border-brand-400/70 text-brand-100 hover:bg-brand-400/15`
    : `${base} border-brand-400 text-brand-700 hover:bg-brand-50`
  return (
    <a href={smsHref(phone)} className={`${cls} ${className}`}>
      <ChatIcon className="w-4 h-4 shrink-0" />
      Text Us
    </a>
  )
}

/**
 * "Prefer to call or text?" block placed under a booking CTA: the real phone
 * number shown as text (so it's readable on desktop, where tel:/sms: links
 * often do nothing) plus tappable Call Us / Text Us pills for phones.
 */
export function CallTextPills({
  phone, variant = 'light', className = '',
}: { phone: string; variant?: Variant; className?: string }) {
  if (!phone) return null
  const leadColor = variant === 'dark' ? 'text-white/70' : 'text-gray-600'
  const numColor = variant === 'dark' ? 'text-white' : 'text-plum-900'
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <p className={`text-sm ${leadColor}`}>
        Prefer to call or text?{' '}
        <a href={telHref(phone)} className={`font-semibold ${numColor} hover:underline`}>{phone}</a>
      </p>
      <div className="flex items-center gap-3">
        <a href={telHref(phone)} className={pillClass(variant)}>
          <PhoneIcon className="w-4 h-4 shrink-0" /> Call Us
        </a>
        <a href={smsHref(phone)} className={pillClass(variant)}>
          <ChatIcon className="w-4 h-4 shrink-0" /> Text Us
        </a>
      </div>
    </div>
  )
}
