import { motion } from 'motion/react'
import { useState } from 'react'
import { ActionButton } from './ActionButton'
import { DevyMood } from './DevyMood'

// A staged intro: one idea per screen, advanced by Continue, in the shape of
// Brilliant's onboarding — but keeping this app's own dressing, the blue
// arrival gradient and Devy. Each Continue rises the whole page up from below
// rather than swapping the copy in place, so it reads as moving through screens.
const STAGE_TRANSITION = { duration: 0.62, ease: [0.22, 0.61, 0.36, 1] }

function StageArt({ mood }) {
  return (
    <div className="relative mb-9 grid place-items-center max-[680px]:mb-7">
      <span className="absolute size-28 rounded-full bg-[#513dec]/25 blur-2xl" aria-hidden="true" />
      <DevyMood mood={mood} className="relative size-36 max-[680px]:size-28" />
    </div>
  )
}

export function PageIntroStages({ stages, actionLabel = 'Continue', finalActionLabel, onDone, ariaLabel }) {
  const [index, setIndex] = useState(0)
  const stage = stages[index]
  const isLast = index === stages.length - 1

  const advance = () => {
    if (isLast) onDone()
    else setIndex((current) => current + 1)
  }

  return (
    <section
      className="fixed inset-0 z-40 grid min-h-screen place-items-center bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)] px-6 py-8 text-[#f4f4f2] [[data-theme=light]_&]:bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] [[data-theme=light]_&]:text-neutral-800 max-[680px]:px-4"
      aria-label={ariaLabel}
    >
      {/* Keyed on the stage index so each stage is a fresh mount that rises in
          as a whole page. The dots and Continue sit outside it, so the controls
          stay put while the screen behind them moves. */}
      <main className="grid w-full max-w-[520px] justify-items-center overflow-hidden text-center">
        <motion.div
          key={index}
          className="grid w-full justify-items-center"
          initial={{ opacity: 0, y: 56 }}
          animate={{ opacity: 1, y: 0 }}
          transition={STAGE_TRANSITION}
        >
          <StageArt mood={stage.mood} />
          {stage.eyebrow && (
            <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">{stage.eyebrow}</p>
          )}
          <h1 className="mt-3 mb-2 font-rethink-sans text-3xl font-semibold leading-[1.4] max-[680px]:text-[26px]">{stage.title}</h1>
          <p className="m-0 max-w-[42ch] text-[17px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">{stage.body}</p>
        </motion.div>

        <div className="mt-9 flex items-center gap-2" role="img" aria-label={`Step ${index + 1} of ${stages.length}`}>
          {stages.map((entry, dotIndex) => (
            <span
              key={entry.title}
              className={`size-2 rounded-full transition-colors duration-200 ${dotIndex === index
                ? 'bg-[#f4f4f2] [[data-theme=light]_&]:bg-neutral-800'
                : 'bg-[#404040] [[data-theme=light]_&]:bg-[#d4d4d4]'}`}
            />
          ))}
        </div>

        <ActionButton className="mt-5 min-h-13 w-[min(100%,350px)] text-[15px] font-semibold" onClick={advance} autoFocus>
          {isLast ? (finalActionLabel ?? actionLabel) : actionLabel}
        </ActionButton>
      </main>
    </section>
  )
}
