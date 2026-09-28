'use client'
/**
 * The shared journey, fetched in the browser from the records app — see
 * page.tsx for why. Draws with the portal's own viewer (PortalJourney), then
 * the three ways in: a free video consult, an in-person visit, a photo consult.
 */
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import PortalJourney, { type Journey, type PhotoLoader } from '../../my/PortalJourney'

const API = process.env.NEXT_PUBLIC_RECORDS_API ?? ''
const heading = { fontFamily: 'var(--font-cormorant), Georgia, serif' }
const card = 'bg-white rounded-2xl border border-gray-100 p-6 sm:p-8'

export default function JourneyView({ id, videoConsultUrl, phone }: {
  id: string
  videoConsultUrl: string
  phone: string
}) {
  const [journey, setJourney] = useState<Journey | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'gone' | 'error'>('loading')

  useEffect(() => {
    let live = true
    fetch(`${API}/api/public/journey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'view' }),
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!live) return
        if (res.status === 404) return setState('gone')
        if (!res.ok) return setState('error')
        const data = (await res.json()) as Journey
        if (!live) return
        if (!data.points?.length) return setState('gone')
        setJourney(data)
        setState('ok')
      })
      .catch(() => live && setState('error'))
    return () => {
      live = false
    }
  }, [id])

  const load: PhotoLoader = useMemo(
    () => (photo) =>
      fetch(`${API}/api/public/journey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'photo', photo }),
        cache: 'no-store',
      }),
    [id],
  )

  const book =
    'block w-full rounded-xl px-5 py-4 text-center text-base font-semibold transition-colors'

  return (
    <div className="space-y-6">
      <div className={card}>
        <h1 className="text-3xl font-semibold text-plum-900 mb-2" style={heading}>
          A patient&rsquo;s journey
        </h1>
        {state === 'loading' && <p className="text-sm text-gray-500">Loading…</p>}
        {state === 'gone' && (
          <p className="text-sm text-gray-600">
            This link is no longer shared. You can still see what we do and book a complimentary consult below.
          </p>
        )}
        {state === 'error' && (
          <p className="text-sm text-gray-600">We could not load these photos just now. Please try again in a moment.</p>
        )}
        {state === 'ok' && journey && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Shared with you by one of our patients at Magnolia Skin Center in Burbank. Pick an angle
              to compare the same view over time.
            </p>
            <PortalJourney journey={journey} load={load} />
          </>
        )}
      </div>

      <div className={card}>
        <h2 className="text-2xl font-semibold text-plum-900 mb-1" style={heading}>
          Curious what we&rsquo;d suggest for you?
        </h2>
        <p className="text-sm text-gray-600 mb-5">
          Every plan starts with a conversation. Pick whichever suits you — the first two are complimentary.
        </p>
        <div className="space-y-3">
          <a href={videoConsultUrl} target="_blank" rel="noopener noreferrer" className={`${book} bg-brand-600 text-white hover:bg-brand-700`}>
            Book a complimentary 15-minute video consult
          </a>
          <Link href="/photo-consult" className={`${book} border border-brand-600 text-brand-700 hover:bg-brand-50`}>
            Get a complimentary photo consult
          </Link>
          <Link href="/bookings" className={`${book} border border-brand-600 text-brand-700 hover:bg-brand-50`}>
            Book an in-person visit
          </Link>
        </div>
        {phone && (
          <p className="mt-4 text-center text-sm text-gray-600">
            Or call or text us at{' '}
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="text-brand-700 font-medium">
              {phone}
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
