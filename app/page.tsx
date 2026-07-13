import { getLinks } from '@/lib/links'
import { SERVICE_CATEGORIES, SERVICES } from '@/config/services'
import ServicesSearch from '@/components/ServicesSearch'
import { localBusinessLd } from '@/lib/schema'

// Cached/ISR: served instantly from the CDN (no cold-start wait). Regenerates in the
// background at most once per minute, and immediately when the admin saves (revalidate hook).
export const revalidate = 60

export default async function ServicesPage() {
  const links = await getLinks()

  const builtCategories = SERVICE_CATEGORIES.map(cat => ({
    name: cat.name,
    description: cat.description,
    services: cat.ids.map(id => {
      const s = SERVICES.find(sv => sv.id === id)
      if (!s) return null
      return { name: s.name, description: s.searchDescription, href: `/services/${s.slug}`, keywords: [...s.keywords, ...(s.alsoKnownAs ?? []), ...s.treats] }
    }).filter((x): x is NonNullable<typeof x> => x !== null),
  }))

  const { mainFooter: f } = links

  const businessLd = localBusinessLd({
    telephone: f.phone,
    sameAs: f.customLinks.map(l => l.url),
    hours: links.hours,
  })

  return (
    <div className="min-h-screen bg-cream-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessLd) }}
      />

      {/* Preload the hero wordmark (it's the first thing painted) so it doesn't wait on discovery. */}
      <link rel="preload" as="image" href="/wordmark-plum.webp" />

      {/* Header — brand mark lives in the hero below, so this bar is just the booking CTA. */}
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-end">
          <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer"
            className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors">
            Book Now
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-center sm:text-left">
          <img
            src="/wordmark-plum.webp"
            alt="Magnolia Skin Center"
            width={600}
            height={222}
            fetchPriority="high"
            className="w-56 sm:w-72 h-auto shrink-0"
          />
          <div className="sm:border-l sm:border-plum-900/15 sm:pl-10 max-w-xl">
            <h1 className="text-5xl font-semibold text-plum-900 mb-3"
              style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
              Our Services
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              Browse all treatments, search by concern, or tap any service to watch Dr. David and Nurse Eileen explain it in detail.
            </p>
          </div>
        </div>
      </section>

      {/* Search + Results */}
      <ServicesSearch categories={builtCategories} bookingUrl={f.bookingUrl} />

      {/* CTA */}
      <section className="bg-plum-900 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-white mb-3"
            style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            Ready to invest in yourself?
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Book a complimentary 15-minute video consultation and we&apos;ll help you find the treatment that&apos;s right for you.
          </p>
          <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-8 py-3.5 rounded-xl transition-colors">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            Book a Complimentary 15 Minute Video Call
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-plum-900 border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            {f.address && <p className="text-white/50 text-sm">{f.address}</p>}
            {f.phone && (
              <a href={`tel:${f.phone.replace(/\D/g,'')}`}
                className="block text-white/50 hover:text-white/70 text-sm transition-colors">{f.phone}</a>
            )}
            {f.email && (
              <a href={`mailto:${f.email}`}
                className="block text-white/50 hover:text-white/70 text-sm transition-colors">{f.email}</a>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
            {f.customLinks.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors">{link.label || link.url}</a>
            ))}
            {f.websiteUrl && (
              <a href={f.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors">magnoliaskincenter.com</a>
            )}
          </div>
        </div>
      </footer>

    </div>
  )
}
