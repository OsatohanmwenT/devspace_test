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
      className="fixed inset-0 z-30 grid min-h-screen place-items-center bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)] px-6 py-8 text-[#f4f4f2] [[data-theme=light]_&]:bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] [[data-theme=light]_&]:text-[#202020] max-[680px]:px-4"
      aria-label="Preparing your lesson"
      aria-live="polite"
      aria-busy="true"
    >
      <main ref={loaderRef} className="grid w-full max-w-[520px] justify-items-center text-center">
        <img data-lesson-loader-devy className="mb-7 h-28 w-28 object-contain max-[680px]:mb-6 max-[680px]:h-24 max-[680px]:w-24" src="/assets/devy.svg" alt="" />
        <p data-lesson-loader-copy className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">Preparing your lesson</p>
        <h1 data-lesson-loader-copy className="mt-3 mb-0 font-['Rethink_Sans',Arial,sans-serif] text-[clamp(28px,4vw,38px)] font-semibold leading-[1.14]">
          {title}
        </h1>
      </main>
    </section>
  )
}
