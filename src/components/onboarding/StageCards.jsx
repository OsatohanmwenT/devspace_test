import { motion } from 'motion/react'
import { useState } from 'react'
import { reducedMotion } from '../../lib/onboardingMotion'
import { MiniIcon } from './OnboardingStep'
import { stageIcon } from './PathCard'

// Where a card sits relative to the active one. Neighbours peek in from the
// stage edges, straight (±2° at most) and slightly smaller; anything further
// out waits just past the edge, so a step change slides rather than pops.
function slotFor(offset) {
  if (offset === 0) return { x: '0%', scale: 1, rotate: 0, opacity: 1 }
  const side = Math.sign(offset)
  if (Math.abs(offset) === 1) return { x: `${side * 92}%`, scale: 0.9, rotate: side * 2, opacity: 0.85 }
  return { x: `${side * 160}%`, scale: 0.85, rotate: side * 2, opacity: 0 }
}

// One of the app's own accents per card — green, orange, blue, amber,
// purple — like every Vybe having its own colour. The neighbours are the
// same material, just dimmed and behind, so the active step still leads.
const CARD_TINTS = ['#168a46', '#e8702a', '#2563eb', '#d4a017', '#7c3aed']

function StageCard({ stage, index, active, onClick }) {
  const icon = stageIcon(stage.value)
  const tint = CARD_TINTS[index % CARD_TINTS.length]
  return (
    <button
      type="button"
      tabIndex={active ? -1 : 0}
      aria-label={active ? undefined : `Show ${stage.label}`}
      onClick={onClick}
      className="onb-card onb-card--tinted flex h-[120px] w-[212px] flex-col justify-between rounded-2xl border-0 p-3.5 text-left text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#6699ec] max-[480px]:h-[108px] max-[480px]:w-[188px]"
      style={{
        '--card-tint': tint,
        background: `linear-gradient(180deg, rgba(255,255,255,.2) 0%, rgba(255,255,255,0) 55%), ${tint}`,
        cursor: active ? 'default' : 'pointer',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="grid size-8 flex-none place-items-center rounded-full bg-white/22 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35)]" aria-hidden="true">
          {icon ? <MiniIcon name={icon} className="size-4" /> : <span className="text-[12px] font-semibold">{index + 1}</span>}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-white/85">
          {index === 0 ? 'Start here' : `Step ${index + 1}`}
        </span>
      </div>
      <p className="m-0 line-clamp-2 font-rethink-sans text-[15px] font-semibold leading-[1.2] max-[480px]:text-[14px]">{stage.label}</p>
    </button>
  )
}

// The role reveal's stage carousel, kept compact: a fixed, clipped stage with
// the active step dead centre and the previous/next steps peeking in from
// the edges, dots below. The learner can step through the route (dots, or
// tap a peeking card); the first step is active by default because that's
// where they'll start.
export function StageCards({ stages, label }) {
  const [active, setActive] = useState(0)
  const cards = stages.slice(0, 5)
  const instant = reducedMotion()

  return (
    <div className="grid w-full justify-items-center gap-3">
      <div
        className="onb-stage relative h-[150px] w-full max-w-[460px] overflow-hidden max-[480px]:h-[136px]"
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
      >
        {cards.map((stage, index) => {
          const offset = index - active
          const slot = slotFor(offset)
          return (
            <motion.div
              key={stage.value}
              className="absolute left-1/2 top-1/2 -ml-[106px] -mt-[60px] max-[480px]:-ml-[94px] max-[480px]:-mt-[54px]"
              initial={instant ? false : { opacity: 0, scale: 0.85, x: '0%' }}
              animate={slot}
              transition={instant ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 28, mass: 0.9, delay: offset === 0 ? 0.25 : 0.32 + Math.abs(offset) * 0.06 }}
              style={{ zIndex: 3 - Math.min(Math.abs(offset), 2) }}
              aria-hidden={offset === 0 ? undefined : 'true'}
            >
              <StageCard stage={stage} index={index} active={offset === 0} onClick={() => setActive(index)} />
            </motion.div>
          )
        })}
      </div>

      <div className="flex items-center gap-2" role="tablist" aria-label="Route steps">
        {cards.map((stage, index) => (
          <button
            key={stage.value}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`${stage.label}, step ${index + 1}`}
            onClick={() => setActive(index)}
            className={`h-2 rounded-full border-0 p-0 transition-[width,background-color] duration-300 ${index === active
              ? 'w-6 bg-[#f4f4f2] [[data-theme=light]_&]:bg-neutral-800'
              : 'w-2 bg-[#404040] hover:bg-[#6a6a6a] [[data-theme=light]_&]:bg-[#d4d4d4] [[data-theme=light]_&]:hover:bg-[#a8a8a8]'}`}
          />
        ))}
      </div>
    </div>
  )
}
