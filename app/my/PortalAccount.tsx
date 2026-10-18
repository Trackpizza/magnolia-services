'use client'
/**
 * Packages, deposits & quotes (10-13) — what the clinic SENT to this client's
 * portal from the chart's "Deposits, Quotes & Packages" card (records app,
 * lib/money.ts). Shown as it is now: a visit used at the clinic changes the
 * count here too. Never the staff note, never staff names — only the "Note
 * for the client". Opening the section tells the clinic it was viewed.
 */
import { useState } from 'react'
import Section from './Section'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''

export type AccountItem = {
  id: string
  kind: 'package' | 'deposit' | 'quote' | 'note'
  title: string
  amountCents: number | null
  clientNote: string
  goodUntil: string
  addedOn: string
  total: number
  left: number
  unit: string
  lines: { on: string; delta: number }[]
  method: string
  status: string
}

const money = (c: number | null) =>
  c === null ? '' : `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: c % 100 ? 2 : 0, maximumFractionDigits: 2 })}`
const day = (d: string) =>
  d ? new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
const unitWord = (unit: string, n: number) => (n === 1 && unit.endsWith('s') ? unit.slice(0, -1) : unit)

function Dots({ total, left }: { total: number; left: number }) {
  if (total > 30) {
    return (
      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-300" aria-hidden>
        <div className="h-full bg-brand-600" style={{ width: `${Math.max(0, Math.min(100, (left / total) * 100))}%` }} />
      </div>
    )
  }
  return (
    <div className="flex flex-wrap gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-4 w-4 rounded-full border ${i < left ? 'border-brand-600 bg-brand-600' : 'border-gray-300 bg-white'}`} />
      ))}
    </div>
  )
}

function Note({ text }: { text: string }) {
  if (!text) return null
  return <p className="mt-2 whitespace-pre-wrap rounded-xl bg-brand-50 px-4 py-3 text-sm text-gray-800">{text}</p>
}

export default function PortalAccount({ items, token, session }: { items: AccountItem[]; token: string; session: string }) {
  const [told, setTold] = useState(false)
  const onOpen = () => {
    if (told) return
    setTold(true)
    fetch(`${API}/api/public/portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, session, action: 'account-viewed', items: items.map((i) => i.id) }),
      cache: 'no-store',
    }).catch(() => undefined)
  }

  const packages = items.filter((i) => i.kind === 'package')
  const deposits = items.filter((i) => i.kind === 'deposit')
  const quotes = items.filter((i) => i.kind === 'quote')
  const notes = items.filter((i) => i.kind === 'note')
  const card = 'rounded-2xl border border-gray-100 bg-gray-50 p-4'
  const label = 'mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500'

  return (
    <Section title="Your packages, deposits & quotes" badge={`${items.length}`} onOpen={onOpen}>
      <div className="space-y-6">
        {packages.length > 0 && (
          <div>
            <p className={label}>Packages</p>
            <ul className="space-y-3">
              {packages.map((p) => (
                <li key={p.id} className={card}>
                  <p className="font-semibold text-gray-900">{p.title}</p>
                  <p className="mt-1 text-gray-900">
                    <strong className="text-2xl tabular-nums">{p.left}</strong> of {p.total} {unitWord(p.unit, p.total)} left
                  </p>
                  <div className="mt-2"><Dots total={p.total} left={p.left} /></div>
                  <p className="mt-2 text-xs text-gray-600">
                    {[p.amountCents !== null ? `Paid ${money(p.amountCents)}` : '', `since ${day(p.addedOn)}`, p.goodUntil ? `good until ${day(p.goodUntil)}` : '']
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {p.lines.length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-xs text-gray-600">
                      {p.lines.map((l, i) => (
                        <li key={i}>
                          {day(l.on)} — {l.delta < 0 ? `used ${-l.delta}` : `added ${l.delta}`}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Note text={p.clientNote} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {deposits.length > 0 && (
          <div>
            <p className={label}>Deposits</p>
            <ul className="space-y-3">
              {deposits.map((d) => (
                <li key={d.id} className={card}>
                  <p className="text-gray-900">
                    <strong className="tabular-nums">{money(d.amountCents)}</strong> deposit for <strong>{d.title}</strong>
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    {[d.status, d.method ? `paid by ${d.method}` : '', day(d.addedOn)].filter(Boolean).join(' · ')}
                  </p>
                  <Note text={d.clientNote} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {quotes.length > 0 && (
          <div>
            <p className={label}>Quotes</p>
            <ul className="space-y-3">
              {quotes.map((q) => (
                <li key={q.id} className={card}>
                  <p className="text-gray-900">
                    <strong>{q.title}</strong>
                    {q.amountCents !== null && <> — <strong className="tabular-nums">{money(q.amountCents)}</strong></>}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    {[q.status, `quoted ${day(q.addedOn)}`, q.goodUntil ? `good until ${day(q.goodUntil)}` : ''].filter(Boolean).join(' · ')}
                  </p>
                  <Note text={q.clientNote} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {notes.length > 0 && (
          <div>
            <p className={label}>Notes from us</p>
            <ul className="space-y-3">
              {notes.map((n) => (
                <li key={n.id} className="whitespace-pre-wrap rounded-2xl bg-brand-50 px-4 py-3 text-sm text-gray-800">
                  {n.clientNote}
                  <span className="mt-1 block text-xs text-gray-500">{day(n.addedOn)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-gray-500">Questions about any of this? Just ask us at your next visit, or text us.</p>
      </div>
    </Section>
  )
}
