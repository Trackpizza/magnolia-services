'use client'
/**
 * "I agree to the Terms of Service and acknowledge the Notice of Privacy
 * Practices" — the tick box beside every portal sign-in (10-11). "Acknowledge"
 * for the privacy notice because under HIPAA a patient acknowledges receiving
 * it; they do not agree to it. Both links open in a new tab, so reading them
 * does not lose the code just typed.
 */
export default function AgreeBox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-brand-600"
      />
      <span>
        I agree to the{' '}
        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">Terms of Service</a>{' '}
        and acknowledge the{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">Notice of Privacy Practices</a>.
      </span>
    </label>
  )
}
