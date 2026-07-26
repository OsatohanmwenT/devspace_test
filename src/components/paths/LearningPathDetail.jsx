import { useEffect, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { detailLevels } from '../../data/paths'
import { LessonRow } from './LessonRow'

export function LearningPathDetail({ onNotice, onBack }) {
  const lessons = detailLevels.flatMap((level) => level.lessons)
  const currentLesson = lessons.find((lesson) => lesson.state === 'current')
  const [selectedLessonId, setSelectedLessonId] = useState(currentLesson?.id)
  const [startedLessonIds, setStartedLessonIds] = useState([])
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId)
  const selectedLessonStarted = selectedLesson && startedLessonIds.includes(selectedLesson.id)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onBack()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onBack])

  return (
    <section className="path-detail" aria-labelledby="path-detail-title">
      <button className="path-detail-back" onClick={onBack}>← Back to My learning</button>
      <h1 className="visually-hidden">Thinking in Code — skill path detail</h1>
      <div className="path-detail-layout">
        <aside className="path-detail-summary panel">
          <div className="path-detail-summary-art">
            <img src="/assets/thinking-in-code.png" alt="Thinking in Code illustration" />
          </div>
          <span className="paths-eyebrow">Skill path</span>
          <h2 id="path-detail-title">Thinking in Code</h2>
          <p>Build solid foundations for computational problem solving.</p>
          <dl className="path-detail-stats">
            <div>
              <dt>Lessons</dt>
              <dd>{lessons.length}</dd>
            </div>
            <div>
              <dt>Levels</dt>
              <dd>{detailLevels.length}</dd>
            </div>
          </dl>
        </aside>

        <div className="path-detail-track">
          {detailLevels.map((level) => {
            const isActiveLevel = level.lessons.some((lesson) => lesson.state === 'current')
            return (
              <section className={`path-detail-level${isActiveLevel ? ' is-active' : ''}`} key={level.level} aria-labelledby={`${level.level}-title`}>
                <header className="path-detail-level-header">
                  <span>{level.level}</span>
                  <h2 id={`${level.level}-title`}>{level.title}</h2>
                </header>
                <div className="path-detail-lessons">
                  {level.lessons.map((lesson) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      index={level.lessons.indexOf(lesson)}
                      isSelected={lesson.id === selectedLessonId}
                      onSelect={() => setSelectedLessonId(lesson.id)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
          {selectedLesson && (
            <aside className="path-detail-lesson-tray" aria-label="Selected lesson">
              <div>
                <span>Selected lesson</span>
                <h2>{selectedLesson.title}</h2>
                {selectedLesson.description && <p className="path-detail-lesson-description">{selectedLesson.description}</p>}
              </div>
              <ActionButton variant="primary" className="mission-button w-fit! px-20" onClick={() => {
                setStartedLessonIds((startedIds) => startedIds.includes(selectedLesson.id)
                  ? startedIds
                  : [...startedIds, selectedLesson.id])
                onNotice(`${selectedLesson.title} ${selectedLessonStarted ? 'ready to continue' : 'started'}`)
              }}>
                {selectedLessonStarted ? 'Continue' : 'Start'}
              </ActionButton>
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}
