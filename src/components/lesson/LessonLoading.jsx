import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function LessonLoading({ title }) {
  const loaderRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const context = gsap.context(() => {
      gsap.from('[data-lesson-loader-devy]', { autoAlpha: 0, scale: 0.86, duration: 0.36, ease: 'power2.out' })
      gsap.from('[data-lesson-loader-copy]', { autoAlpha: 0, y: 14, duration: 0.3, ease: 'power2.out', stagger: 0.08, delay: 0.1 })
    }, loaderRef)

    return () => context.revert()
  }, [])

  return (
    <section
      className="fixed inset-0 z-30 grid min-h-screen place-items-center bg-[var(--surface-brand-tint)] px-6 py-8 text-[var(--text-primary)] max-[680px]:px-4"
      aria-label="Preparing your lesson"
      aria-live="polite"
      aria-busy="true"
    >
      <main ref={loaderRef} className="grid w-full max-w-[520px] justify-items-center text-center">
        <img data-lesson-loader-devy className="mb-7 h-28 w-28 object-contain max-[680px]:mb-6 max-[680px]:h-24 max-[680px]:w-24" src="/assets/devy.svg" alt="" />
        <p data-lesson-loader-copy className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">Preparing your lesson</p>
        <h1 data-lesson-loader-copy className="mt-3 mb-0 font-['Rethink_Sans',Arial,sans-serif] text-[clamp(28px,4vw,38px)] font-semibold leading-[1.14]">
          {title}
        </h1>
      </main>
    </section>
  )
}
