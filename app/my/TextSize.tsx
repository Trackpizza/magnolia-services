'use client'
/**
 * Text size on the client's page (10-17, Eric): A− / A+ in 5% steps, from 25%
 * smaller to 25% larger, on top of the portal's own size (app/my/page.tsx —
 * 20% larger than the site, phones too: the extra 10% on phones was taken
 * back 10-17 once clients could pick their own size). Kept on THIS device
 * (localStorage): bigger on a phone than on a computer is a normal wish.
 * Applied as `--ts` on <html>; page.tsx's rule multiplies by it.
 */
import { useEffect, useState } from 'react'

const KEY = 'msc_portal_text_step'
const MIN = -5
const MAX = 5

function readStep(): number {
  try {
    const n = Number(localStorage.getItem(KEY))
    return Number.isInteger(n) && n >= MIN && n <= MAX ? n : 0
  } catch {
    return 0
  }
}

/** Applies the saved size as soon as the page mounts — before sign-in too. */
export function useTextSize(): [number, (n: number) => void] {
  const [step, setStep] = useState(0)
  useEffect(() => {
    setStep(readStep())
  }, [])
  useEffect(() => {
    const html = document.documentElement
    html.style.setProperty('--ts', String(1 + step * 0.05))
    return () => {
      html.style.removeProperty('--ts')
    }
  }, [step])
  const save = (n: number) => {
    const next = Math.min(MAX, Math.max(MIN, n))
    setStep(next)
    try {
      localStorage.setItem(KEY, String(next))
    } catch {
      /* this visit only */
    }
  }
  return [step, save]
}

const btn =
  'h-9 min-w-[2.75rem] rounded-lg border border-gray-300 px-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-40'

export default function TextSize({ step, onChange }: { step: number; onChange: (n: number) => void }) {
  const pct = step * 5
  return (
    <div className="portal-onbg flex flex-wrap items-center gap-2 px-1 text-sm text-gray-700">
      <span className="font-semibold">Text size</span>
      <button type="button" onClick={() => onChange(step - 1)} disabled={step <= MIN} className={btn} aria-label="Smaller text">
        A−
      </button>
      <span className="w-14 text-center tabular-nums" aria-live="polite">
        {pct === 0 ? 'Normal' : `${pct > 0 ? '+' : ''}${pct}%`}
      </span>
      <button type="button" onClick={() => onChange(step + 1)} disabled={step >= MAX} className={btn} aria-label="Larger text">
        A+
      </button>
      {step !== 0 && (
        <button type="button" onClick={() => onChange(0)} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          Reset
        </button>
      )}
    </div>
  )
}
