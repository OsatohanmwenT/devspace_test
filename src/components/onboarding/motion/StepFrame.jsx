import { AnimatePresence, motion } from 'motion/react'
import { SWAP } from '../../../lib/onboardingMotion'

// P1 — step swap. The outgoing screen dims and shrinks in place (no slide —
// the header and footer around it don't move, so sliding would read as the
// content tearing away from its frame), then the incoming screen mounts and
// runs its own build-in. `direction` flips the incoming scale so going back
// feels like stepping out rather than pressing further in.
//
// `AnimatePresence` needs the child keyed on the screen identity; the parent
// passes `stepKey` so RouteReview's test mode and the generating screen count
// as their own screens too.
export function StepFrame({ stepKey, direction = 1, onExitComplete, className = '', children }) {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={onExitComplete}>
      <motion.div
        key={stepKey}
        className={className}
        initial={reduced ? false : { opacity: 0, scale: direction < 0 ? SWAP.scaleBackIn : SWAP.scaleOut }}
        animate={{ opacity: 1, scale: 1, transition: { duration: SWAP.in, ease: SWAP.ease } }}
        exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0.08, scale: direction < 0 ? SWAP.scaleBackIn : SWAP.scaleOut, transition: { duration: SWAP.out, ease: 'easeIn' } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
