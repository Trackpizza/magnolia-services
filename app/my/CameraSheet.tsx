'use client'
/**
 * A camera inside the portal card (10-30, Eric: "Send us something doesn't
 * have camera access"). A file input alone never offers the webcam on a
 * laptop, so "📷 Take photo(s)" opens this: live preview, 📸 to snap as many
 * as there is room for, 🔄 to switch front / back on a phone, Done.
 *
 * Same camera handling as the follow-up photo page (app/photos/[token]):
 * the stream is let go when switching and on close (the light goes off),
 * the FRONT camera's preview is mirrored but the saved photo is not — a
 * clinical photo must not show the wrong side. Each shot is a JPEG, long
 * edge ≤ 2048, no location data.
 */
import { useEffect, useRef, useState } from 'react'

export default function CameraSheet({
  room,
  startFacing = 'user',
  onShot,
  onClose,
}: {
  /** How many more photos fit (the card's limit minus what's picked). */
  room: number
  startFacing?: 'user' | 'environment'
  onShot: (jpeg: Blob) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facing, setFacing] = useState<'user' | 'environment'>(startFacing)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [taken, setTaken] = useState(0)
  const [flash, setFlash] = useState(false)
  const [canSwitch, setCanSwitch] = useState(false)

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const start = async (face: 'user' | 'environment') => {
    setError('')
    setReady(false)
    stop()
    setFacing(face)
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: face }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      const el = videoRef.current
      if (el) {
        el.srcObject = streamRef.current
        await el.play().catch(() => undefined)
      }
      setReady(true)
      // A second camera to switch to (phones; most laptops have one).
      const devices = await navigator.mediaDevices.enumerateDevices().catch(() => [])
      setCanSwitch(devices.filter((d) => d.kind === 'videoinput').length > 1)
    } catch (e) {
      console.warn('portal camera: could not start:', e)
      setError('We couldn’t reach your camera. Check the permission prompt in your browser, or use “Upload from this device” instead.')
    }
  }

  useEffect(() => {
    void start(startFacing)
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const snap = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth || taken >= room) return
    const scale = Math.min(1, 2048 / Math.max(v.videoWidth, v.videoHeight))
    const c = document.createElement('canvas')
    c.width = Math.round(v.videoWidth * scale)
    c.height = Math.round(v.videoHeight * scale)
    const ctx = c.getContext('2d')
    if (!ctx) return
    // Mirrored preview, UNMIRRORED file.
    ctx.drawImage(v, 0, 0, c.width, c.height)
    c.toBlob(
      (blob) => {
        if (!blob) return
        onShot(blob)
        setTaken((n) => n + 1)
        setFlash(true)
        setTimeout(() => setFlash(false), 150)
      },
      'image/jpeg',
      0.88,
    )
  }

  const done = () => {
    stop()
    onClose()
  }
  const full = taken >= room

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="relative overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          className="block w-full max-h-[60vh] object-contain"
          style={{ transform: facing === 'user' ? 'scaleX(-1)' : 'none' }}
        />
        {flash && <div className="absolute inset-0 bg-white/70" aria-hidden />}
        {!ready && !error && <p className="absolute inset-0 flex items-center justify-center text-sm text-white/80">Starting the camera…</p>}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-sm text-gray-700">
        {full ? `That’s all ${taken} — press Done.` : taken ? `${taken} taken · room for ${room - taken} more` : 'Point it at the area, in good light, then tap 📸.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={snap}
          disabled={!ready || full}
          className="flex-1 rounded-xl bg-brand-600 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          📸 Take photo
        </button>
        {canSwitch && (
          <button
            type="button"
            onClick={() => void start(facing === 'user' ? 'environment' : 'user')}
            className="rounded-xl border border-gray-300 px-4 py-3 text-base font-semibold text-gray-800 hover:bg-gray-100"
          >
            🔄 Switch camera
          </button>
        )}
        <button
          type="button"
          onClick={done}
          className="rounded-xl border border-brand-600 px-5 py-3 text-base font-semibold text-brand-700 hover:bg-brand-50"
        >
          Done{taken ? ` (${taken})` : ''}
        </button>
      </div>
    </div>
  )
}
