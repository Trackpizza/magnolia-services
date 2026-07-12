interface ServiceCTAProps {
  headline: string
  address: string
  bookingUrl: string
}

export default function ServiceCTA({ headline, address, bookingUrl }: ServiceCTAProps) {
  return (
    <section className="bg-plum-900 py-16 mt-10">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
          {headline}
        </h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          Not sure if it&apos;s right for you? Book a complimentary 15-minute video consultation with our team.
        </p>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-8 py-3.5 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          Book a Complimentary 15 Minute Video Call
        </a>
        <p className="text-white/40 text-xs mt-5">{address}</p>
      </div>
    </section>
  )
}
