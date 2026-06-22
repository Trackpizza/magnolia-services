import { getSpinnerServices } from '@/config/services'
import Spinner, { type SpinService } from '@/components/Spinner'

export const metadata = {
  title: 'Guess the Treatment | Magnolia Skin Center',
  robots: { index: false, follow: false },
}

export default function SpinPage() {
  const services: SpinService[] = getSpinnerServices().map(s => ({
    name: s.name,
    slug: s.slug,
    treats: s.treats,
    aka: s.alsoKnownAs,
  }))
  return <Spinner services={services} />
}
