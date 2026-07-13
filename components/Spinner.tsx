'use client'
import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'

export interface SpinService { name: string; slug: string; treats: string[]; aka: string[] }

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}
const sample = <T,>(arr: T[], n: number): T[] => shuffle(arr).slice(0, Math.min(n, arr.length))

type Phase = 'idle' | 'spinning' | 'conditions' | 'revealed'

export default function Spinner({ services }: { services: SpinService[] }) {
  const total = services.length
  const allConcerns = useMemo(() => services.flatMap(s => [...s.treats, ...s.aka]), [services])

  const [deck, setDeck] = useState<number[]>(() => shuffle(services.map((_, i) => i)))
  const [pos, setPos] = useState(0)
  const [pureRandom, setPureRandom] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [concerns, setConcerns] = useState<string[]>([])
  const [blurWords, setBlurWords] = useState<string[]>([])
  const [current, setCurrent] = useState<SpinService | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const alsoFits = useMemo(() => {
    if (!current) return []
    const lc = concerns.map(c => c.toLowerCase())
    return services
      .filter(s => s.name !== current.name && [...s.treats, ...s.aka].some(x => lc.includes(x.toLowerCase())))
      .map(s => s.name)
      .slice(0, 3)
  }, [current, concerns, services])

  const spin = () => {
    if (phase === 'spinning') return

    let svc: SpinService
    if (pureRandom) {
      svc = services[Math.floor(Math.random() * total)]
    } else {
      let d = deck
      let p = pos
      if (p >= d.length) { d = shuffle(services.map((_, i) => i)); setDeck(d); p = 0 }
      svc = services[d[p]]
      setPos(p + 1)
    }

    setCurrent(svc)
    setConcerns(shuffle([...sample(svc.treats, 3), ...sample(svc.aka, 3)]))
    setPhase('spinning')

    let ticks = 0
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => {
      setBlurWords(sample(allConcerns, 6))
      if (++ticks > 11) {
        if (timer.current) clearInterval(timer.current)
        setPhase('conditions')
      }
    }, 90)
  }

  const reset = () => {
    if (timer.current) clearInterval(timer.current)
    setDeck(shuffle(services.map((_, i) => i)))
    setPos(0)
    setPhase('idle')
    setCurrent(null)
    setConcerns([])
  }

  const spinning = phase === 'spinning'
  const showWords = spinning ? blurWords : concerns
  const progress = pureRandom ? '' : `${Math.min(pos, total)} / ${total}`

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <header className="bg-plum-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><img src="/wordmark-white.webp" alt="Magnolia Skin Center" width={380} height={141} className="h-9 w-auto" /></Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white font-medium transition-colors">&larr; All Services</Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-10 flex flex-col items-center text-center">
        <p className="text-sm font-medium text-brand-600 uppercase tracking-widest mb-2">Magnolia Skin Center</p>
        <h1 className="text-4xl font-semibold text-plum-900 mb-2" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>Guess the Treatment</h1>
        <p className="text-gray-500 mb-6">Spin to reveal a set of concerns — then guess which treatment we&rsquo;re featuring.</p>

        {/* Stage */}
        <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 min-h-[260px] flex flex-col items-center justify-center gap-4">
          {phase === 'idle' ? (
            <p className="text-gray-400">Tap &ldquo;Spin&rdquo; to begin</p>
          ) : (
            <>
              <div
                className="grid grid-cols-2 gap-2 w-full transition-all duration-150"
                style={{ filter: spinning ? 'blur(3px)' : 'none', opacity: spinning ? 0.85 : 1 }}
              >
                {showWords.map((w, i) => (
                  <div key={i} className="bg-cream-100 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-800 leading-tight">
                    {w}
                  </div>
                ))}
              </div>

              {phase === 'revealed' && current && (
                <div className="w-full mt-2 bg-brand-50 rounded-2xl p-5" style={{ backgroundColor: '#E1F5EE' }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#0F6E56' }}>These all point to</p>
                  <p className="text-2xl font-semibold mb-3" style={{ color: '#04342C', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>{current.name}</p>
                  <Link
                    href={`/services/${current.slug}`}
                    aria-label={`Learn more about ${current.name} at Magnolia Skin Center in Burbank`}
                    className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    style={{ backgroundColor: '#0F6E56' }}
                  >
                    Learn more &rarr;
                  </Link>
                  {alsoFits.length > 0 && (
                    <p className="text-xs text-gray-500 mt-3">Also fits: {alsoFits.join(', ')}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={spin}
            disabled={spinning}
            className="bg-brand-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {phase === 'idle' ? 'Spin' : 'Spin again'}
          </button>
          {phase === 'conditions' && (
            <button
              onClick={() => setPhase('revealed')}
              className="bg-plum-900 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-plum-900/90 transition-colors"
            >
              Reveal the treatment &rarr;
            </button>
          )}
          <button
            onClick={reset}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-3 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Mode + progress */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={pureRandom} onChange={e => { setPureRandom(e.target.checked); reset() }} />
            Pure random (allow repeats)
          </label>
          {!pureRandom && <span>Deck: {progress}</span>}
        </div>
      </main>
    </div>
  )
}
