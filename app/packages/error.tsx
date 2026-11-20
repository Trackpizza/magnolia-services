'use client'
/**
 * /packages couldn't reach the package list (11-20). Rare — the page keeps its
 * last good copy — but if a visitor ever lands here, they see "Loading" and it
 * retries by itself every few seconds; nobody has to know to refresh.
 */
import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function PackagesError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  useEffect(() => {
    const t = setInterval(() => {
      startTransition(() => {
        router.refresh()
        reset()
      })
    }, 4000)
    return () => clearInterval(t)
  }, [router, reset])
  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-lg text-gray-800">Loading our packages…</p>
        <p className="mt-1 text-sm text-gray-600">One moment.</p>
      </div>
    </div>
  )
}
