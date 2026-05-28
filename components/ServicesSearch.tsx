'use client'
import { useState, useMemo } from 'react'
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

const QUICK_TERMS = [
  'double chin', 'turkey neck', 'eye bags', 'acne', 'acne scars', 'rosacea',
  'sun spots', 'dark spots', 'large pores', 'saggy jawline',
  'mommy tummy', 'bat wings', 'saggy arms', 'stretch marks', 'bra fat',
  'postpartum hair loss', 'thinning hair', 'receding hairline', 'covid hair loss',
  'botox', 'lip filler', 'cheek filler', 'forehead lines', 'frown lines',
  'weight loss', 'fatigue', 'brain fog', 'joint pain', 'skin brightening', 'loose skin',
]

export default function ServicesSearch({ categories, membershipUrl }: {
  categories: ServiceCategory[]
  membershipUrl: string
}) {
  const [query, setQuery] = useState('')

  const flatServices = useMemo<FlatService[]>(() =>
    categories.flatMap(cat =>
      cat.services.map(s => ({ ...s, categoryName: cat.name, categoryDescription: cat.description }))
    ), [categories])

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

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return categories
    const hits = fuse.search(q).map(r => r.item)
    return categories
      .map(cat => ({ ...cat, services: hits.filter(s => s.categoryName === cat.name) }))
      .filter(cat => cat.services.length > 0)
  }, [query, categories, fuse])

  const totalResults = filtered.reduce((acc, cat) => acc + cat.services.length, 0)
  const isFiltering = query.trim().length > 0

  return (
    <>
      {/* Search bar */}
      <div className="max-w-2xl mx-auto px-6 pb-10">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Try: double chin, turkey neck, acne, postpartum hair loss…"
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
        {isFiltering && (
          <p className="mt-3 text-sm text-gray-500 text-center">
            {totalResults === 0
              ? 'No treatments found — try describing it differently'
              : `${totalResults} treatment${totalResults !== 1 ? 's' : ''} found`}
          </p>
        )}
        {!isFiltering && (
          <div className="mt-5">
            <p className="text-sm text-gray-400 text-center mb-3">
              Common concerns — or type anything you don&apos;t see here
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_TERMS.map(term => (
                <button key={term} onClick={() => setQuery(term)}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm rounded-full hover:border-brand-500 hover:text-brand-600 transition-colors cursor-pointer">
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {totalResults === 0 && isFiltering ? (
        <div className="max-w-6xl mx-auto px-6 pb-24 text-center py-16">
          <p className="text-gray-400 text-lg">No treatments match &ldquo;{query}&rdquo;</p>
          <button onClick={() => setQuery('')}
            className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
            Clear search
          </button>
        </div>
      ) : (
        <section className="max-w-6xl mx-auto px-6 pb-24 space-y-16">
          {filtered.map(category => (
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
              {!isFiltering && (
                <div className="mt-6 text-right">
                  <a href={membershipUrl}
                    className="text-sm text-brand-600 hover:text-brand-700 transition-colors">
                    Apply membership credits toward these services →
                  </a>
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </>
  )
}
