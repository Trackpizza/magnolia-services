import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceBySlug, getAllSlugs } from '@/config/services'
import { getLinks } from '@/lib/links'
import AlsoKnownAs from '@/components/AlsoKnownAs'
import ServiceCTA from '@/components/ServiceCTA'
import ServiceContent from '@/components/ServiceContent'
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/youtube'
import { serviceLd } from '@/lib/schema'

// Cached/ISR: served instantly from the CDN (no cold-start wait). Regenerates in the
// background at most once per minute, and immediately when the admin saves (revalidate hook).
export const revalidate = 60

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const service = getServiceBySlug(params.slug)
  if (!service) return {}
  return {
    title: `${service.name} | Magnolia Skin Center`,
    description: service.searchDescription,
    keywords: service.keywords.join(', '),
  }
}

export default async function ServicePage({ params }: Props) {
  const service = getServiceBySlug(params.slug)
  if (!service) notFound()

  const links = await getLinks()
  const videoUrl = links.videos[service.id] ?? ''
  const embedUrl = getYouTubeEmbedUrl(videoUrl)
  const customContent = links.content[service.id] ?? ''
  // Guide links always show; each guide page handles its own (possibly "coming soon") content.

  // VideoObject structured data so Google can credit the embedded treatment video to this page.
  const videoThumb = getYouTubeThumbnail(videoUrl)
  const uploadDate = links.videoDates[service.id] ?? ''
  const videoLd = embedUrl && videoThumb ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `${service.name} at Magnolia Skin Center`,
    description: service.searchDescription,
    thumbnailUrl: videoThumb,
    embedUrl,
    ...(uploadDate ? { uploadDate } : {}),
  } : null

  const svcLd = serviceLd({
    name: service.name,
    description: service.searchDescription,
    slug: service.slug,
    category: service.category,
  })

  return (
    <div className="min-h-screen bg-cream-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(svcLd) }}
      />
      {videoLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }}
        />
      )}

      {/* Header */}
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <img src="/logo.avif" alt="Magnolia Skin Center" className="h-10 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-white/70 hover:text-white font-medium transition-colors">
              &larr; All Services
            </Link>
            <Link href="/login" className="text-sm text-white/70 hover:text-white font-medium transition-colors">
              Member Login
            </Link>
            <Link href="/signup" className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-14 pb-8 text-center">
        <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-3">{service.category}</p>
        <h1 className="text-5xl font-semibold text-plum-900 mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          {service.name}
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {service.tagline}
        </p>
      </section>

      {/* Video + Highlights */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* Video */}
          <div className="w-full lg:w-72 shrink-0 mx-auto lg:mx-0">
            {embedUrl ? (
              <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
                <iframe
                  src={embedUrl}
                  title={`${service.name} treatment video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : (
              <div
                className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden bg-plum-900/10 border-2 border-dashed border-plum-900/20 flex flex-col items-center justify-center text-center p-8"
                style={{ aspectRatio: '9/16' }}
              >
                <svg className="w-12 h-12 text-plum-900/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-plum-900/40 text-sm font-medium">Video coming soon</p>
                <p className="text-plum-900/30 text-xs mt-1">Treatment walkthrough will appear here</p>
              </div>
            )}
          </div>

          {/* Highlights */}
          <div className="flex-1">
            <h2 className="text-3xl font-semibold text-plum-900 mb-6" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Why patients choose {service.name}
            </h2>
            <div className="space-y-3">
              {service.highlights.map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border bg-white border-gray-100">
                  <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">&#10003;</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 mb-0.5">{item.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What it treats */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-2xl font-semibold text-plum-900 mb-6" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            What this treatment addresses
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {service.treats.map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Also Known As */}
      <AlsoKnownAs terms={service.alsoKnownAs} />

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-plum-900/5 rounded-2xl border border-plum-900/10 p-8">
          <h2 className="text-2xl font-semibold text-plum-900 mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            How it works
          </h2>
          <div className="space-y-6">
            {service.howItWorks.map((step, i) => (
              <div key={i}>
                {service.howItWorks.length > 1 && (
                  <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Step {step.step}</p>
                )}
                {service.howItWorks.length > 1 && (
                  <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                )}
                <p className="text-gray-600 text-base leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom editable content (admin-managed markdown) */}
      <ServiceContent markdown={customContent} />

      {/* Guide links → dedicated Pre-Treatment / After Care pages (always shown) */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href={`/services/${service.slug}/pre-treatment`} className="group flex items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-6 hover:border-brand-300 hover:shadow-sm transition-all">
            <div>
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Guide</p>
              <p className="text-lg font-semibold text-plum-900" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Pre-Treatment &amp; Planning Guide</p>
            </div>
            <span className="text-brand-600 text-xl shrink-0 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
          <Link href={`/services/${service.slug}/after-care`} className="group flex items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-6 hover:border-brand-300 hover:shadow-sm transition-all">
            <div>
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Guide</p>
              <p className="text-lg font-semibold text-plum-900" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>After Care</p>
            </div>
            <span className="text-brand-600 text-xl shrink-0 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <ServiceCTA
        headline={`Ready to experience ${service.name}?`}
        address={`Magnolia Skin Center — ${links.mainFooter.address}`}
        bookingUrl={links.mainFooter.bookingUrl}
        membershipUrl={links.mainFooter.membershipUrl}
      />

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Disclaimer</p>
          <p className="text-sm text-gray-500 leading-relaxed">{service.disclaimer}</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-plum-900 border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            {links.serviceFooter.phone && (
              <a href={`tel:${links.serviceFooter.phone.replace(/\D/g, '')}`}
                className="text-white/50 hover:text-white/70 text-sm transition-colors">{links.serviceFooter.phone}</a>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
            {links.serviceFooter.customLinks.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors">{link.label || link.url}</a>
            ))}
            <Link href="/" className="text-white/50 hover:text-white transition-colors">All Services</Link>
            <a href={links.serviceFooter.membershipUrl} className="text-white/50 hover:text-white transition-colors">Memberships</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
