'use client'
/**
 * Our packages (10-17, Eileen) — the clinic's packages, from the records app's
 * Packages tab (lib/packageCatalog.ts). On every client
 * portal since 10-18 (test charts only before that).
 *
 * Each package: what it includes and the price ("Ask us" when there is none),
 * **Learn more** — the deep dive and a YouTube video — and **Ask Eileen**:
 * Text / Call the clinic. Nothing is bought here; Eileen sets it up.
 */
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import Section from './Section'
import { SiteLink } from './SiteViewer'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import { startPayment } from './pay'

export type OurPackage = {
  id: string
  name: string
  summary: string
  details: string
  youtubeUrl: string
  total: number
  unit: string
  priceCents: number | null
}

const money = (c: number | null) =>
  c === null ? 'Ask us' : `$${(c / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
const pill =
  'inline-flex items-center gap-1.5 rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors'

/** Buy online (10-26) — test charts only; null hides it. */
type Buy = { token: string; session: string } | null

function Package({ p, phone, buy }: { p: OurPackage; phone: string; buy: Buy }) {
  const [open, setOpen] = useState(false)
  const [buying, setBuying] = useState(false)
  const [buyError, setBuyError] = useState('')
  const canBuy = !!buy && typeof p.priceCents === 'number' && p.priceCents >= 50
  const onBuy = async () => {
    if (!buy) return
    setBuying(true)
    setBuyError('')
    const msg = await startPayment(buy.token, buy.session, { action: 'buy', catalogId: p.id })
    if (msg) {
      setBuyError(msg)
      setBuying(false)
    }
  }
  const digits = phone.replace(/\D/g, '').slice(-10)
  const ask = encodeURIComponent(`Hi Eileen, I'd like to hear more about the ${p.name}.`)
  return (
    <li className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
      <div>
        <p className="text-base font-semibold text-gray-900">{p.name}</p>
        <p className="text-sm text-gray-700">
          {p.total} {p.unit} · <strong>{money(p.priceCents)}</strong>
        </p>
        {p.summary && <p className="mt-1 text-sm text-gray-600">{p.summary}</p>}
      </div>
      {(p.details || p.youtubeUrl) && (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          {open ? 'Show less' : 'Learn more'}
        </button>
      )}
      {open && (
        <div className="space-y-4">
          {p.youtubeUrl && <YouTubeEmbed url={p.youtubeUrl} title={p.name} />}
          {p.details && (
            <div className="space-y-2 text-sm leading-relaxed text-gray-800 [&_h3]:font-semibold [&_h3]:text-gray-900 [&_li]:ml-5 [&_ul]:list-disc [&_ol]:list-decimal [&_a]:font-semibold [&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-700">
              {/* Links (10-17, Eric): coloured + underlined so they read as
                  links; our own pages open in the portal's viewer (SiteViewer),
                  other sites in a new tab. */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{ a: ({ href, children }) => <SiteLink href={href ?? ''}>{children}</SiteLink> }}
              >
                {p.details}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
      {canBuy && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onBuy}
            disabled={buying}
            className="w-full rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {buying ? 'Opening the secure payment page…' : `Buy — ${money(p.priceCents)}`}
          </button>
          <p className="text-xs text-gray-600">
            Secure card payment by Stripe. Eileen confirms your package before your first visit with it.
          </p>
          {buyError && <p className="text-sm text-red-700">{buyError}</p>}
        </div>
      )}
      {digits.length === 10 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-700">Ask Eileen:</span>
          <a href={`sms:+1${digits}?&body=${ask}`} className={pill}>💬 Text</a>
          <a href={`tel:+1${digits}`} className={pill}>📞 Call</a>
          {/* The number itself (10-17, Eric): on a laptop Text/Call may do
              nothing, so they can dial it from their phone. */}
          <a href={`tel:+1${digits}`} className="basis-full text-sm font-semibold text-gray-800 tabular-nums hover:underline">
            ({digits.slice(0, 3)}) {digits.slice(3, 6)}-{digits.slice(6)}
          </a>
        </div>
      )}
    </li>
  )
}

export default function OurPackages({ packages, phone, buy = null }: { packages: OurPackage[]; phone: string; buy?: Buy }) {
  return (
    <Section title="Our packages" badge={`${packages.length}`}>
      <p className="mb-4 text-sm text-gray-600">
        Treatment packages at Magnolia Skin Center.{' '}
        {buy ? 'Buy one here, or ask Eileen — she’ll set it up with you.' : 'Interested? Ask Eileen — she’ll set it up with you.'}
      </p>
      <ul className="space-y-3">
        {packages.map((p) => <Package key={p.id} p={p} phone={phone} buy={buy} />)}
      </ul>
    </Section>
  )
}
