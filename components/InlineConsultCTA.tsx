interface InlineConsultCTAProps {
  bookingUrl: string
}

/**
 * Slim inline consultation prompt placed high on the service page (after the
 * highlights), so visitors see the video-call offer without scrolling past the
 * long content to reach the full CTA at the bottom.
 */
export default function InlineConsultCTA({ bookingUrl }: InlineConsultCTAProps) {
  return (
    <section className="max-w-5xl mx-auto px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-plum-900/5 border border-plum-900/10 rounded-2xl px-6 py-5">
        <p className="text-sm sm:text-base leading-snug">
          <span className="font-semibold text-plum-900">Not sure if it&apos;s the right treatment?</span>{' '}
          <span className="text-gray-600">Book a complimentary 15-minute video consultation with our team.</span>
        </p>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 shrink-0 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          Book a Video Call
        </a>
      </div>
    </section>
  )
}
