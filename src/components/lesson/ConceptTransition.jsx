import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ActionButton } from '../ui/ActionButton'
import { DevyLottie } from '../ui/DevyLottie'
import { DevyMood } from '../ui/DevyMood'

// Shared by the mid-lesson concept hand-off and the end-of-lesson screen. They
// look alike but are not the same event, so the mood is the caller's call:
// finishing a lesson is worth a celebration, moving between concepts is not.
// The last tap anywhere in the app, so the curtain can burst from the
// Continue button the learner actually pressed. Keyboard use (or a stale tap)
// falls back to the bottom centre, where that button sits.
let lastTap = null
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    (event) => {
      lastTap = { x: event.clientX, y: event.clientY, at: Date.now() }
    },
    { capture: true, passive: true },
  )
}

// Where the one-off sparkle burst lands around Devy: [x, y] in px from his
// centre, spread so it reads as a small pop rather than confetti.
const SPARKS = [[-86, -52], [84, -64], [-104, 18], [100, 8], [-58, 70], [64, 66]]

export function ConceptTransition({ eyebrow, title, body, mood = 'neutral', clip, badge, action, onExit }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const root = rootRef.current
    const bounds = root.getBoundingClientRect()
    const tap = lastTap && Date.now() - lastTap.at < 1500 ? lastTap : null
    const burstX = tap ? tap.x - bounds.left : bounds.width / 2
    const burstY = tap ? tap.y - bounds.top : bounds.height
    const mark = root.querySelector('[data-transition-mark]')?.getBoundingClientRect()
    const openX = mark ? mark.left + mark.width / 2 - bounds.left : bounds.width / 2
    const openY = mark ? mark.top + mark.height / 2 - bounds.top : bounds.height * 0.4
    // Big enough to reach every corner from wherever the circle starts.
    const cover = Math.hypot(Math.max(burstX, bounds.width - burstX), Math.max(burstY, bounds.height - burstY))
    const reveal = Math.hypot(Math.max(openX, bounds.width - openX), Math.max(openY, bounds.height - openY))

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
      timeline
        // The curtain: two blue waves burst from the tapped Continue button —
        // a light one leading, a deeper one a beat behind — then open outward
        // from where Devy stands, handing straight over to him landing.
        .set('[data-transition-curtain]', { '--open-x': `${openX}px`, '--open-y': `${openY}px`, '--hole': '0px' })
        .fromTo(
          '[data-transition-curtain]',
          { clipPath: `circle(0px at ${burstX}px ${burstY}px)` },
          { clipPath: `circle(${cover}px at ${burstX}px ${burstY}px)`, duration: 0.5, ease: 'power3.inOut', stagger: 0.08 },
        )
        .to('[data-transition-curtain]', { '--hole': `${reveal}px`, duration: 0.65, ease: 'power3.in', stagger: -0.06 }, '+=0.05')
        .set('[data-transition-curtain]', { autoAlpha: 0 })
        .from('[data-transition-glow]', { autoAlpha: 0, scale: 0.6, duration: 0.6 }, '-=0.45')
        .from('[data-transition-mark]', { autoAlpha: 0, y: 10, scale: 0.85, duration: 0.4, ease: 'back.out(2)' }, '<')
        .addLabel('landed', '-=0.1')
        // The sparkle burst plays alongside the text coming in, anchored to
        // Devy landing — not queued ahead of it.
        .fromTo(
          '[data-transition-spark]',
          { autoAlpha: 0, x: 0, y: 0, scale: 0.2 },
          {
            autoAlpha: 1,
            x: (index) => SPARKS[index][0],
            y: (index) => SPARKS[index][1],
            scale: 1,
            duration: 0.5,
            ease: 'power3.out',
            stagger: 0.03,
          },
          'landed',
        )
        .to('[data-transition-spark]', { autoAlpha: 0, scale: 0.4, duration: 0.5, stagger: 0.03 }, 'landed+=0.45')

      if (mood !== 'celebrating') {
        timeline
          .from('[data-transition-eyebrow]', { autoAlpha: 0, y: 8, duration: 0.3 }, 'landed')
          .from('[data-transition-title]', { autoAlpha: 0, y: 10, duration: 0.35 }, 'landed+=0.12')
          .from('[data-transition-body]', { autoAlpha: 0, y: 8, duration: 0.35 }, 'landed+=0.24')
          .from('[data-transition-extra]', { autoAlpha: 0, y: 8, duration: 0.35, stagger: 0.08 }, 'landed+=0.36')
      }

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
      className="relative h-full overflow-auto bg-[#1f1f1f] [[data-theme=light]_&]:bg-white"
      aria-labelledby="lesson-transition-title"
    >
      {['bg-[#93c5fd]', 'bg-[#2563eb] [[data-theme=light]_&]:bg-[#3b82f6]'].map((tone) => (
        <div
          key={tone}
          data-transition-curtain
          aria-hidden="true"
          className={`transition-curtain pointer-events-none absolute inset-0 z-20 motion-reduce:hidden ${tone}`}
          style={{ clipPath: 'circle(0px at 50% 100%)' }}
        />
      ))}
      {onExit && (
        <button
          type="button"
          className="absolute top-4 left-4 z-10 grid size-11 place-items-center rounded-lg border-0 bg-transparent text-[#9a9a9d] hover:bg-[#262626] hover:text-[#f4f4f2] focus-visible:outline-3 focus-visible:outline-[#93c5fd] [[data-theme=light]_&]:text-[#8a8a86] [[data-theme=light]_&]:hover:bg-[#f5f5f5] [[data-theme=light]_&]:hover:text-neutral-700"
          onClick={onExit}
          aria-label="Exit lesson"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      )}
      <div className="grid min-h-full place-items-center px-7 py-10 max-[720px]:px-5 max-[720px]:py-6">
        <div className="grid w-[min(100%,720px)] justify-items-center text-center">
          {/* GSAP drives this entrance directly rather than through DevyMood's
              own mood animation — the two would fight over the same transform
              and opacity properties (CSS animations win that fight over an
              inline style, so GSAP's tween would visibly never move). The
              celebrating "cheer" loop picks up once the entrance settles. */}
          <div className="relative mb-5 grid place-items-center max-[720px]:mb-3">
          <span
            data-transition-glow
            aria-hidden="true"
            className="pointer-events-none absolute size-[300px] rounded-full bg-[radial-gradient(circle,rgba(102,153,236,0.28),rgba(102,153,236,0.08)_45%,transparent_70%)] [[data-theme=light]_&]:bg-[radial-gradient(circle,rgba(59,130,246,0.2),rgba(59,130,246,0.06)_45%,transparent_70%)] max-[720px]:size-[220px]"
          />
          {SPARKS.map((_, index) => (
            <span
              key={index}
              data-transition-spark
              aria-hidden="true"
              className="pointer-events-none invisible absolute size-3 rotate-45 rounded-[3px] bg-amber-400 even:size-2 even:bg-[#6699ec]"
            />
          ))}
          <div data-transition-mark className="relative size-[140px] max-[720px]:size-[104px]">
            {clip ? (
              <DevyLottie clip={clip} className="h-full w-full" />
            ) : (
              <DevyMood mood={mood} animate={false} className="h-full w-full" />
            )}
            {/* A small accent rather than a second mascot — this keeps Devy as
                the one consistent face across every transition, while still
                marking a skill check as a different kind of beat than a
                concept-complete or lesson-complete screen. */}
            {badge && (
              <span className="absolute -right-1 -bottom-1 grid size-11 place-items-center rounded-2xl border-2 border-[#1f1f1f] bg-[#2f6fed] text-white shadow-[0_6px_14px_rgba(0,0,0,.28)] [[data-theme=light]_&]:border-white max-[720px]:size-9">
                {badge}
              </span>
            )}
          </div>
          </div>
          {eyebrow && (
            <span data-transition-eyebrow className="mb-3 text-[13px] font-semibold text-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb]">
              {eyebrow}
            </span>
          )}
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
          {action && (
            <ActionButton
              data-transition-extra
              variant="primary"
              className="mt-9 min-h-12 min-w-[260px] px-10 text-[16px] font-semibold max-[720px]:mt-7 max-[720px]:w-full"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </ActionButton>
          )}
        </div>
      </div>
    </section>
  )
}
