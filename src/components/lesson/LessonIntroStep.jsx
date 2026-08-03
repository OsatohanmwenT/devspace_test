import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { LessonTopBar } from './LessonTopBar'
import { DevyCorner } from './DevyCorner'
import { DevyChatRail } from './DevyChatRail'

export function LessonIntroStep({
  regionLabel,
  careerLabel,
  heading,
  bodyParagraphs,
  devyQuestion,
  devyOptions,
  onAnswered,
  cornerMessage,
  railExpanded,
  onToggleRail,
  canContinue,
  onContinue,
  onExit,
}) {
  const [selectedOption, setSelectedOption] = useState(null)

  const selectOption = (index) => {
    setSelectedOption(index)
    onAnswered()
  }

  return (
    <div className="lesson-view">
      <LessonTopBar
        onClose={onExit}
        center={
          <nav className="lesson-dot-nav" aria-label="Lesson steps">
            <button type="button" className="lesson-dot-nav-arrow" onClick={onExit} aria-label="Exit lesson">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="progress-dots" role="img" aria-label="Step 1 of 4">
              {Array.from({ length: 4 }, (_, index) => <span className={index === 0 ? 'progress-dot active' : 'progress-dot'} key={index} />)}
            </div>
            <button type="button" className="lesson-dot-nav-arrow" disabled aria-label="Next step">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </nav>
        }
        right={<button type="button" className="lesson-guidebook-button">Guidebook</button>}
      />

      <div className="lesson-intro-workspace">
        <aside className={railExpanded ? 'lesson-intro-rail is-expanded' : 'lesson-intro-rail'} aria-label="Devy assistant">
          {railExpanded ? (
            <DevyChatRail
              messages={[{ id: 'intro-message', text: cornerMessage, active: true }]}
              question={devyQuestion}
              options={devyOptions}
              selectedOption={selectedOption}
              onSelectOption={selectOption}
              onCollapse={() => onToggleRail(false)}
            />
          ) : (
            <DevyCorner expanded={railExpanded} onToggleExpand={() => onToggleRail(true)} />
          )}
        </aside>

        <div className="lesson-intro">
          <div className="lesson-intro-copy">
            <span className="lesson-intro-eyebrow">{regionLabel} · {careerLabel}</span>
            <h1>{heading}</h1>
            <div className="lesson-intro-body">
              {bodyParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </div>
        </div>
      </div>

      <div className="lesson-intro-footer">
        <div className="lesson-intro-footer-actions">
          <button type="button" className="lesson-back-button" onClick={onExit}>Back</button>
          <ActionButton variant="primary" onClick={onContinue} disabled={!canContinue}>Continue</ActionButton>
        </div>
      </div>
    </div>
  )
}

