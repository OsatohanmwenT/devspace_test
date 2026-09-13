import { motion } from 'motion/react'
import { ActionButton } from '../ui/ActionButton'
import { DevyMood } from '../ui/DevyMood'
import { Lightning } from '../ui/Lightning'

// The payoff for crossing a streak milestone (lib/streak.js's STREAK_MILESTONES) —
// a full-screen moment, unlike the low-contrast StreakJourneyModal drawer which
// is deliberately built to be consulted, not arrived at. Lightning sits behind
// a dark scrim so the bolt reads as atmosphere rather than fighting the streak
// count for attention; prefers-reduced-motion mounts no canvas at all (see
// Lightning.jsx), leaving just the gradient behind the same content.
export function StreakMilestoneCelebration({ milestone, streakDays, onClose }) {
  return (
    <section
      className="fixed inset-0 z-40 grid min-h-screen place-items-center overflow-hidden bg-[#0b0b0d] text-[#f4f4f2]"
      aria-label={`${streakDays} day streak — ${milestone.label} milestone reached`}
    >
      <div className="absolute inset-0 opacity-70">
        <Lightning hue={38} speed={1.1} intensity={0.6} size={1.4} />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_0%,#0b0b0d_72%)]" />

      <motion.main
        className="relative grid w-full max-w-[440px] justify-items-center gap-1 px-6 text-center max-[680px]:px-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <DevyMood mood="celebrating" className="h-24 w-24" />
        </motion.div>

        <p className="m-0 mt-3 text-[11px] font-bold uppercase tracking-[.08em] text-amber-300">Streak milestone</p>
        <strong className="font-rethink-sans text-[64px] leading-none font-medium tracking-[-.04em] text-[#f4f4f2]">
          {streakDays}
        </strong>
        <h1 className="m-0 font-rethink-sans text-2xl font-semibold leading-[1.3]">{milestone.label}</h1>
        <p className="m-0 mt-2 max-w-[38ch] text-[15px] leading-[1.55] text-[#b2b2b6]">
          You earned {milestone.restores} streak {milestone.restores === 1 ? 'restore' : 'restores'} — it covers a missed day automatically, whenever you need it.
        </p>

        <ActionButton className="mt-8 min-h-13 w-[min(100%,350px)] text-[15px] font-semibold" onClick={onClose} autoFocus>
          Keep going
        </ActionButton>
      </motion.main>
    </section>
  )
}
