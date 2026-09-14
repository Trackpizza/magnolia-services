/**
 * Patient-facing video testimonial upload, reached from a single-use link.
 *
 * Noindex and nofollow: the page is meaningless without a token, and a search
 * result pointing at a med spa's testimonial uploader is not something a
 * patient benefits from finding.
 */
import type { Metadata } from 'next'
import TestimonialUploader from './Client'

export const metadata: Metadata = {
  title: 'Share your story | Magnolia Skin Center',
  robots: { index: false, follow: false },
  description: 'Record a short video for Magnolia Skin Center.',
}

export default function TestimonialPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 py-12">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <TestimonialUploader />
      </div>
    </main>
  )
}
