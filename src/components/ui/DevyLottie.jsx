import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useEffect, useState } from 'react';

// Same idea as DevyMood, but for the motion-capture-style Devy clips (wave,
// listening, thinking) instead of the static mood SVGs. Kept as its own
// component because these load a multi-MB asset and need a reduced-motion
// fallback the plain <img> moods don't.
const SOURCES = {
  wave: '/assets/animations/wave.lottie',
  listening: '/assets/animations/listening.lottie',
  thinking: '/assets/animations/thinking.lottie',
  'side-pop-out': '/assets/animations/side-pop-out.json',
  walk: '/assets/animations/devy-walk-loop.lottie',
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

export function DevyLottie({ clip, loop = true, flip = false, holdAtPeak = false, className = '', ariaLabel, ...rest }) {
  const reducedMotion = usePrefersReducedMotion()
  const src = SOURCES[clip]

  if (!src) return null

  return (
    <div
      className={`relative ${flip ? '-scale-x-100' : ''} ${className}`}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : 'true'}
      {...rest}
    >
      <DotLottieReact
        src={src}
        loop={loop && !reducedMotion}
        autoplay={!reducedMotion}
        className="relative h-full w-full"
        layout={{ fit: 'contain', align: [0.5, 0.5] }}
        renderConfig={{ devicePixelRatio: Math.max(window.devicePixelRatio || 1, 2) }}
        dotLottieRefCallback={(instance) => {
          if (!instance) return
          // Several of these clips are cut from a loop that spends most of
          // its length arriving (not a quick pop followed by a long hold) —
          // measured frame-by-frame for 'side-pop-out', opaque pixel coverage
          // keeps climbing all the way to ~65% of the timeline before it
          // plateaus, so freezing at the midpoint (a reasonable-sounding
          // guess) actually caught it still mostly hidden. ~70% is where it's
          // fully arrived without yet looping back to invisible.
          if (holdAtPeak) {
            const onFrame = (event) => {
              const total = instance.totalFrames
              if (total > 0 && event.currentFrame >= total * 0.7) {
                instance.pause()
                instance.removeEventListener('frame', onFrame)
              }
            }
            instance.addEventListener('frame', onFrame)
          }
        }}
      />
    </div>
  )
}
