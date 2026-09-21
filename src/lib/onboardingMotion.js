import { gsap } from 'gsap'
import { useLayoutEffect } from 'react'

// One vocabulary for the whole onboarding flow. Every screen pulls its timing
// from here so a step swap, a cascade, or a word reveal feels the same
// wherever it appears — six primitives, each used in a specific place, rather
// than one fade reused everywhere.
//
// P1 — step swap: the outgoing screen dims and shrinks, the incoming one
//      builds itself in. No slide; the header and footer stay put.
export const SWAP = { out: 0.2, in: 0.3, scaleOut: 0.96, scaleBackIn: 1.04, ease: [0.22, 0.61, 0.36, 1] }
// P2 — build-in. Four flavours, picked per screen rather than defaulted to
// one, so the flow doesn't read as the same fade-up repeated everywhere:
//   `pop`     — a short rise with a touch of overshoot. The default; reads
//               as "this just arrived".
//   `scale`   — grows from slightly small with no vertical travel, like a
//               card materialising in place. Used for result/summary blocks
//               that should feel settled rather than arriving from off-page.
//   `bounce`  — a bigger, springier scale-up, reserved for the one or two
//               genuinely celebratory moments (the welcome screen).
//   `cascade` — staggers children in order and is reserved for lists, where
//               the sequence itself carries meaning.
// None blur — that read as heavy repeated across a dozen screens.
export const POP_IN = { y: 10, scale: 0.97, duration: 0.34, ease: 'back.out(1.4)' }
export const SCALE_IN = { scale: 0.92, duration: 0.32, ease: 'power2.out' }
export const BOUNCE_IN = { scale: 0.8, duration: 0.5, ease: 'back.out(1.8)' }
export const CASCADE = { stagger: 0.04, y: 10, duration: 0.3, ease: 'power2.out', maxIndividual: 8 }
// P3 — word reveal on hero titles only.
export const WORD = { stagger: 0.05, y: 6, duration: 0.32, ease: 'power2.out' }
// P4 — card fan: a stack arrives from one point and fans out.
export const FAN = { angle: 9, spread: 40, rise: 12, scaleFrom: 0.6, duration: 0.55, ease: 'back.out(1.4)', stagger: 0.09 }
// P5 — panel draw: a tinted header draws down, then its rows land in turn.
export const DRAW = { header: 0.38, rowStagger: 0.07, rowY: 16, ease: 'power3.out' }
// P6 — select pop.
export const POP = { scale: 1.035, duration: 0.26, siblingOpacity: 0.75 }

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Runs the P2 build-in over every `[data-build]` inside `rootRef`. In `pop`
// mode (default) they all arrive together; in `cascade` mode they arrive in
// DOM order unless a `data-build-order` says otherwise, with items past
// `CASCADE.maxIndividual` landing together so a long list doesn't keep the
// learner waiting. Re-runs whenever `deps` change; no-ops under reduced
// motion.
export function useBuildIn(rootRef, deps = [], { delay = 0, mode = 'pop' } = {}) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reducedMotion()) return undefined

    const targets = Array.from(root.querySelectorAll('[data-build]'))
      .sort((a, b) => Number(a.dataset.buildOrder ?? 0) - Number(b.dataset.buildOrder ?? 0))
    if (targets.length === 0) return undefined

    const context = gsap.context(() => {
      if (mode === 'cascade') {
        gsap.from(targets, {
          autoAlpha: 0,
          y: CASCADE.y,
          duration: CASCADE.duration,
          ease: CASCADE.ease,
          delay,
          stagger: (index) => Math.min(index, CASCADE.maxIndividual) * CASCADE.stagger,
        })
      } else if (mode === 'scale') {
        gsap.from(targets, {
          autoAlpha: 0,
          scale: SCALE_IN.scale,
          duration: SCALE_IN.duration,
          ease: SCALE_IN.ease,
          delay,
        })
      } else if (mode === 'bounce') {
        gsap.from(targets, {
          autoAlpha: 0,
          scale: BOUNCE_IN.scale,
          duration: BOUNCE_IN.duration,
          ease: BOUNCE_IN.ease,
          delay,
        })
      } else {
        gsap.from(targets, {
          autoAlpha: 0,
          y: POP_IN.y,
          scale: POP_IN.scale,
          duration: POP_IN.duration,
          ease: POP_IN.ease,
          delay,
        })
      }
    }, root)

    return () => context.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
