import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { DevyMood } from '../ui/DevyMood'

// Shared by the mid-lesson concept hand-off and the end-of-lesson screen. They
// look alike but are not the same event, so the mood is the caller's call:
// finishing a lesson is worth a celebration, moving between concepts is not.
export function ConceptTransition({ eyebrow, title, body, mood = 'neutral' }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
      timeline
        .from('[data-transition-mark]', { autoAlpha: 0, y: 10, scale: 0.85, duration: 0.4, ease: 'back.out(2)' })
        .from('[data-transition-eyebrow]', { autoAlpha: 0, y: 8, duration: 0.3 }, '-=0.15')
        .from('[data-transition-title]', { autoAlpha: 0, y: 10, duration: 0.35 }, '-=0.15')
        .from('[data-transition-body]', { autoAlpha: 0, y: 8, duration: 0.35 }, '-=0.2')

      // The ongoing cheer only starts once GSAP is done writing to the mark —
      // starting it any earlier is exactly the conflict this component avoids.
      if (mood === 'celebrating') {
        timeline.call(() => {
          document.querySelector('[data-transition-mark]')?.classList.add('devy-cheer-loop')
        })
      }
    }, rootRef)

    return () => context.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="h-full overflow-auto bg-[#1f1f1f] [[data-theme=light]_&]:bg-white"
      aria-labelledby="lesson-transition-title"
    >
      <div className="grid min-h-full place-items-center px-7 py-10 max-[720px]:px-5 max-[720px]:py-6">
        <div className="grid w-[min(100%,720px)] justify-items-center text-center">
          {/* GSAP drives this entrance directly rather than through DevyMood's
              own mood animation — the two would fight over the same transform
              and opacity properties (CSS animations win that fight over an
              inline style, so GSAP's tween would visibly never move). The
              celebrating "cheer" loop picks up once the entrance settles. */}
          <div data-transition-mark className="mb-5 size-[140px] max-[720px]:mb-3 max-[720px]:size-[104px]">
            <DevyMood mood={mood} animate={false} className="h-full w-full" />
          </div>
          <span data-transition-eyebrow className="mb-3 text-[11px] font-bold uppercase tracking-[0.11em] text-[#88bdf2] [[data-theme=light]_&]:text-[#07389b]">
            {eyebrow}
          </span>
          <h1
            data-transition-title
            id="lesson-transition-title"
            className="m-0 max-w-[20ch] text-balance font-rethink-sans text-[clamp(25px,2.7vw,34px)] font-semibold leading-[1.12] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 max-[720px]:text-[24px]"
          >
            {title}
          </h1>
          <p data-transition-body className="mt-4 mb-0 max-w-[48ch] text-balance text-base leading-[1.6] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968] max-[720px]:mt-3 max-[720px]:text-[15px]">
            {body}
          </p>
        </div>
      </div>
    </section>
  )
}
