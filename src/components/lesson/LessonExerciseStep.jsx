import { GemIcon, BoltIcon } from '../ui/icons'
import { Badge } from '../ui/Badge'
import { ActionButton } from '../ui/ActionButton'
import { LessonTopBar } from './LessonTopBar'
import { LessonProgressBar } from './LessonProgressBar'
import { LessonSimulation } from './LessonSimulation'
import { CommandChip } from './CommandChip'
import { CommandSlot } from './CommandSlot'
import { DevyCorner } from './DevyCorner'
import { DevyChatRail } from './DevyChatRail'

export function LessonExerciseStep({
  instruction,
  tag,
  remainingLabel,
  commands,
  slots,
  commandLabels,
  simProgress,
  canCheck,
  onChipClick,
  onStartOver,
  onCheck,
  chatHistory,
  railExpanded,
  onToggleRail,
  onExit,
}) {
  return (
    <div className="lesson-view">
      <LessonTopBar
        onClose={onExit}
        center={<LessonProgressBar percent={simProgress} />}
        right={
          <div className="lesson-stat-row">
            <span className="lesson-stat"><span className="visually-hidden">XP</span>0 <GemIcon className="lesson-stat-icon" /></span>
            <BoltIcon className="lesson-stat-icon" />
          </div>
        }
      />

      <div className="lesson-exercise">
        <div className={railExpanded ? 'lesson-exercise-rail is-expanded' : 'lesson-exercise-rail'}>
          {railExpanded ? (
            <DevyChatRail messages={chatHistory} onCollapse={() => onToggleRail(false)} />
          ) : (
            <div className="lesson-exercise-rail-collapsed">
              <div className="lesson-exercise-icon-rail">
                <button type="button" className="lesson-exercise-icon" aria-label="Lesson objectives">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 3v18M5 4h13l-2.5 4L18 12H5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                </button>
                <button type="button" className="lesson-exercise-icon" aria-label="Read instruction aloud">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M17 8a5 5 0 0 1 0 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                </button>
              </div>

              <DevyCorner
                expanded={railExpanded}
                onToggleExpand={() => onToggleRail(true)}
              />
            </div>
          )}
        </div>

        <div className="lesson-exercise-workspace">
          <div className="lesson-exercise-main">
            <p className="lesson-exercise-instruction">{instruction}</p>

            <div className="lesson-exercise-panel panel">
              <div className="lesson-exercise-inner-header">
                <span className="lesson-exercise-remaining">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>
                  {remainingLabel}
                </span>
                <Badge className="lesson-exercise-tag">{tag.label} <sup>{tag.superscript}</sup></Badge>
              </div>

              <LessonSimulation progress={simProgress} />

              <div className="lesson-exercise-slots">
                {slots.map((chipId, index) => (
                  <CommandSlot key={index} index={index + 1} label={chipId ? commandLabels[chipId] : ''} />
                ))}
              </div>
            </div>

            <div className="lesson-exercise-chips">
              {commands.map((command) => (
                <CommandChip
                  key={command.id}
                  verb={command.verb}
                  object={command.object}
                  used={slots.includes(command.id)}
                  onClick={() => onChipClick(command.id)}
                />
              ))}
            </div>

            <div className="lesson-exercise-actions">
              <button type="button" className="lesson-start-over" onClick={onStartOver}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12a8 8 0 1 1 3 6.2M4 12V6m0 6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Start over
              </button>
            </div>
          </div>

          <div className="lesson-exercise-footer">
            <ActionButton variant="primary" className="lesson-check-button" disabled={!canCheck} onClick={onCheck}>
              Check
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  )
}

