'use client'

/**
 * /admin → "Build Your Journey — Agnes RF Targeted pricing" (11-07): the price
 * (blank = "priced at consultation") and the short description of every area
 * and package on /build-your-journey, plus the 2–3 session package discount.
 * Defaults live in config/targetedAreas.ts.
 */
import { resolveTargeted, type TargetedPricing } from '@/config/targetedAreas'

export default function TargetedPricingEditor({
  value,
  onChange,
}: {
  value: TargetedPricing
  onChange: (v: TargetedPricing) => void
}) {
  const r = resolveTargeted(value)
  const rows = [
    ...r.areas.map((a) => ({ id: a.id, name: a.name, price: a.price, blurb: a.blurb, group: a.view === 'face' ? 'Face' : a.view === 'body' ? 'Body' : 'Also treated' })),
    ...r.packages.map((p) => ({ id: p.id, name: p.name, price: p.price, blurb: p.blurb, group: 'Packages' })),
  ]
  const setPrice = (id: string, raw: string) => {
    const t = raw.replace(/[$,\s]/g, '')
    const n = t === '' ? null : Number(t)
    if (n !== null && !Number.isFinite(n)) return
    onChange({ ...value, prices: { ...(value.prices ?? {}), [id]: n } })
  }
  const setBlurb = (id: string, b: string) => onChange({ ...value, blurbs: { ...(value.blurbs ?? {}), [id]: b } })
  const groups = ['Face', 'Body', 'Also treated', 'Packages']
  return (
    <div className="space-y-5">
      <label className="flex items-center gap-2 text-sm text-gray-700">
        2–3 session package discount
        <input
          type="number"
          min={0}
          max={50}
          value={r.discountPct}
          onChange={(e) => onChange({ ...value, packageDiscountPct: Number(e.target.value) })}
          className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm"
        />
        %
      </label>
      {groups.map((g) => (
        <div key={g}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{g}</p>
          <div className="space-y-3">
            {rows
              .filter((x) => x.group === g)
              .map((x) => (
                <div key={x.id} className="rounded-xl border border-gray-200 p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex-1 min-w-[12rem] text-sm font-medium text-gray-900">{x.name}</span>
                    <label className="flex items-center gap-1 text-sm text-gray-600">
                      $
                      <input
                        inputMode="numeric"
                        value={x.price ?? ''}
                        onChange={(e) => setPrice(x.id, e.target.value)}
                        placeholder="at consult"
                        className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      />
                    </label>
                  </div>
                  <textarea
                    value={x.blurb}
                    onChange={(e) => setBlurb(x.id, e.target.value)}
                    rows={2}
                    className="mt-2 w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-800"
                  />
                </div>
              ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-500">Blank price = “Priced at your consultation”. Blank description = the built-in one.</p>
    </div>
  )
}
