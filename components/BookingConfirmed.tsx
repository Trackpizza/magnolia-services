'use client'
/**
 * What a patient sees once a booking has landed.
 *
 * Used in TWO places and shared for the usual reason: the widget shows it
 * inline when no deposit was taken, and /booking-confirmed shows it as a page
 * when Stripe redirects back. Two copies would drift, and the one that drifted
 * would be the one nobody at the clinic ever looks at.
 *
 * Carries NO treatment name. The patient knows what they booked; a page that
 * names it can be read over a shoulder, left open on a shared machine, or sit
 * in a browser history, and none of that is worth the reassurance.
 */

export interface BookingConfirmedProps {
  /** Missing when the page has no details to show — see the copy below. */
  date?: string
  start?: string
  consultMin?: number
  providerName?: string
  /** The video the clinic has not recorded yet. */
  videoUrl?: string
  heading?: string
}

function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function longDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
}

export default function BookingConfirmed({
  date, start, consultMin = 0, providerName, videoUrl, heading = 'You are booked',
}: BookingConfirmedProps) {
  const headingStyle = { fontFamily: 'var(--font-cormorant), Georgia, serif' }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-plum-900" style={headingStyle}>{heading}</h2>

      {date && start ? (
        <p className="text-gray-700">
          {longDate(date)} at {to12h(start)}
          {providerName ? ` with ${providerName}` : ''}
        </p>
      ) : (
        <p className="text-gray-700">
          Your appointment is confirmed. The date and time are in the email we have just sent you.
        </p>
      )}

      {consultMin > 0 && (
        <p className="text-gray-700">
          Your first visit includes {consultMin} minutes with {providerName || 'your provider'} before
          your treatment. There is nothing to fill in beforehand.
        </p>
      )}

      <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 space-y-2">
        <p className="text-sm text-gray-800">
          <strong>Your confirmation email is on its way now.</strong> It has a link you can use to
          change or cancel, so keep it.
        </p>
        <p className="text-sm text-gray-800">
          <strong>In about an hour</strong> we will send a second email with how to prepare for your
          treatment — what to avoid beforehand, and what to expect on the day. It is worth reading
          before you come in.
        </p>
        <p className="text-sm text-gray-800">
          We will also remind you the day before and again an hour before.
        </p>
      </div>

      <WelcomeVideo videoUrl={videoUrl} />

      <p className="text-sm text-gray-600">
        Anything you are unsure about before then, call or text us — we would far rather answer a
        question than have you wondering.
      </p>
    </div>
  )
}

/**
 * The welcome video, or the promise of one.
 *
 * Its own export so the confirmation page can show it even when it has no
 * booking to confirm — someone who lands there without a Stripe session gets
 * a page that is still about their visit rather than a dead end. Deliberately
 * shown rather than hidden while unrecorded: this is the moment a new patient
 * is most curious about who they are about to see, and an empty space says
 * nothing while a promised video says the clinic was expecting them.
 */
export function WelcomeVideo({ videoUrl }: { videoUrl?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {videoUrl ? (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={videoUrl}
            title="What to expect at your appointment"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      ) : (
        <div className="bg-gray-50 px-5 py-8 text-center">
          <div className="text-3xl mb-2" aria-hidden="true">🎥</div>
          <p className="text-sm font-medium text-gray-800">What to expect — coming soon</p>
          <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
            Dr. David and Nurse Eileen are recording a short welcome video: what happens when you
            arrive, and how to get the most from your treatment.
          </p>
        </div>
      )}
    </div>
  )
}
