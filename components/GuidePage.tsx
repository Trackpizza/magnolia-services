import Link from 'next/link'
import type { ServiceEntry } from '@/config/services'
import type { ServiceLinks } from '@/lib/types'
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/youtube'
import ServiceContent from '@/components/ServiceContent'
import YouTubeEmbed from '@/components/YouTubeEmbed'

interface GuidePageProps {
  service: ServiceEntry
  guideTitle: string
  videoUrl: string
  videoDate: string
  markdown: string
  links: ServiceLinks
}

export default function GuidePage({ service, guideTitle, videoUrl, videoDate, markdown, links }: GuidePageProps) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl)
  const backHref = `/services/${service.slug}`

  // VideoObject structured data so Google can credit the guide video to this page.
  const videoThumb = getYouTubeThumbnail(videoUrl)
  const videoLd = embedUrl && videoThumb ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `${service.name} — ${guideTitle} | Magnolia Skin Center`,
    description: `${guideTitle} for ${service.name} at Magnolia Skin Center in Burbank, CA.`,
    thumbnailUrl: videoThumb,
    embedUrl,
    ...(videoDate ? { uploadDate: videoDate } : {}),
  } : null

  return (
    <div className="min-h-screen bg-cream-100">
      {videoLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }}
        />
      )}

      {/* Header */}
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={links.mainFooter.websiteUrl || 'https://www.magnoliaskincenter.com'}>
            <img src="/logo.avif" alt="Magnolia Skin Center" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href={backHref} className="text-sm text-white/70 hover:text-white font-medium transition-colors">
              &larr; Back to {service.name}
            </Link>
            <a href={links.mainFooter.membershipUrl} className="text-sm text-white/70 hover:text-white font-medium transition-colors">
              Memberships
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-14 pb-8 text-center">
        <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-3">{service.name}</p>
        <h1 className="text-5xl font-semibold text-plum-900 mb-4" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
          {guideTitle}
        </h1>
      </section>

      {/* Video (or coming-soon placeholder) */}
      <section className="max-w-5xl mx-auto px-6 pb-2">
        <div className="w-full lg:w-72 mx-auto">
          {embedUrl ? (
            <YouTubeEmbed url={videoUrl} title={`${service.name} — ${guideTitle} video`} priority />
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
              <p className="text-plum-900/30 text-xs mt-1">Walkthrough will appear here</p>
            </div>
          )}
        </div>
      </section>

      {/* Markdown text (hidden if empty) */}
      <ServiceContent markdown={markdown} />

      {/* Back link */}
      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <Link href={backHref} className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
          &larr; Back to {service.name}
        </Link>
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
            <a href={links.mainFooter.membershipUrl} className="text-white/50 hover:text-white transition-colors">Memberships</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
