'use client'
/**
 * The clinic's note on a follow-up photo set, for the patient (2026-09-29).
 * Written on the chart as "Note for the patient"; the staff-only clinical
 * note never reaches this site. A share link never carries it either.
 * Rendered into document.body above the photo viewer (z-[100]).
 */
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function NoteDialog({ title, note, onClose }: {
  title: string
  note: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  if (typeof document === 'undefined') return null
  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Note from the clinic — ${title}`}
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900">Note from the clinic</h3>
            <p className="mt-0.5 text-xs text-gray-500">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="-mr-1 -mt-1 h-9 w-9 shrink-0 rounded-lg text-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{note}</p>
      </div>
    </div>,
    document.body,
  )
}
