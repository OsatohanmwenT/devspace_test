import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ActionButton } from '../ui/ActionButton'

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
      className="fixed inset-0 z-30 grid min-h-screen place-items-center bg-[var(--surface-brand-tint)] px-6 py-8 text-[var(--text-primary)] max-[680px]:px-4"
      aria-label="Your first lesson"
    >
      <main ref={welcomeRef} className="grid w-full max-w-[520px] justify-items-center text-center">
        <img data-welcome-devy className="mb-7 h-28 w-28 object-contain max-[680px]:mb-6 max-[680px]:h-24 max-[680px]:w-24" src="/assets/devy.svg" alt="Devy" />
        <p data-welcome-step className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">Your learning path</p>
        <h1 data-welcome-step className="mt-3 mb-2 font-['Rethink_Sans',Arial,sans-serif] text-[clamp(28px,4vw,38px)] font-semibold leading-[1.14]">
          Your first lesson is ready
        </h1>
        <p data-welcome-step className="m-0 text-[17px] leading-[1.55] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">
          {path.title} starts with <strong className="font-semibold text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">{lesson?.title ?? 'your first lesson'}</strong>.
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
