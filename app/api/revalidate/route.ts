import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAllSlugs } from '@/config/services'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-revalidate-token')
  if (token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Purge home + booking, then every concrete service and guide path. Revalidating
  // the exact paths (not just the layout) is the reliable way to evict the dynamic
  // [slug] guide pages from the CDN so a save shows everywhere on the next request.
  revalidatePath('/', 'layout')
  revalidatePath('/')
  revalidatePath('/bookings')
  // Terms is editable in /admin, so a save has to evict it too — otherwise the
  // clinic changes its cancellation policy and the page keeps serving the old
  // one for up to a minute, which is exactly the page where that matters.
  revalidatePath('/terms')
  for (const slug of getAllSlugs()) {
    revalidatePath(`/services/${slug}`)
    revalidatePath(`/services/${slug}/pre-treatment`)
    revalidatePath(`/services/${slug}/after-care`)
  }
  return NextResponse.json({ revalidated: true })
}
