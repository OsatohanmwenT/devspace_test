import { useEffect, useState } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

// Same idea as DevyMood, but for the motion-capture-style Devy clips (wave,
// listening, thinking) instead of the static mood SVGs. Kept as its own
// component because these load a multi-MB asset and need a reduced-motion
// fallback the plain <img> moods don't.
const SOURCES = {
  wave: '/assets/animations/wave.lottie',
  listening: '/assets/animations/listening.lottie',
  thinking: '/assets/animations/thinking.lottie',
  walk: '/assets/animations/devy-idle-loop.lottie',
  // These two are Rive-to-Lottie *captures* (rendered frame-by-frame from the
  // .riv rig), not native Lottie exports — unlike the three above, both bake
  // in an OPAQUE dark-gray background rather than transparency, so dropping
  // either onto an adaptive light/dark screen leaves a visible gray box.
  // They need a matching dark card behind them before use anywhere.
  idle: '/assets/animations/devy-idle-loop.lottie',
  // Every one of this file's 72 frames is byte-identical — it plays as a
  // static coin/medallion icon, not a loop, despite the "loop-3s" export name.
  coin: '/assets/animations/devy-coin.lottie',
}

// Reduced-motion viewers get the first frame only — DotLottieReact has no
// "static frame" prop, so autoplay/loop are simply switched off.
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    const onChange = (event) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

export function DevyLottie({ clip, loop = true, className = '', ariaLabel, ...rest }) {
  const reducedMotion = usePrefersReducedMotion()
  const [ready, setReady] = useState(false)
  const src = SOURCES[clip]

  if (!src) return null

  // These clips run 3-4MB, so on a cold cache/slow connection there's a real
  // gap between mount and first paint. Rather than leave that gap blank, the
  // static mood art sits underneath and only fades out once the clip reports
  // itself ready to render — a failed load just leaves the static art showing.
  return (
    <div
      className={`relative ${className}`}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : 'true'}
      {...rest}
    >
      <img
        src="/assets/devy.svg"
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ${ready ? 'opacity-0' : 'opacity-100'}`}
      />
      <DotLottieReact
        src={src}
        loop={loop && !reducedMotion}
        autoplay={!reducedMotion}
        className="relative h-full w-full"
        renderConfig={{ devicePixelRatio: Math.max(window.devicePixelRatio || 1, 2) }}
        dotLottieRefCallback={(instance) => {
          if (!instance) return
          instance.addEventListener('ready', () => setReady(true))
        }}
      />
    </div>
  )
}
