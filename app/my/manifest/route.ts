/**
 * The installable app's manifest, per patient page (10-06).
 *
 * Chrome and Edge only offer "Install app" when the manifest has a
 * `start_url`, and the static one (public/portal/manifest.webmanifest) has
 * none on purpose: the page that matters is `/my?t=<token>`, and one shared
 * start_url would open every patient's install on a page that does not know
 * who they are. So each page links its own: start_url = its own address.
 * The token is already in the page's URL; this adds nowhere new for it to go
 * (no-referrer on the page, no-store here). Anything that is not a token
 * gets the static manifest's shape with start_url `/my` — still valid.
 */
import { NextResponse } from 'next/server'

const TOKEN = /^[0-9a-f]{32}$/

export function GET(request: Request) {
  const t = new URL(request.url).searchParams.get('t') ?? ''
  const start = TOKEN.test(t) ? `/my?t=${t}` : '/my'
  const manifest = {
    // One app per patient page: two people sharing a computer each get
    // their own Magnolia app, not one replacing the other.
    id: start,
    name: 'Magnolia Skin Center — Your page',
    short_name: 'Magnolia',
    description: 'Your plan, appointments, photos and forms with Magnolia Skin Center.',
    start_url: start,
    scope: '/my',
    display: 'standalone',
    background_color: '#1a1b1a',
    theme_color: '#1a1b1a',
    icons: [
      { src: '/portal/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/portal/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/portal/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}
