'use client'

import { useState } from 'react'
import { getYouTubeId } from '@/lib/youtube'

/**
 * Landscape (16:9) click-to-play video for Dr. David's rejuvenation page.
 * When `url` is empty it renders a styled "video coming soon" placeholder, so the
 * page can ship before the clip is uploaded — drop a YouTube URL into VIDEO_URL on
 * the page and it becomes a real click-to-load facade (same pattern as YouTubeEmbed).
 */
export default function RejuvenationVideo({ url, title }: { url: string; title: string }) {
  const id = getYouTubeId(url)
  const [playing, setPlaying] = useState(false)
  const [poster, setPoster] = useState(id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : '')

  // No video yet → placeholder.
  if (!id) {
    return (
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-plum-900 flex flex-col items-center justify-center text-center px-6"
        style={{ aspectRatio: '16/9' }}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 mb-4">
          <svg className="w-7 h-7 translate-x-0.5 text-white/80" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <p className="text-white font-medium">Dr. David&rsquo;s story — video coming soon</p>
        <p className="text-white/50 text-sm mt-1">Check back shortly to watch the full journey.</p>
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-plum-900" style={{ aspectRatio: '16/9' }}>
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
            loading="eager"
            fetchPriority="high"
            onError={() => setPoster(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
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
