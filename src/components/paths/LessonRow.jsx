import { motion } from 'motion/react'
import { LessonPedestalIcon } from '../ui/icons'

// The current-lesson tile is the one thing on the roadmap worth acting on
// next, so it gets a beacon: a soft halo breathing behind it and the pedestal
// itself drifting and tilting, like it's gently calling for a tap. Lives on a
// wrapper, not the icon, so it never fights the icon's own hover/active
// transform classes below.
function CurrentTileBeacon({ children }) {
  return (
    <span className="relative grid place-items-center">
      <motion.span
        className="absolute size-16 rounded-full bg-[#4169e1]/25 blur-md"
        aria-hidden="true"
        animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="relative"
        animate={{ y: [0, -6, 0], rotate: [0, -3, 0, 3, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {children}
      </motion.span>
    </span>
  )
}

export function LessonRow({ lesson, index, isSelected, onSelect }) {
  const isCurrent = lesson.state === 'current'
  const isLocked = lesson.state === 'locked'
  const stateLabel = lesson.state === 'completed'
    ? 'Completed'
    : isCurrent
      ? 'Current lesson'
      : isLocked
        ? 'Locked'
        : 'Available'
  const alignment = ['justify-start', 'justify-end', 'justify-center'][index % 3]
  const icon = <LessonPedestalIcon className="group-hover:-translate-y-1 group-hover:scale-105 group-active:translate-y-0.5 group-active:scale-100" state={lesson.state} checkpoint={lesson.checkpoint} selected={isSelected} />

  return (
    <div className={`relative z-[1] flex min-h-[126px] w-full ${alignment}`}>
      <button
        type="button"
        className="group flex min-h-[126px] w-[min(100%,278px)] items-center gap-2.5 rounded-[18px] border-0 bg-transparent px-2 text-left text-[#f4f4f2] disabled:cursor-not-allowed focus-visible:outline-3 focus-visible:outline-[#9db5d7] focus-visible:outline-offset-3 [[data-theme=light]_&]:text-neutral-800"
        disabled={isLocked}
        aria-current={isCurrent ? 'step' : undefined}
        aria-pressed={!isLocked ? isSelected : undefined}
        aria-label={`${lesson.title}, ${stateLabel}${lesson.checkpoint ? ', checkpoint' : ''}`}
        onClick={() => onSelect(lesson)}
      >
        {isCurrent ? <CurrentTileBeacon>{icon}</CurrentTileBeacon> : icon}
        <span className="grid min-w-0 gap-[5px]">
          <span className={`text-[10px] font-bold tracking-[.08em] uppercase ${isCurrent || isSelected ? 'text-[#4169e1]' : 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'}`}>{stateLabel}</span>
          <strong className="text-[15px] leading-[1.35] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{lesson.title}</strong>
          {lesson.checkpoint && <span className="text-[10px] font-bold tracking-[.08em] text-[#9a9a9d] uppercase [[data-theme=light]_&]:text-[#686968]">Checkpoint</span>}
        </span>
      </button>
    </div>
  )
}
