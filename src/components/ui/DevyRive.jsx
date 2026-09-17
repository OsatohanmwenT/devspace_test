import { useEffect, useState } from 'react'
import { RuntimeLoader, useRive } from '@rive-app/react-canvas'

// By default @rive-app/canvas fetches its WASM runtime from unpkg.com at
// runtime. Pointing it at our own copy (public/rive.wasm) keeps Devy working
// offline and off an external CDN, same as the self-hosted .lottie files.
RuntimeLoader.setWasmUrl('/rive.wasm')

// `devy-rig` is the richer export — two state machines, plus named Wink /
// Brow raise / blink sub-animations. `devy-rig-basic` is an earlier, simpler
// single-state-machine version of the same character. The rest are native
// .riv exports of that same rig, each built around one motion — unlike the
// devy-idle-loop.lottie capture DevyLottie serves for 'walk', these render
// with a real transparent background, so nothing needs a dark card behind it.
const SOURCES = {
  rig: '/assets/animations/devy-rig.riv',
  'rig-basic': '/assets/animations/devy-rig-basic.riv',
  walk: '/assets/animations/devy-walk.riv',
  'launchpad-intro': '/assets/animations/devy-launchpad-intro.riv',
  'rope-into': '/assets/animations/devy-rope-into.riv',
  'side-pop-out-intro': '/assets/animations/devy-side-pop-out-intro.riv',
  'up-down-pop-out': '/assets/animations/devy-up-down-pop-out.riv',
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

// The five entrance clips (everything but 'rig'/'rig-basic'/'walk') each
// carry two state machines on one artboard: "State Machine 1" is the shared
// face rig (Wink/Brow raise/blink booleans, same as devy-rig), "State
// Machine 2" is the actual entrance motion and takes no inputs of its own —
// it just plays through once things mount. Both need to be active, or the
// motion one never runs and only the face rig's idle pose ever shows.
//
// The `stateMachines` (plural) config option looks like the way to start two
// at once, but it's deprecated and — confirmed by actually watching a clip
// render — doesn't reliably activate both; only State Machine 1's idle pose
// ever showed. `rive.play([...])`, the instance method it deprecated in
// favor of, is what actually starts every name you give it.
const DUAL_STATE_MACHINE_CLIPS = new Set(['launchpad-intro', 'rope-into', 'side-pop-out-intro', 'up-down-pop-out'])

// Same shape as DevyLottie: a static fallback shows immediately and fades
// out once the .riv file (and its WASM runtime) reports itself loaded, so
// there's never a blank gap while either downloads.
export function DevyRive({ clip, className = '', ariaLabel, ...rest }) {
  const reducedMotion = usePrefersReducedMotion()
  const [ready, setReady] = useState(false)
  const src = SOURCES[clip]
  const isDual = DUAL_STATE_MACHINE_CLIPS.has(clip)

  const { rive, RiveComponent } = useRive({
    src,
    stateMachine: isDual ? undefined : 'State Machine 1',
    autoplay: !isDual && !reducedMotion,
    onLoad: () => setReady(true),
  })

  useEffect(() => {
    if (!rive || !isDual || reducedMotion) return
    rive.play(['State Machine 1', 'State Machine 2'])
  }, [rive, isDual, reducedMotion])

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
