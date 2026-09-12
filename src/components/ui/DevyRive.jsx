import { useEffect, useState } from 'react'
import { RuntimeLoader, useRive } from '@rive-app/react-canvas'

// By default @rive-app/canvas fetches its WASM runtime from unpkg.com at
// runtime. Pointing it at our own copy (public/rive.wasm) keeps Devy working
// offline and off an external CDN, same as the self-hosted .lottie files.
RuntimeLoader.setWasmUrl('/rive.wasm')

// `devy-rig` is the richer export — two state machines, plus named Wink /
// Brow raise / blink sub-animations. `devy-rig-basic` is an earlier, simpler
// single-state-machine version of the same character.
const SOURCES = {
  rig: '/assets/animations/devy-rig.riv',
  'rig-basic': '/assets/animations/devy-rig-basic.riv',
}

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

// Same shape as DevyLottie: a static fallback shows immediately and fades
// out once the .riv file (and its WASM runtime) reports itself loaded, so
// there's never a blank gap while either downloads.
export function DevyRive({ clip, stateMachine = 'State Machine 1', className = '', ariaLabel, ...rest }) {
  const reducedMotion = usePrefersReducedMotion()
  const [ready, setReady] = useState(false)
  const src = SOURCES[clip]

  const { RiveComponent } = useRive({
    src,
    stateMachine,
    autoplay: !reducedMotion,
    onLoad: () => setReady(true),
  })

  if (!src) return null

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
      <RiveComponent className="relative h-full w-full" />
    </div>
  )
}
