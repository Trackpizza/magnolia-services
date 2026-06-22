'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'

interface Service {
  name: string
  description: string
  href?: string
  keywords?: string[]
}

interface ServiceCategory {
  name: string
  description: string
  services: Service[]
}

interface FlatService extends Service {
  categoryName: string
  categoryDescription: string
}

interface Concern { label: string; match: string[] }
const CONCERN_GROUPS: { group: string; concerns: Concern[] }[] = [
  { group: 'Face & aging', concerns: [
    { label: 'Wrinkles', match: ['wrinkle'] },
    { label: 'Fine lines', match: ['fine line'] },
    { label: 'Jowls', match: ['jowl'] },
    { label: 'Sagging jawline', match: ['saggy jawline', 'jowl'] },
    { label: 'Double chin', match: ['double chin'] },
    { label: 'Turkey neck', match: ['turkey neck', 'neck laxity'] },
    { label: 'Smile lines', match: ['nasolabial', 'smile line'] },
    { label: 'Under-eye bags', match: ['eye bag', 'bags under eyes', 'under-eye', 'under eye'] },
    { label: 'Hooded eyes', match: ['hooded', 'droopy eyelid'] },
    { label: 'Loose / sagging skin', match: ['loose skin', 'skin laxity', 'sagging', 'crepey'] },
    { label: 'Skin tightening', match: ['skin tightening', 'tightening'] },
  ] },
  { group: 'Skin tone & texture', concerns: [
    { label: 'Acne', match: ['acne'] },
    { label: 'Acne scars', match: ['acne scar', 'pitted', 'breakout scar'] },
    { label: 'Large pores', match: ['pore'] },
    { label: 'Dark spots', match: ['dark spot', 'dark patch', 'hyperpigment', 'pigmentation', 'brown spot'] },
    { label: 'Melasma', match: ['melasma', 'pregnancy mask'] },
    { label: 'Sun damage', match: ['sun damage', 'sun spot', 'age spot', 'liver spot'] },
    { label: 'Rosacea / redness', match: ['rosacea', 'redness', 'red face', 'red cheek', 'flushing'] },
    { label: 'Dull skin', match: ['dull'] },
    { label: 'Uneven tone', match: ['uneven', 'skin tone'] },
    { label: 'Skin brightening', match: ['brighten', 'glow'] },
  ] },
  { group: 'Lips & volume', concerns: [
    { label: 'Thin lips', match: ['thin lip', 'lip volume', 'lip plump'] },
    { label: 'Lip enhancement', match: ['lip'] },
    { label: 'Volume loss / hollow cheeks', match: ['volume loss', 'cheek', 'hollow', 'sunken'] },
  ] },
  { group: 'Body', concerns: [
    { label: 'Stretch marks', match: ['stretch mark'] },
    { label: 'Saggy arms', match: ['saggy arm', 'bat wing'] },
    { label: 'Loose belly skin', match: ['loose belly', 'mommy tummy', 'postpartum belly', 'tummy'] },
    { label: 'Spider veins', match: ['spider vein', 'broken capillar'] },
  ] },
  { group: 'Hair', concerns: [
    { label: 'Thinning hair', match: ['thinning hair', 'hair thinning'] },
    { label: 'Hair loss', match: ['hair loss'] },
    { label: 'Receding hairline', match: ['receding'] },
    { label: 'Postpartum hair loss', match: ['postpartum hair'] },
    { label: 'Bald spots', match: ['bald'] },
  ] },
  { group: 'Wellness', concerns: [
    { label: 'Low energy / fatigue', match: ['fatigue', 'low energy', 'energy'] },
    { label: 'Brain fog', match: ['brain fog', 'mental fog'] },
    { label: 'Weight loss', match: ['weight', 'metabolism', 'semaglutide', 'fat burn'] },
    { label: 'Joint pain / recovery', match: ['joint', 'recovery', 'tissue', 'inflammation'] },
  ] },
]

