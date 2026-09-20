import { gsap } from 'gsap'
import { useLayoutEffect } from 'react'

// One vocabulary for the whole onboarding flow. Every screen pulls its timing
// from here so a step swap, a cascade, or a word reveal feels the same
// wherever it appears — six primitives, each used in a specific place, rather
// than one fade reused everywhere.
//
// P1 — step swap: the outgoing screen dims and shrinks, the incoming one
//      builds itself in. No slide; the header and footer stay put.
export const SWAP = { out: 0.22, in: 0.42, scaleOut: 0.96, scaleBackIn: 1.04, ease: [0.22, 0.61, 0.36, 1] }
// P2 — build-in cascade: hero → title → subtitle → content, blurred-in.
export const CASCADE = { stagger: 0.08, y: 14, blur: 6, duration: 0.42, ease: 'power3.out', maxIndividual: 8 }
// P3 — word reveal on hero titles only.
export const WORD = { stagger: 0.06, y: 8, blur: 4, duration: 0.38, ease: 'power3.out' }
// P4 — card fan: a stack arrives from one point and fans out.
export const FAN = { angle: 9, spread: 40, rise: 12, scaleFrom: 0.6, duration: 0.55, ease: 'back.out(1.4)', stagger: 0.09 }
// P5 — panel draw: a tinted header draws down, then its rows land in turn.
export const DRAW = { header: 0.38, rowStagger: 0.07, rowY: 16, ease: 'power3.out' }
// P6 — select pop.
export const POP = { scale: 1.035, duration: 0.26, siblingOpacity: 0.75 }

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Runs the P2 cascade over every `[data-build]` inside `rootRef`, in DOM
// order unless a `data-build-order` says otherwise. Items past
// `CASCADE.maxIndividual` land together with the last individually-staggered
// one so a 14-chip screen doesn't keep the learner waiting. Re-runs whenever
// `deps` change (e.g. a new step id); no-ops under reduced motion.
export function useBuildIn(rootRef, deps = [], { delay = 0 } = {}) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reducedMotion()) return undefined

    const targets = Array.from(root.querySelectorAll('[data-build]'))
      .sort((a, b) => Number(a.dataset.buildOrder ?? 0) - Number(b.dataset.buildOrder ?? 0))
    if (targets.length === 0) return undefined

    const context = gsap.context(() => {
      gsap.from(targets, {
        autoAlpha: 0,
        y: CASCADE.y,
        filter: `blur(${CASCADE.blur}px)`,
        duration: CASCADE.duration,
        ease: CASCADE.ease,
        delay,
        stagger: (index) => Math.min(index, CASCADE.maxIndividual) * CASCADE.stagger,
        clearProps: 'filter',
      })
    }, root)

    return () => context.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
