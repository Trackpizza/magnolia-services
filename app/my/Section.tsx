import type { ReactNode } from 'react'

const heading = { fontFamily: 'var(--font-cormorant), Georgia, serif' }

/**
 * One section of the portal or the shared journey page, closed until tapped
 * (2026-09-28, Eric: "all collapsible, hidden on startup" — then the share
 * page "too"). The page opens as a short list of headings; a badge on the
 * heading says when something is waiting. A native <details>, so it works
 * without JavaScript and with a keyboard.
 */
export default function Section({ title, badge, urgent, children }: {
  title: string
  badge?: string
  urgent?: boolean
  children: ReactNode
}) {
  return (
    <details className="group bg-white rounded-2xl border border-gray-100">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5 sm:px-8 [&::-webkit-details-marker]:hidden">
        <h2 className="text-lg font-semibold text-plum-900" style={heading}>{title}</h2>
        <span className="flex shrink-0 items-center gap-2">
          {badge && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                urgent ? 'bg-brand-600 text-white' : 'border border-gray-200 text-gray-600'
              }`}
            >
              {badge}
            </span>
          )}
          <svg className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </summary>
      <div className="px-6 pb-6 sm:px-8 sm:pb-8">{children}</div>
    </details>
  )
}
