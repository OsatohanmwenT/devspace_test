import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ActionButton } from './ActionButton'

export function PageArrival({ eyebrow, title, body, actionLabel = 'Continue', onContinue, ariaLabel }) {
  const arrivalRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const context = gsap.context(() => {
      gsap.from('[data-page-arrival-devy]', { autoAlpha: 0, scale: 0.86, duration: 0.55, ease: 'power2.out' })
      gsap.from('[data-page-arrival-copy]', { autoAlpha: 0, y: 18, duration: 0.45, ease: 'power2.out', stagger: 0.1, delay: 0.16 })
    }, arrivalRef)

    return () => context.revert()
  }, [])

  return (
    <section className="fixed inset-0 z-40 grid min-h-screen place-items-center bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)] px-6 py-8 text-[#f4f4f2] [[data-theme=light]_&]:bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] [[data-theme=light]_&]:text-neutral-800 max-[680px]:px-4" aria-label={ariaLabel}>
      <main ref={arrivalRef} className="grid w-full max-w-[520px] justify-items-center text-center">
        <img data-page-arrival-devy className="mb-7 h-28 w-28 object-contain max-[680px]:mb-6 max-[680px]:h-24 max-[680px]:w-24" src="/assets/devy.svg" alt="Devy" />
        <p data-page-arrival-copy className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">{eyebrow}</p>
        <h1 data-page-arrival-copy className="mt-3 mb-2 font-rethink-sans text-[clamp(28px,4vw,38px)] font-semibold leading-[1.14]">{title}</h1>
        <p data-page-arrival-copy className="m-0 text-[17px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">{body}</p>
        <ActionButton data-page-arrival-copy className="mt-9 min-h-[52px] w-[min(100%,350px)] text-[15px] font-semibold" onClick={onContinue} autoFocus>{actionLabel}</ActionButton>
      </main>
    </section>
  )
}
