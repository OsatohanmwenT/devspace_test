import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { DevyRive } from '../ui/DevyRive'

// How long Devy's rope drop gets on screen before the questions take over.
const HOLD_MS = 2600
const LEAVE_MS = 380

// The warm-up's opening beat. It isn't a practice intro with stats and a Start
// button — Devy drops in on the rope, says what's coming, and the first
// question follows on its own. A tap (or Enter) skips ahead.
export function WarmUpIntro({ session, onDone }) {
  const reduceMotion = useReducedMotion()
  const [leaving, setLeaving] = useState(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  const leave = () => setLeaving(true)

  useEffect(() => {
    const timer = window.setTimeout(leave, reduceMotion ? 1200 : HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [reduceMotion])

  useEffect(() => {
    if (!leaving) return undefined
    const timer = window.setTimeout(() => doneRef.current(), reduceMotion ? 0 : LEAVE_MS)
    return () => window.clearTimeout(timer)
  }, [leaving, reduceMotion])

  const count = session.questions.length

  return (
    <motion.main
      className="grid min-h-0 min-w-0 cursor-pointer place-items-center overflow-hidden bg-[#1f1f1f] px-7 [[data-theme=light]_&]:bg-white"
      onClick={leave}
      animate={leaving ? { opacity: 0, scale: 1.03, filter: 'blur(6px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: LEAVE_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
      aria-live="polite"
    >
      <div className="grid justify-items-center text-center">
        <DevyRive clip="rope-into" className="h-[240px] w-[240px] max-[680px]:h-[190px] max-[680px]:w-[190px]" />
        <motion.span
          className="mt-2 text-[13px] font-bold uppercase tracking-[0.1em] text-[#fb923c] [[data-theme=light]_&]:text-[#c2410c]"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
        >
          Warm up
        </motion.span>
        <motion.h1
          className="mt-2 mb-0 font-rethink-sans text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
        >
          {count} quick {count === 1 ? 'question' : 'questions'}
        </motion.h1>
        <motion.p
          className="mt-2 mb-0 max-w-[40ch] text-[15px] leading-[1.5] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.4 }}
        >
          {session.sourceTitle ? `A quick look back at ${session.sourceTitle}` : 'A quick look back at what you learned'}
          {session.nextLessonTitle ? `, then straight into ${session.nextLessonTitle}.` : '.'}
        </motion.p>
        {/* A thin fuse that burns down to the first question — shows the screen
            is moving on by itself, so nobody waits for a button. */}
        <span className="mt-7 h-1 w-[140px] overflow-hidden rounded-full bg-[#333336] [[data-theme=light]_&]:bg-[#ececea]" aria-hidden="true">
          <motion.span
            className="block h-full rounded-full bg-[#fb923c]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: (reduceMotion ? 1200 : HOLD_MS) / 1000, ease: 'linear' }}
          />
        </span>
      </div>
    </motion.main>
  )
}
