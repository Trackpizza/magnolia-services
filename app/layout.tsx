import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

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
    <html lang="en">
      <head>
        {/* Video posters come from YouTube's thumbnail CDN, and the poster is usually the
            LCP element, so warm the connection before the image request goes out. */}
        <link rel="preconnect" href="https://i.ytimg.com" />
      </head>
      <body className={`${inter.className} ${cormorant.variable} antialiased bg-cream-100`}>
        {children}
      </body>
    </html>
  )
}
