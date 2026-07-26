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

  return (
    <div className={`path-detail-lesson path-detail-lesson-${lesson.state} path-detail-lesson-align-${index % 3}${isSelected ? ' is-selected' : ''}`}>
      <button
        type="button"
        className="path-detail-lesson-button"
        disabled={isLocked}
        aria-current={isCurrent ? 'step' : undefined}
        aria-pressed={!isLocked ? isSelected : undefined}
        aria-label={`${lesson.title}, ${stateLabel}${lesson.checkpoint ? ', checkpoint' : ''}`}
        onClick={() => onSelect(lesson)}
      >
        <LessonPedestalIcon state={lesson.state} checkpoint={lesson.checkpoint} />
        <span className="path-detail-lesson-copy">
          <span className="path-detail-lesson-state">{stateLabel}</span>
          <strong>{lesson.title}</strong>
          {lesson.checkpoint && <span className="path-detail-checkpoint-label">Checkpoint</span>}
        </span>
      </button>
    </div>
  )
}
