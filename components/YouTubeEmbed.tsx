'use client'

import { useState } from 'react'
import { getYouTubeId } from '@/lib/youtube'

interface YouTubeEmbedProps {
  url: string
  title: string
  /** Above-the-fold videos fetch their poster eagerly; ones further down load lazily. */
  priority?: boolean
  className?: string
}

/**
 * Click-to-play facade for a YouTube video. The player is ~1MB of third-party JS that
 * blocks the main thread, so we render only the poster frame until the visitor asks to
 * watch. Mounting the iframe on click (rather than on load) keeps it off the critical path.
 */
export default function YouTubeEmbed({ url, title, priority = false, className = '' }: YouTubeEmbedProps) {
  const id = getYouTubeId(url)
  const [playing, setPlaying] = useState(false)
  // maxresdefault is the sharpest frame YouTube exposes, but it only exists for videos
  // uploaded at 720p+. hqdefault always exists, so fall back to it if maxres 404s.
  const [poster, setPoster] = useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`)

  if (!id) return null

  return (
    <div
      className={`relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden bg-plum-900 ${className}`}
      style={{ aspectRatio: '9/16' }}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 w-full h-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            onError={() => setPoster(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
            // YouTube only serves landscape thumbnails, so a 9:16 clip arrives pillarboxed.
            // Cropping to the centre recovers the actual frame and drops the black bars.
            className="absolute inset-0 w-full h-full object-cover"
          />
          <span className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 transition-colors group-hover:bg-brand-600">
            <svg className="w-7 h-7 translate-x-0.5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  )
}
