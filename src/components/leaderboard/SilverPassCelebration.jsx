import { motion } from 'motion/react'
import { DevyMood } from '../ui/DevyMood'
import { ActionButton } from '../ui/ActionButton'
import { TierMedal } from './TierMedal'
import { getLeague } from '../../data/leagues'

const SILVER = getLeague(1)

// The fullscreen payoff for a top-10 Bronze finish — rarer and bigger than
// the inline "You unlocked Silver League" banner every promotion gets, since
// earning the pass itself (not just qualifying) is the actual achievement
// here. Framed as spec section 25 insists: "you unlocked the next
// competition," never "pay to win" — the copy never mentions Pro unless the
// pass is already spoken for by it.
export function SilverPassCelebration({ rank, usedImmediately, onClose }) {
  return (
    <section
      className="fixed inset-0 z-40 grid min-h-screen place-items-center overflow-y-auto bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)] px-6 py-8 text-[#f4f4f2] [[data-theme=light]_&]:bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] [[data-theme=light]_&]:text-neutral-800 max-[680px]:px-4"
      aria-label="You earned a Silver League Pass"
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
          <TierMedal league={SILVER} state="current" size={104} />
          <DevyMood mood="celebrating" className="mt-3 size-[112px]" />
        </motion.div>

        <p className="mt-5 mb-1 text-[13px] font-bold uppercase tracking-[.08em] text-[#89baff] [[data-theme=light]_&]:text-[#3d77eb]">
          #{rank} in Bronze League
        </p>
        <h1 className="m-0 mb-2 font-rethink-sans text-3xl font-semibold leading-[1.3] max-[680px]:text-[26px]">
          You earned your way into Silver.
        </h1>
        <p className="m-0 max-w-[40ch] text-[17px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
          {usedImmediately
            ? 'Your Silver League Pass is already in use — you’re competing there this season.'
            : 'Your Silver League Pass is ready for the next season you play.'}
        </p>

        <ActionButton className="mt-8 min-h-13 w-[min(100%,350px)] text-[15px] font-semibold" onClick={onClose} autoFocus>
          {usedImmediately ? 'Enter Silver' : 'Nice'}
        </ActionButton>
      </motion.main>
    </section>
  )
}
