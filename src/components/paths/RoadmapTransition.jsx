import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { motion } from 'motion/react'
import { ActionButton } from '../ui/ActionButton'
import { DevyMood } from '../ui/DevyMood'
import { CheckIcon } from '../ui/icons'

// The app's own accent palette rather than confetti's rainbow default, so the
// burst reads as this product's celebration and not a generic effect.
const CONFETTI_COLORS = ['#4169e1', '#04adc0', '#8b7cf6', '#f59e0b', '#6ee7a8']

// One full-screen handoff for both levels of roadmap progression — unlocking
// the next region and finishing the whole roadmap — so a milestone always
// gets a dedicated moment and a clear next decision before the learner is
// dropped back onto LearningPathDetail or into a fresh lesson. The two levels
// are not equally significant, though: finishing a region is progress,
// finishing the whole roadmap is the payoff — Devy celebrates, confetti
// bursts, and the stats get real visual weight only for the latter, the same
// way a courseful of small "keep going" moments builds toward one that
// actually stops to celebrate (see Duolingo/Mimo course-complete screens vs.
// their everyday lesson-complete toasts).
export function RoadmapTransition({ transition, onStartLesson, onViewRoadmap, onExploreRoadmaps, onReviewRoadmap }) {
  const isRoadmapComplete = transition.type === 'roadmap-complete'
  const { completedRegion } = transition
  const nextRegion = isRoadmapComplete ? null : transition.nextRegion
  const hasPrimary = isRoadmapComplete || transition.launchable
  // "View roadmap" / "Review this roadmap" is the safe landing spot in every
  // case — Escape always resolves to it, whether or not a primary exists.
  const safeAction = isRoadmapComplete ? onReviewRoadmap : onViewRoadmap
  const primaryAction = isRoadmapComplete ? onExploreRoadmaps : () => onStartLesson(transition.firstLesson.id)
  const primaryLabel = isRoadmapComplete ? 'Explore roadmaps' : `Start ${transition.firstLesson?.title ?? ''}`

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') safeAction()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [safeAction])

  // One burst on arrival, one smaller follow-up a beat later — a single shot
  // reads as a blip, two reads as a moment. Roadmap-complete only: a region
  // finishing is progress, not the payoff this is reserved for.
  useEffect(() => {
    if (!isRoadmapComplete) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    confetti({ particleCount: 90, spread: 75, startVelocity: 42, origin: { y: 0.32 }, colors: CONFETTI_COLORS })
    const timer = window.setTimeout(() => {
      confetti({ particleCount: 50, spread: 100, startVelocity: 28, origin: { y: 0.32 }, colors: CONFETTI_COLORS })
    }, 200)
    return () => window.clearTimeout(timer)
  }, [isRoadmapComplete])

  return (
    <section
      className="fixed inset-0 z-40 grid min-h-screen place-items-center overflow-y-auto bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)] px-6 py-8 text-[#f4f4f2] [[data-theme=light]_&]:bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] [[data-theme=light]_&]:text-neutral-800 max-[680px]:px-4"
      aria-label={isRoadmapComplete ? `${transition.pathTitle} complete` : `${completedRegion.title} complete`}
    >
      <motion.main
        className="grid w-full max-w-[520px] justify-items-center text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {/* Finishing a region is still a real win, not a pit stop — Duolingo and
            Mimo both give a unit/section finish its own positive beat, they just
            don't spend confetti and a bigger mascot on it the way a finished
            course gets. Same mood here, smaller stage, no confetti below.
            DevyMood drives its own entrance + loop via CSS (see devy-celebrate
            in styles.css) — wrapping it in another transform/opacity tween here
            would fight that animation for the same properties. */}
        <div aria-hidden="true" className={isRoadmapComplete ? 'h-36 w-36' : 'h-28 w-28'}>
          <DevyMood mood="celebrating" className="h-full w-full" />
        </div>

        <p className="mt-5 mb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
          {isRoadmapComplete ? 'Roadmap complete' : 'Region complete'}
        </p>

        {isRoadmapComplete ? (
          <>
            <h1 className="m-0 mb-2 font-rethink-sans text-3xl font-semibold leading-[1.3] max-[680px]:text-[26px]">
              {transition.pathTitle}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#168a46]/15 px-3 py-1 text-[13px] font-semibold text-[#6ee7a8] [[data-theme=light]_&]:text-[#168a46]">
              <CheckIcon className="size-3.5" />
              100% complete
            </span>
          </>
        ) : (
          <>
            <h1 className="m-0 mb-2 font-rethink-sans text-3xl font-semibold leading-[1.3] max-[680px]:text-[26px]">
              {completedRegion.title}, done!
            </h1>
            {/* "3 of 3 lessons finished" is true but says nothing new right
                after a lesson-complete recap already covered the numbers —
                this screen's actual job is placing that region in the path,
                so it recaps what it covered instead. */}
            <p className="m-0 max-w-[40ch] text-[17px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
              {completedRegion.summary}
            </p>
          </>
        )}

        {isRoadmapComplete ? (
          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <div className="grid gap-0.5 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-4 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
              <span className="font-rethink-sans text-[32px] font-bold leading-none text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 max-[420px]:text-[26px]">
                {transition.regionsCompleted}<span className="text-[15px] font-medium text-[#7d7d80]">/{transition.regionsTotal}</span>
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Regions complete</span>
            </div>
            <div className="grid gap-0.5 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-4 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
              <span className="font-rethink-sans text-[32px] font-bold leading-none text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 max-[420px]:text-[26px]">
                {transition.lessonsCompleted}<span className="text-[15px] font-medium text-[#7d7d80]">/{transition.lessonsTotal}</span>
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Lessons complete</span>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex w-full items-center gap-4 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-4 text-left [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
            <img src={nextRegion.image} alt="" aria-hidden="true" className="h-14 w-14 flex-none object-contain" />
            <div className="min-w-0">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[.08em] text-[#8b7cf6]">
                Region {nextRegion.index + 1}
              </p>
              <h2 className="m-0 mt-0.5 truncate font-rethink-sans text-[16px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
                {nextRegion.title}
              </h2>
              <p className="m-0 mt-0.5 line-clamp-2 text-[13px] leading-[1.4] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
                {nextRegion.summary}
              </p>
              <p className="m-0 mt-1.5 text-[12px] font-medium text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]">
                {transition.launchable ? `First lesson: ${transition.firstLesson.title}` : 'Coming soon'}
              </p>
            </div>
          </div>
        )}

        <div className={`mt-8 grid w-full gap-3 max-[420px]:gap-2.5 ${hasPrimary ? 'grid-cols-2 max-[520px]:grid-cols-1' : 'grid-cols-1'}`}>
          {hasPrimary && (
            <ActionButton className="min-h-11 w-full text-[15px] font-semibold" onClick={primaryAction} autoFocus>
              {primaryLabel}
            </ActionButton>
          )}
          <ActionButton
            variant="neutral"
            className="min-h-11 w-full text-[15px] font-semibold"
            onClick={safeAction}
            autoFocus={!hasPrimary}
          >
            {isRoadmapComplete ? 'Review this roadmap' : 'View roadmap'}
          </ActionButton>
        </div>
      </motion.main>
    </section>
  )
}
