import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ActionButton } from '../ui/ActionButton'
import { DevyMood } from '../ui/DevyMood'

export function FirstLessonWelcome({ path, lesson, onBegin }) {
  const welcomeRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const context = gsap.context(() => {
      gsap.from('[data-welcome-devy]', { autoAlpha: 0, scale: 0.86, duration: 0.55, ease: 'power2.out' })
      gsap.from('[data-welcome-step]', { autoAlpha: 0, y: 18, duration: 0.45, ease: 'power2.out', stagger: 0.1, delay: 0.16 })
    }, welcomeRef)

    return () => context.revert()
  }, [])

  return (
    <section
      className="fixed inset-0 z-30 grid min-h-screen place-items-center bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)] px-6 py-8 text-[#f4f4f2] [[data-theme=light]_&]:bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] [[data-theme=light]_&]:text-neutral-800 max-[680px]:px-4"
      aria-label="Your first lesson"
    >
      <main ref={welcomeRef} className="grid w-full max-w-[520px] justify-items-center text-center">
        {/* The route just finished generating — Devy is pleased with it. The
            GSAP entrance below owns the reveal, so the mood art skips its own. */}
        <DevyMood
          data-welcome-devy
          mood="celebrating"
          animate={false}
          alt="Devy"
          className="mb-7 h-28 w-28 max-[680px]:mb-6 max-[680px]:h-24 max-[680px]:w-24"
        />
        <p data-welcome-step className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">Your learning path</p>
        <h1 data-welcome-step className="mt-3 mb-2 font-rethink-sans text-[clamp(28px,4vw,38px)] font-semibold leading-[1.14]">
          Your first lesson is ready
        </h1>
        <p data-welcome-step className="m-0 text-[17px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
          {path.title} starts with <strong className="font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{lesson?.title ?? 'your first lesson'}</strong>.
        </p>
        <ActionButton
          data-welcome-step
          className="mt-9 min-h-[52px] w-[min(100%,350px)] text-[15px] font-semibold"
          onClick={onBegin}
        >
          Let’s begin
        </ActionButton>
      </main>
    </section>
  )
}
