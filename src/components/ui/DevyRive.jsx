import { useRive } from '@rive-app/react-webgl2';
import { useEffect, useState } from 'react';

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

export function DevyRive({ clip, className = '', ariaLabel, ...rest }) {
  const reducedMotion = usePrefersReducedMotion()
  const src = SOURCES[clip]
  const isDual = DUAL_STATE_MACHINE_CLIPS.has(clip)

  const { rive, RiveComponent } = useRive({
    src,
    stateMachine: isDual ? undefined : 'State Machine 1',
    animations: isDual ? 'Timeline 1' : undefined,
    autoplay: !reducedMotion,
  })

  useEffect(() => {
    if (!rive || !isDual) return
    rive.play('Timeline 1')
  }, [rive, isDual])

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
