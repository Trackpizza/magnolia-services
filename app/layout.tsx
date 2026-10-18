import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import ExistingPatientBar from '@/components/ExistingPatientBar'

const inter = Inter({ subsets: ['latin'] })

// Self-hosted via next/font (no render-blocking external request). Exposed as a
// CSS variable so headings can reference it via Tailwind's font-serif / inline styles.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: 'Services | Magnolia Skin Center',
  description: 'Browse all treatments and aesthetic services at Magnolia Skin Center in Burbank, CA.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the embed script below sets data-embed first.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Video posters come from YouTube's thumbnail CDN, and the poster is usually the
            LCP element, so warm the connection before the image request goes out. */}
        <link rel="preconnect" href="https://i.ytimg.com" />
        {/* Shown INSIDE the client portal's page viewer (10-17, app/my/SiteViewer):
            no site header/footer/bar (globals.css html[data-embed]), and this
            site's own new-tab links stay in the viewer. Runs before paint, so
            the header never flashes. Pages stay static — no ?embed param. */}
        <script dangerouslySetInnerHTML={{ __html: "(function(){try{if(window.self===window.top)return}catch(e){}var d=document.documentElement;d.setAttribute('data-embed','');document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a[target]'):null;if(!a)return;try{if(new URL(a.href,location.href).origin===location.origin)a.removeAttribute('target')}catch(x){}},true)})();" }} />
      </head>
      <body className={`${inter.className} ${cormorant.variable} antialiased bg-cream-100`}>
        <ExistingPatientBar />
        {children}
      </body>
    </html>
  )
}
