import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { DevyRive } from '../ui/DevyRive'

// Timed against the rope clip (DevyRive starts it 3.4s in): Devy appears at
// the top ~0.6s after mount and lands ~1.4s, then swings.
const PULL_DELAY_S = 0.55
const LANDED_MS = 1400
const HOLD_MS = 1900
const LEAVE_MS = 420

// The warm-up's opening beat. Devy slides down the rope and drags the warm-up
// card down into view with him, like pulling a shade — it hangs from his feet,
// lands with a little bounce, and holds while a fuse burns. Then he yanks it
// back up and the first question drops in. A tap (or Enter) skips ahead.
export function WarmUpIntro({ session, onDone }) {
  const reduceMotion = useReducedMotion()
  const [leaving, setLeaving] = useState(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  const leave = () => setLeaving(true)

  useEffect(() => {
    const timer = window.setTimeout(leave, reduceMotion ? 1200 : LANDED_MS + HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [reduceMotion])

  useEffect(() => {
    if (!leaving) return undefined
    const timer = window.setTimeout(() => doneRef.current(), reduceMotion ? 0 : LEAVE_MS)
    return () => window.clearTimeout(timer)
  }, [leaving, reduceMotion])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Enter' && !event.repeat) leave()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const count = session.questions.length

  return (
    <main
      className="relative min-h-0 min-w-0 cursor-pointer overflow-hidden bg-[#1f1f1f] [[data-theme=light]_&]:bg-white"
      onClick={leave}
      aria-live="polite"
    >
      <motion.div
        className="absolute inset-x-0 top-0 flex flex-col items-center px-5"
        animate={leaving && !reduceMotion ? { y: '-115%' } : { y: 0 }}
        transition={{ duration: LEAVE_MS / 1000, ease: [0.55, 0, 0.75, 0.2] }}
      >
        {/* The rope's length is baked into the artboard, which left the card
            landing high with dead space below. This extends it up to the top
            of the stage, lowering the whole drop toward the middle. It lines
            up with the artboard's rope, just left of centre. */}
        <span className="block h-[clamp(24px,14vh,150px)] w-[3px] -translate-x-[3px] rounded-b-full bg-[#0d0d10] [[data-theme=light]_&]:bg-[#1a1a1a]" aria-hidden="true" />
        {/* The artboard draws a thin "ceiling" line along its top edge; with
            the rope extended above it, that line would float mid-air, so the
            top few pixels are cropped off. */}
        <span className="pointer-events-none relative z-10 block overflow-hidden">
          <DevyRive clip="rope-into" className="-mt-2 size-[300px] max-[680px]:size-[230px]" />
        </span>

        {/* The card hangs from Devy's feet: it starts above the screen and
            comes down on a spring as he drops, settling just after he lands. */}
        <motion.section
          className="relative -mt-[172px] grid w-[min(100%,520px)] justify-items-center rounded-[28px] border border-[#333336] bg-[#262626] px-8 pt-16 pb-8 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,.7)] [[data-theme=light]_&]:border-[#ececea] [[data-theme=light]_&]:bg-[#fafaf8] [[data-theme=light]_&]:shadow-[0_30px_60px_-34px_rgba(20,20,40,.35)] max-[680px]:-mt-[132px] max-[680px]:px-6 max-[680px]:pt-12"
          initial={reduceMotion ? false : { y: '-120vh' }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 1, delay: PULL_DELAY_S }}
        >
          <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#fb923c] [[data-theme=light]_&]:text-[#c2410c]">Warm up</span>
          <h1 className="mt-2 mb-0 font-rethink-sans text-[clamp(28px,4vw,38px)] font-semibold leading-[1.1] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
            {count} quick {count === 1 ? 'question' : 'questions'}
          </h1>
          <p className="mt-2 mb-0 max-w-[38ch] text-[15px] leading-[1.5] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
            {session.sourceTitle ? `A quick look back at ${session.sourceTitle}` : 'A quick look back at what you learned'}
            {session.nextLessonTitle ? `, then straight into ${session.nextLessonTitle}.` : '.'}
          </p>
          {/* A fuse that starts burning once Devy has landed — shows the screen
              moves on by itself, so nobody waits for a button. */}
          <span className="mt-6 h-1 w-[140px] overflow-hidden rounded-full bg-[#3a3a3d] [[data-theme=light]_&]:bg-[#ececea]" aria-hidden="true">
            <motion.span
              className="block h-full rounded-full bg-[#fb923c]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={reduceMotion ? { duration: 1.2, ease: 'linear' } : { duration: HOLD_MS / 1000, delay: LANDED_MS / 1000, ease: 'linear' }}
            />
          </span>
        </motion.section>
      </motion.div>
    </main>
  )
}
