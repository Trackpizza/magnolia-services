import { notFound } from 'next/navigation'
import { getServiceBySlug, getAllSlugs } from '@/config/services'
import { getLinks } from '@/lib/links'
import GuidePage from '@/components/GuidePage'

// Cached/ISR: instant from CDN, refreshes in the background (and on admin save).
export const revalidate = 60

export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

const GUIDE_TITLE = 'Pre-Treatment & Planning Guide'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const service = getServiceBySlug(params.slug)
  if (!service) return {}
  return { title: `${GUIDE_TITLE} — ${service.name} | Magnolia Skin Center` }
}

export default async function PreTreatmentPage({ params }: Props) {
  const service = getServiceBySlug(params.slug)
  if (!service) notFound()
  const links = await getLinks()
  return (
    <GuidePage
      service={service}
      guideTitle={GUIDE_TITLE}
      videoUrl={links.prepVideos[service.id] ?? ''}
      videoDate={links.prepVideoDates[service.id] ?? ''}
      markdown={links.prepContent[service.id] ?? ''}
      links={links}
    />
  )
}
