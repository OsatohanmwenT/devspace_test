import { animate, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../../lib/onboardingMotion'
import { MiniIcon } from './OnboardingStep'
import { stageIcon } from './PathCard'

// The illustrations already used for path regions, matched to what a stage
// actually teaches so the card shows a picture of the thing rather than an
// empty panel. Falls back through a fixed rotation when nothing matches, so
// every card still gets art rather than a blank space.
const STAGE_ART = {
  js: '/assets/thinking-in-code.png',
  typescript: '/assets/thinking-in-code.png',
  react: '/assets/thinking-in-code.png',
  vue: '/assets/thinking-in-code.png',
  angular: '/assets/thinking-in-code.png',
  markup: '/assets/thinking-in-code.png',
  python: '/assets/programming-with-variables.png',
  java: '/assets/programming-with-variables.png',
  csharp: '/assets/programming-with-variables.png',
  swift: '/assets/programming-with-variables.png',
  kotlin: '/assets/programming-with-variables.png',
  database: '/assets/exploring-data-visually.png',
  api: '/assets/scientific-thinking.png',
  cloud: '/assets/scientific-thinking.png',
  docker: '/assets/scientific-thinking.png',
  git: '/assets/programming-with-variables.png',
  design: '/assets/probability-and-chance.png',
}
const FALLBACK_ART = [
  '/assets/programming-with-variables.png',
  '/assets/exploring-data-visually.png',
  '/assets/scientific-thinking.png',
  '/assets/probability-and-chance.png',
  '/assets/thinking-in-code.png',
]

function artFor(stage, index) {
  const icon = stageIcon(stage.value)
  return (icon && STAGE_ART[icon]) || FALLBACK_ART[index % FALLBACK_ART.length]
}

// Where a card sits relative to the active one. Neighbours peek in from the
// stage edges, straight (±2° at most) and slightly smaller; anything further
// out waits just past the edge, so a step change slides rather than pops.
function slotFor(offset) {
  const side = Math.sign(offset)
  const distance = Math.min(Math.abs(offset), 2)
  const x = distance <= 1 ? 92 * distance : 92 + (68 * (distance - 1))
  const scale = distance <= 1 ? 1 - (0.1 * distance) : 0.9 - (0.05 * (distance - 1))
  const opacity = distance <= 1 ? 1 - (0.15 * distance) : 0.85 * (2 - distance)
  return { x: `${side * x}%`, scale, rotate: side * 2 * Math.min(distance, 1), opacity }
}

// One of the app's own accents per card — green, orange, blue, amber,
// purple — like every Vybe having its own colour. Uses the same layered
// .onb-card--tinted material as the rest of onboarding (inner top-light,
// hairline highlight, tinted ambient shadow) so these read as real objects
// rather than flat colour swatches.
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
      className="onb-card onb-card--tinted flex h-[224px] w-[212px] flex-col rounded-2xl border-0 p-3.5 text-left text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#6699ec] max-[480px]:h-[198px] max-[480px]:w-[188px]"
      style={{
        '--card-tint': tint,
        background: `linear-gradient(180deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,0) 55%), ${tint}`,
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
      <p className="m-0 mt-2 line-clamp-2 font-rethink-sans text-[15px] font-semibold leading-[1.2] max-[480px]:text-[14px]">{stage.label}</p>
      {/* A plain panel for the art — the card's own depth already carries the
          material, so this stays a simple translucent inset rather than a
          second layer of shadows. */}
      <div className="relative mt-2.5 flex flex-1 items-end justify-center overflow-hidden rounded-xl bg-black/18">
        <img src={artFor(stage, index)} alt="" className="h-[86%] max-h-[120px] object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,.35)]" />
      </div>
    </button>
  )
}

// The role reveal's stage carousel, kept compact: a fixed, clipped stage with
// the active step dead centre and the previous/next steps peeking in from
// the edges, dots below. The learner can step through the route (dots, or
// tap a peeking card); the first step is active by default because that's
// where they'll start.
export function StageCards({ stages, label }) {
  const cards = stages.slice(0, 5)
  const instant = reducedMotion()
  const [position, setPosition] = useState(() => Math.max(stages.length - 1, 0))
  const [isScanning, setIsScanning] = useState(!instant)
  const scanAnimation = useRef(null)
  const active = Math.round(position)

  useEffect(() => {
    scanAnimation.current?.stop()

    if (instant || cards.length < 2) {
      setPosition(0)
      setIsScanning(false)
      return undefined
    }

    setPosition(cards.length - 1)
    setIsScanning(true)
    scanAnimation.current = animate(cards.length - 1, 0, {
      duration: 1.15 + (cards.length * 0.08),
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setPosition,
      onComplete: () => setIsScanning(false),
    })

    return () => scanAnimation.current?.stop()
  }, [cards.length, instant])

  const showStage = (index) => {
    scanAnimation.current?.stop()
    setIsScanning(false)
    setPosition(index)
  }

  return (
    <div className="grid w-full justify-items-center gap-3">
      <div
        className="relative h-[254px] w-full max-w-[460px] overflow-hidden max-[480px]:h-[228px]"
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
      >
        {cards.map((stage, index) => {
          const offset = index - position
          const slot = slotFor(offset)
          return (
            <motion.div
              key={stage.value}
              className="absolute left-1/2 top-1/2 -ml-[106px] -mt-[112px] max-[480px]:-ml-[94px] max-[480px]:-mt-[99px]"
              initial={instant ? false : { opacity: 0, scale: 0.85, x: '0%' }}
              animate={slot}
              transition={instant || isScanning ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 28, mass: 0.9 }}
              style={{ zIndex: 3 - Math.min(Math.ceil(Math.abs(offset)), 2) }}
              aria-hidden={index === active ? undefined : 'true'}
            >
              <StageCard stage={stage} index={index} active={index === active} onClick={() => showStage(index)} />
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
            onClick={() => showStage(index)}
            className={`h-2 rounded-full border-0 p-0 transition-[width,background-color] duration-300 ${index === active
              ? 'w-6 bg-[#f4f4f2] [[data-theme=light]_&]:bg-neutral-800'
              : 'w-2 bg-[#404040] hover:bg-[#6a6a6a] [[data-theme=light]_&]:bg-[#d4d4d4] [[data-theme=light]_&]:hover:bg-[#a8a8a8]'}`}
          />
        ))}
      </div>
    </div>
  )
}
