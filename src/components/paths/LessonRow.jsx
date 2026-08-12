import { LessonPedestalIcon } from '../ui/icons'

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
        <LessonPedestalIcon className="group-hover:-translate-y-1 group-active:translate-y-0.5" state={lesson.state} checkpoint={lesson.checkpoint} selected={isSelected} />
        <span className="grid min-w-0 gap-[5px]">
          <span className={`text-[10px] font-bold tracking-[.08em] uppercase ${isCurrent || isSelected ? 'text-[#4169e1]' : 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'}`}>{stateLabel}</span>
          <strong className="text-[15px] leading-[1.35] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{lesson.title}</strong>
          {lesson.checkpoint && <span className="text-[10px] font-bold tracking-[.08em] text-[#9a9a9d] uppercase [[data-theme=light]_&]:text-[#686968]">Checkpoint</span>}
        </span>
      </button>
    </div>
  )
}

