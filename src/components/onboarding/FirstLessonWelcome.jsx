import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion } from 'motion/react'
import { CASCADE, SWAP } from '../../lib/onboardingMotion'
import { ActionButton } from '../ui/ActionButton'
import { DevyLottie } from '../ui/DevyLottie'
import { WordReveal } from './motion/WordReveal'

export function FirstLessonWelcome({ path, lesson, onBegin }) {
  const welcomeRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    // Same cascade (P2) as the rest of onboarding, so the handoff from the
    // generating screen reads as one more step of the same flow.
    const context = gsap.context(() => {
      gsap.from('[data-welcome-devy]', { autoAlpha: 0, scale: 0.86, duration: 0.55, ease: 'power2.out' })
      gsap.from('[data-welcome-step]', { autoAlpha: 0, y: CASCADE.y, filter: `blur(${CASCADE.blur}px)`, duration: CASCADE.duration, ease: CASCADE.ease, stagger: CASCADE.stagger, delay: 0.16, clearProps: 'filter' })
    }, welcomeRef)

    return () => context.revert()
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: SWAP.in, ease: SWAP.ease }}
      className="fixed inset-0 z-30 grid min-h-screen place-items-center bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#3a2d0d_100%)] px-6 py-8 text-[#f4f4f2] [[data-theme=light]_&]:bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#fff1bd_100%)] [[data-theme=light]_&]:text-neutral-800 max-[680px]:px-4"
      aria-label="Your first lesson"
    >
      <main ref={welcomeRef} className="grid w-full max-w-[520px] justify-items-center text-center">
        {/* The route just finished generating — Devy waves the learner in.
            The GSAP entrance below owns the reveal, so the clip itself has no
            entrance motion of its own. */}
        <DevyLottie
          data-welcome-devy
          clip="wave"
          loop={false}
          ariaLabel="Devy"
          className="mb-7 h-28 w-28 max-[680px]:mb-6 max-[680px]:h-24 max-[680px]:w-24"
        />
        <p data-welcome-step className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#f7c948] [[data-theme=light]_&]:text-[#946200]">Your learning path</p>
        <h1 data-welcome-step className="mt-3 mb-2 font-rethink-sans text-[clamp(28px,4vw,38px)] font-semibold leading-[1.14]">
          Your first lesson is ready
        </h1>
        <p data-welcome-step className="m-0 text-[17px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
          {path.title} starts with <WordReveal as="strong" text={lesson?.title ?? 'your first lesson'} delay={0.5} className="font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800" />.
        </p>
        <ActionButton
          data-welcome-step
          className="mt-9 min-h-[52px] w-[min(100%,350px)] border-[#facc15]! bg-[#eab308]! text-[#221b08]! shadow-[0_3px_0_#a16207]! hover:bg-[#facc15]! focus-visible:outline-[#fef08a]! text-[15px] font-semibold"
          onClick={onBegin}
        >
          Let’s begin
        </ActionButton>
      </main>
    </motion.section>
  )
}