export default function ServicesSearch({ categories, membershipUrl }: {
  categories: ServiceCategory[]
  membershipUrl: string
}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const flatServices = useMemo<FlatService[]>(() =>
    categories.flatMap(cat =>
      cat.services.map(s => ({ ...s, categoryName: cat.name, categoryDescription: cat.description }))
    ), [categories])

  const corpus = useMemo(() => {
    const map = new Map<string, string>()
    flatServices.forEach(s => map.set(s.name, (s.name + ' ' + (s.keywords ?? []).join(' ')).toLowerCase()))
    return map
  }, [flatServices])

  const fuse = useMemo(() => new Fuse(flatServices, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'categoryName', weight: 1.5 },
      { name: 'keywords', weight: 1.8 },
      { name: 'description', weight: 1 },
    ],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
  }), [flatServices])

  const concernByLabel = useMemo(() => {
    const m = new Map<string, Concern>()
    CONCERN_GROUPS.forEach(g => g.concerns.forEach(c => m.set(c.label, c)))
    return m
  }, [])

  const matchedConcerns = (s: FlatService): string[] => {
    const text = corpus.get(s.name) ?? ''
    return selected.filter(label => {
      const c = concernByLabel.get(label)
      return c ? c.match.some(t => text.includes(t.toLowerCase())) : false
    })
  }

  const toggle = (label: string) =>
    setSelected(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label])

  const isFiltering = query.trim().length > 0 || selected.length > 0

  const ranked = useMemo(() => {
    if (!isFiltering) return []
    const q = query.trim()
    const base = q ? fuse.search(q).map(r => r.item) : flatServices
    const withScore = base
      .map(s => ({ s, n: selected.length ? matchedConcerns(s).length : 1 }))
      .filter(x => x.n > 0)
    withScore.sort((a, b) => b.n - a.n || a.s.name.localeCompare(b.s.name))
    return withScore.map(x => x.s)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selected, fuse, flatServices, isFiltering])

  // When concerns change, bring the results into view (only scrolls if off-screen)
  useEffect(() => {
    if (selected.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selected])

  return (
    <>
      {/* Search bar */}
      <div className="max-w-2xl mx-auto px-6 pb-4">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search a concern, e.g. jowls, melasma, hair loss…"
            className="w-full pl-12 pr-10 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 text-base placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
          {query && (
            <button onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Selected concerns (removable) */}
        {selected.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {selected.map(label => (
              <button key={label} onClick={() => toggle(label)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                {label}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            ))}
            <button onClick={() => setSelected([])} className="text-sm font-medium text-gray-500 hover:text-gray-700 px-2 transition-colors">Clear all</button>
          </div>
        )}

        {/* Picker toggle */}
        <div className="mt-4 flex justify-center">
          <button onClick={() => setPickerOpen(o => !o)}
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
            {selected.length > 0 ? 'Add or edit concerns' : 'Not sure? Find your treatment by concern'}
            <svg className={`w-4 h-4 transition-transform ${pickerOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>

        {/* Concern picker (collapsed by default) */}
        {pickerOpen && (
          <div className="mt-4 space-y-3">
            {CONCERN_GROUPS.map(g => (
              <div key={g.group} className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest w-full text-center sm:w-auto sm:text-left">{g.group}</span>
                {g.concerns.map(c => {
                  const on = selected.includes(c.label)
                  return (
                    <button key={c.label} onClick={() => toggle(c.label)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer ${
                        on ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-500 hover:text-brand-600'
                      }`}>
                      {c.label}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div ref={resultsRef} className="scroll-mt-4">
        {isFiltering ? (
          ranked.length === 0 ? (
            <div className="max-w-6xl mx-auto px-6 pb-24 text-center py-10">
              <p className="text-gray-400 mb-3">No treatments match — try fewer or different concerns</p>
              <button onClick={() => { setQuery(''); setSelected([]) }}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">Clear all</button>
            </div>
          ) : (
            <section className="max-w-6xl mx-auto px-6 pb-24">
              <p className="text-sm text-gray-500 text-center mb-6">
                {ranked.length} treatment{ranked.length !== 1 ? 's' : ''}{selected.length ? ' for your concerns' : ''}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ranked.map(service => {
                  const hits = selected.length ? matchedConcerns(service) : []
                  return (
                    <div key={service.name}
                      className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col">
                      <h4 className="font-semibold text-gray-900 mb-2 text-base leading-snug">{service.name}</h4>
                      {hits.length > 0 && (
                        <div className="mb-3">
                          {selected.length > 1 && (
                            <p className="text-xs font-semibold text-brand-700 mb-1.5 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                              Addresses {hits.length} of your {selected.length} concerns
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {hits.map(h => (
                              <span key={h} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-gray-600 text-base leading-relaxed flex-1">{service.description}</p>
                      {service.href && (
                        <Link href={service.href}
                          className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                          Learn more →
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        ) : (
          <section className="max-w-6xl mx-auto px-6 pb-24 space-y-16 pt-4">
            {categories.map(category => (
              <div key={category.name}>
                <div className="mb-8 pb-4 border-b border-gray-200">
                  <h3 className="text-3xl font-semibold text-plum-900 mb-1"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-base">{category.description}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.services.map(service => (
                    <div key={service.name}
                      className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col">
                      <h4 className="font-semibold text-gray-900 mb-2 text-base leading-snug">{service.name}</h4>
                      <p className="text-gray-600 text-base leading-relaxed flex-1">{service.description}</p>
                      {service.href && (
                        <Link href={service.href}
                          className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                          Learn more →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-right">
                  <a href={membershipUrl}
                    className="text-sm text-brand-600 hover:text-brand-700 transition-colors">
                    Apply membership credits toward these services →
                  </a>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  )
}
