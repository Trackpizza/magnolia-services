import { getLinks } from '@/lib/links'
import { SERVICE_CATEGORIES, SERVICES } from '@/config/services'
import ServicesSearch from '@/components/ServicesSearch'

export const revalidate = 3600

export default async function ServicesPage() {
  const links = await getLinks()

  const builtCategories = SERVICE_CATEGORIES.map(cat => ({
    name: cat.name,
    description: cat.description,
    services: cat.slugs.map(slug => {
      const s = SERVICES.find(sv => sv.slug === slug)
      if (!s) return null
      return { name: s.name, description: s.searchDescription, href: `/services/${s.slug}`, keywords: [...s.keywords, ...(s.alsoKnownAs ?? [])] }
    }).filter((x): x is NonNullable<typeof x> => x !== null),
  }))

  const { mainFooter: f } = links

  return (
    <div className="min-h-screen bg-cream-100">

      {/* Header */}
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href={f.websiteUrl || 'https://www.magnoliaskincenter.com'}>
            <img src="/logo.avif" alt="Magnolia Skin Center" className="h-10 w-auto" />
          </a>
          <div className="flex items-center gap-3">
            <a href={f.membershipUrl} className="text-sm text-white/70 hover:text-white font-medium transition-colors">
              Memberships
            </a>
            <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer"
              className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors">
              Book Now
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-3">Magnolia Skin Center</p>
        <h1 className="text-5xl font-semibold text-plum-900 mb-4"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Our Services
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          Browse all treatments, search by concern, or tap a service to learn more and watch it in action.
        </p>
      </section>

      {/* Search + Results */}
      <ServicesSearch categories={builtCategories} membershipUrl={f.membershipUrl} />

      {/* CTA */}
      <section className="bg-plum-900 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-white mb-3"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Ready to invest in yourself?
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Join a membership and earn monthly credits you can apply toward any service on this menu.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <a href={f.membershipUrl}
              className="bg-white text-plum-900 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-cream-100 transition-colors">
              View Memberships
            </a>
            <a href={`${f.membershipUrl}/signup`}
              className="bg-brand-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors">
              Join Now
            </a>
          </div>
          <div className="border border-white/15 rounded-2xl px-8 py-6 max-w-lg mx-auto flex flex-col items-center gap-4 text-center">
            <div>
              <p className="text-white text-sm font-semibold leading-snug">Not sure which plan is right for you?</p>
              <p className="text-white/50 text-xs mt-0.5">Book a complimentary 15-minute video call with our team.</p>
            </div>
            <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              Book a Complimentary 15 Minute Video Call
            </a>
          </div>
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
            {f.instagramUrl && (
              <a href={f.instagramUrl} target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors">Instagram</a>
            )}
            {f.facebookUrl && (
              <a href={f.facebookUrl} target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors">Facebook</a>
            )}
            {f.websiteUrl && (
              <a href={f.websiteUrl} target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors">magnoliaskincenter.com</a>
            )}
            <a href={f.membershipUrl} className="text-white/50 hover:text-white transition-colors">Memberships</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
