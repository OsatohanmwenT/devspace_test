import { motion } from 'motion/react'
import { DevyMood } from '../ui/DevyMood'
import { ActionButton } from '../ui/ActionButton'
import { BoltIcon } from '../ui/icons'
import { getStreakEra } from '../../lib/streak'

// The one-time payoff for crossing a streak tier — modeled directly on
// LeagueQualifiedCelebration's entrance pattern. There's no new Devy art or
// new "world" to unlock here (only three mascot moods exist); the escalation
// across eras is entirely color and copy intensity via getStreakEra.
export function StreakMilestoneCelebration({ streakDays, milestone, onClose }) {
  const era = getStreakEra(streakDays)

  return (
    <section
      className="fixed inset-0 z-40 grid min-h-screen place-items-center overflow-y-auto bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#2a1d10_100%)] px-6 py-8 text-[#f4f4f2] [[data-theme=light]_&]:bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#fdf0e0_100%)] [[data-theme=light]_&]:text-neutral-800 max-[680px]:px-4"
      aria-label={`${milestone.label} streak milestone`}
    >
      <motion.main
        className="grid w-full max-w-[480px] justify-items-center text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <motion.div
          className="relative grid place-items-center"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <BoltIcon className={`size-16 ${era.accentClass}`} />
          <DevyMood mood="celebrating" className="mt-2 size-[120px]" />
        </motion.div>

        <p className={`mt-5 mb-1 text-[13px] font-bold uppercase tracking-[.08em] ${era.accentClass}`}>{era.label}</p>
        <h1 className="m-0 mb-2 font-rethink-sans text-3xl font-semibold leading-[1.3] max-[680px]:text-[26px]">
          {streakDays} day streak!
        </h1>
        <p className="m-0 max-w-[38ch] text-[17px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
          You hit <strong className="font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{milestone.label}</strong> — that's {milestone.restores} streak restore{milestone.restores === 1 ? '' : 's'} banked for a day you might miss later.
        </p>

        <ActionButton className="mt-8 min-h-13 w-[min(100%,350px)] text-[15px] font-semibold" onClick={onClose} autoFocus>
          Keep going
        </ActionButton>
      </motion.main>
    </section>
  )
}
