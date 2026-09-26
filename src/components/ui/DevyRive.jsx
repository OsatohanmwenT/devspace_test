import { useRive } from '@rive-app/react-webgl2';
import { useEffect, useRef, useState } from 'react';

// Native .riv exports of the Devy rig, each built around one entrance
// motion, rendered with a real transparent background.
const SOURCES = {
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

// These clips carry their entrance motion as a raw linear animation
// ("Timeline 1") rather than a state machine — driving either state machine
// never produced a visible frame change under direct pixel-diffing, so they
// play "Timeline 1" directly instead.
const DUAL_STATE_MACHINE_CLIPS = new Set(['launchpad-intro', 'rope-into', 'side-pop-out-intro', 'up-down-pop-out'])

// Not every export names its entrance "Timeline 1" — the rope file's only
// timeline is "Timeline 4" (alongside Wink / Brow raise / blink), and asking
// for a name the file doesn't have plays nothing and leaves the first frame.
//
// `startAt` skips dead air: the rope timeline is 10s, but its first ~4s are
// just the empty rope dangling — Devy slides down between 4.0s and 4.8s, then
// swings. `restAt` is a settled pose to hold when motion is reduced.
const ENTRANCE = {
  'rope-into': { animation: 'Timeline 4', startAt: 3.4, restAt: 6 },
  'up-down-pop-out': { animation: 'Timeline 2' },
}

// `onReady` fires the moment this clip actually starts playing (or, under
// reduced motion, the moment it's scrubbed to its resting frame) — not on
// mount. The .riv asset loads async (fetch + WASM instantiate), so a caller
// that times a follow-up beat off mount instead of this can end up
// advancing before Devy ever appears on a cold cache. See WarmUpIntro.
export function DevyRive({ clip, className = '', ariaLabel, onReady, ...rest }) {
  const reducedMotion = usePrefersReducedMotion()
  const src = SOURCES[clip]
  const isDual = DUAL_STATE_MACHINE_CLIPS.has(clip)
  const { animation: entrance = 'Timeline 1', startAt = 0, restAt } = ENTRANCE[clip] ?? {}
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  const { rive, RiveComponent } = useRive({
    src,
    stateMachine: isDual ? undefined : 'State Machine 1',
    animations: isDual ? entrance : undefined,
    autoplay: false,
  })

  useEffect(() => {
    if (!rive) return
    if (!isDual) {
      if (!reducedMotion) rive.play()
      onReadyRef.current?.()
      return
    }
    if (reducedMotion) {
      if (restAt != null) rive.scrub(entrance, restAt)
      onReadyRef.current?.()
      return
    }
    if (startAt) rive.scrub(entrance, startAt)
    rive.play(entrance)
    onReadyRef.current?.()
  }, [rive, isDual, entrance, startAt, restAt, reducedMotion])

  if (!src) return null

  return (
    <div
      className={`relative ${className}`}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : 'true'}
      {...rest}
    >
      <RiveComponent className="relative h-full w-full" />
    </div>
  )
}
