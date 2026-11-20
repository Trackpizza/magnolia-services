'use client'
/**
 * One package on /packages (11-19, Eric) — the same pieces as the client
 * portal's "Our packages" (app/my/OurPackages.tsx): name, what it includes,
 * price, the short description, and **Learn more** (the YouTube video + the
 * deep dive), opened and closed here.
 *
 * No Stripe for now (Eric 11-19): **Text Eileen to start** — Messages opens
 * with the package named — and the client pays at their first visit.
 */
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import YouTubeEmbed from '@/components/YouTubeEmbed'

export type WebsitePackage = {
  id: string
  name: string
  summary: string
  details: string
  youtubeUrl: string
  total: number
  unit: string
  priceCents: number | null
  special: boolean
  showUntil: string
}

const money = (c: number) => `$${(c / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
/** "treatments" → "treatment" for "$300 a treatment". */
const one = (unit: string) => (unit.endsWith('s') && unit.length > 1 ? unit.slice(0, -1) : unit)
const untilDay = (ymd: string) =>
  ymd ? new Date(`${ymd}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : ''

export default function PackageCard({ p, phone }: { p: WebsitePackage; phone: string }) {
  const [open, setOpen] = useState(false)
  const serif = { fontFamily: 'var(--font-cormorant), Georgia, serif' }
  const digits = phone.replace(/\D/g, '').slice(-10)
  const price = p.priceCents === null ? '' : money(p.priceCents)
  const perEach =
    p.priceCents !== null && p.total > 1 ? `${money(Math.round(p.priceCents / p.total))} a ${one(p.unit)}` : ''
  const body = `Hi Eileen! I'd like to start the ${p.name} package${price ? ` (${price})` : ''}.`
  const sms = digits.length === 10 ? `sms:+1${digits}?&body=${encodeURIComponent(body)}` : ''
  const ask = digits.length === 10 ? `sms:+1${digits}?&body=${encodeURIComponent(`Hi Eileen, I have a question about the ${p.name} package.`)}` : ''

  return (
    <li className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-sm ${p.special ? 'border-brand-400' : 'border-brand-200'}`}>
      {p.special && (
        <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          ★ Holiday special{p.showUntil ? ` · until ${untilDay(p.showUntil)}` : ''}
        </p>
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-2xl sm:text-3xl font-semibold text-plum-900" style={serif}>
          {p.name}
        </h2>
        <p className="text-2xl font-semibold text-plum-900">{price || 'Ask us'}</p>
      </div>
      <p className="mt-1 text-sm text-gray-700">
        {p.total} {p.total === 1 ? one(p.unit) : p.unit}
        {perEach && <span className="text-gray-500"> · {perEach}</span>}
      </p>
      {!p.special && p.showUntil && <p className="mt-1 text-xs text-gray-500">Offered until {untilDay(p.showUntil)}</p>}
      {p.summary && <p className="mt-3 text-gray-700">{p.summary}</p>}

      {(p.details || p.youtubeUrl) && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          {open ? 'Show less ▴' : `Learn more${p.youtubeUrl ? ' · ▶ video' : ''} ▾`}
        </button>
      )}
      {open && (
        <div className="mt-4 space-y-4">
          {p.youtubeUrl && <YouTubeEmbed url={p.youtubeUrl} title={p.name} />}
          {p.details && (
            <div className="space-y-2 text-sm leading-relaxed text-gray-800 [&_h3]:font-semibold [&_h3]:text-gray-900 [&_li]:ml-5 [&_ul]:list-disc [&_ol]:list-decimal [&_a]:font-semibold [&_a]:text-brand-600 [&_a]:underline">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{p.details}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 space-y-2">
        {sms && (
          <a
            href={sms}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-base font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            💬 Text Eileen to start
          </a>
        )}
        <p className="text-center text-xs text-gray-600">Nothing to pay online — you pay at your first visit.</p>
        {digits.length === 10 && (
          <p className="text-center text-sm">
            <a href={ask} className="font-medium text-brand-700 underline underline-offset-2">Ask a question</a>
            <span className="text-gray-400"> · </span>
            <a href={`tel:+1${digits}`} className="font-medium text-brand-700 underline underline-offset-2">
              📞 ({digits.slice(0, 3)}) {digits.slice(3, 6)}-{digits.slice(6)}
            </a>
          </p>
        )}
      </div>
    </li>
  )
}
