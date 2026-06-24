import Link from 'next/link'

interface ServiceCTAProps {
  headline: string
  address: string
  bookingUrl: string
  membershipUrl: string
}

export default function ServiceCTA({ headline, address, bookingUrl, membershipUrl }: ServiceCTAProps) {
  return (
    <section className="bg-plum-900 py-16 mt-10">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
          {headline}
        </h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">{address}</p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <a
            href={membershipUrl}
            className="bg-white text-plum-900 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-cream-100 transition-colors"
          >
            View Memberships
          </a>
          <Link
            href="/signup"
            className="bg-brand-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors"
          >
            Join Now
          </Link>
        </div>

        <div className="border border-white/15 rounded-2xl px-8 py-6 max-w-lg mx-auto flex flex-col items-center gap-4 text-center">
          <div>
            <p className="text-white text-sm font-semibold leading-snug">Not sure what treatment is right for you?</p>
            <p className="text-white/50 text-xs mt-0.5">Book a complimentary 15-minute video call with our team.</p>
          </div>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            Book a Complimentary 15 Minute Video Call
          </a>
        </div>
      </div>
    </section>
  )
}
