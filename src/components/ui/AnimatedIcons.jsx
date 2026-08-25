import { motion } from 'motion/react'

// Same outline geometry as BoltIcon/GemIcon in icons.jsx — draws the stroke
// in, then fades the fill on, per https://motion.dev/docs/react-svg-animation.
// Kept separate from those (rather than adding a variant prop to them) since
// this is a one-shot mount animation meant for a couple of header pills, not
// a general-purpose icon behavior every BoltIcon/GemIcon usage should carry.
const DRAW_TRANSITION = { pathLength: { duration: 0.55, ease: 'easeInOut' }, fillOpacity: { duration: 0.3, delay: 0.4 } }

// Once drawn, the icon isn't done for good — a small breathing pulse loops
// forever after, spaced out so it reads as "alive" rather than distracting
// in a pill that's always on screen. Starts just after the draw finishes.
const IDLE_ANIMATE = { scale: [1, 1.14, 1] }
const IDLE_TRANSITION = { duration: 1.3, delay: 0.9, repeat: Infinity, repeatDelay: 4.5, ease: 'easeInOut' }

export function AnimatedBoltIcon({ className }) {
  return (
    <motion.svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" animate={IDLE_ANIMATE} transition={IDLE_TRANSITION}>
      <motion.path
        d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={{ pathLength: 0, fillOpacity: 0 }}
        animate={{ pathLength: 1, fillOpacity: 1 }}
        transition={DRAW_TRANSITION}
      />
    </motion.svg>
  )
}

export function AnimatedGemIcon({ className }) {
  return (
    <motion.svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" animate={IDLE_ANIMATE} transition={IDLE_TRANSITION}>
      <motion.path
        d="M6 3h12l3 5-9 13L3 8l3-5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={{ pathLength: 0, fillOpacity: 0 }}
        animate={{ pathLength: 1, fillOpacity: 1 }}
        transition={DRAW_TRANSITION}
      />
    </motion.svg>
  )
}
