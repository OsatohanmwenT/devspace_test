import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { motion } from 'motion/react'
import { ActionButton } from '../ui/ActionButton'
import { MilestoneTrophy, TROPHY_BURST_AT } from './MilestoneTrophy'
import { CONFETTI_COLORS } from '../../lib/confetti'
import { STREAK_MILESTONES } from '../../lib/streak'

// A frequent, small win, so the burst is scaled down from RoadmapTransition's
// roadmap-complete moment by default and only matches it at the top tier
// (restores === 3, day 100) — the same proportional-to-meaning rule that
// keeps RoadmapTransition from spending confetti on a region finish.
function burst(restores) {

  if (restores >= 3) {
    confetti({ particleCount: 90, spread: 75, startVelocity: 42, origin: { y: 0.32 }, colors: CONFETTI_COLORS })
    const timer = window.setTimeout(() => {
      confetti({ particleCount: 50, spread: 100, startVelocity: 28, origin: { y: 0.32 }, colors: CONFETTI_COLORS })
    }, 200)
    return () => window.clearTimeout(timer)
  }
  if (restores === 2) {
    confetti({ particleCount: 55, spread: 70, startVelocity: 32, origin: { y: 0.32 }, colors: CONFETTI_COLORS })
    return undefined
  }
  confetti({ particleCount: 28, spread: 60, startVelocity: 24, origin: { y: 0.32 }, colors: CONFETTI_COLORS })
  return undefined
}

// A day-pill row for every tier up to and including the one just earned —
// visually the same "earned" chip StreakJourneyModal's timeline uses, kept
// as a local, simpler pill here since this moment only ever shows "earned",
// never "next" or "locked".
function EarnedTiers({ throughDay }) {
  const earned = STREAK_MILESTONES.filter((tier) => tier.days <= throughDay)
  return (
    <ol className="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
      {earned.map((tier) => (
        <li
          key={tier.days}
          className="grid size-9 flex-none place-items-center rounded-lg border border-amber-400 bg-amber-400 text-[11px] font-bold text-amber-950"
        >
          {tier.days}d
        </li>
      ))}
    </ol>
  )
}

export function StreakMilestoneTransition({ milestone, onContinue, onViewJourney }) {
  const { days, restores, label } = milestone

  // The confetti goes off as the trophy locks into its badge, not on mount,
  // so the two read as one burst.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let cleanup
    const timer = window.setTimeout(() => { cleanup = burst(restores) }, TROPHY_BURST_AT * 1000)
    return () => {
      window.clearTimeout(timer)
      cleanup?.()
    }
  }, [restores, days])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onContinue()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onContinue])

  return (
    <section
      className="fixed inset-0 z-40 grid min-h-screen place-items-center overflow-y-auto bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)] px-6 py-8 text-[#f4f4f2] [[data-theme=light]_&]:bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] [[data-theme=light]_&]:text-neutral-800 max-[680px]:px-4"
      aria-label={`${days}-day streak reached`}
    >
      <motion.main
        className="grid w-full max-w-[520px] justify-items-center text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <MilestoneTrophy tier={restores} className="w-[220px] max-[680px]:w-[180px]" />

        <p className="mt-6 mb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
          Streak milestone
        </p>
        <h1 className="m-0 mb-2 font-rethink-sans text-3xl font-semibold leading-[1.3] max-[680px]:text-[26px]">
          {days} Day Streak!
        </h1>
        <p className="m-0 max-w-[40ch] text-[17px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
          {label} — you earned {restores} streak restore{restores === 1 ? '' : 's'}.
        </p>

        <div className="mt-8 w-full">
          <EarnedTiers throughDay={days} />
        </div>

        <div className="mt-6 grid w-full grid-cols-1 gap-3">
          <div className="grid gap-0.5 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-4 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
            <span className="font-rethink-sans text-[32px] font-bold leading-none text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 max-[420px]:text-[26px]">
              +{restores}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
              Streak restore{restores === 1 ? '' : 's'} earned
            </span>
          </div>
        </div>

        <div className="mt-8 grid w-full grid-cols-2 gap-3 max-[420px]:grid-cols-1 max-[420px]:gap-2.5">
          <ActionButton
            variant="neutral"
            className="min-h-11 w-full text-[15px] font-semibold"
            onClick={onViewJourney}
          >
            View streak journey
          </ActionButton>
          <ActionButton className="min-h-11 w-full text-[15px] font-semibold" onClick={onContinue} autoFocus>
            Continue
          </ActionButton>
        </div>
      </motion.main>
    </section>
  )
}
