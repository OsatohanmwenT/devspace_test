import { useEffect, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { LessonNavigationPill } from './LessonNavigationPill'
import { LessonProgressStrip } from './LessonProgressStrip'
import { CodingLessonWorkspace } from './CodingLessonWorkspace'

export default function LessonView({ mode = 'coding', navigationStyle = 'segments', onExit }) {
  const [devyOpen, setDevyOpen] = useState(false)
  const isCoding = mode === 'coding'

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onExit()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onExit])

  return (
    <section className={`${devyOpen ? 'lesson-shell is-devy-open' : 'lesson-shell'}${isCoding ? ' lesson-shell-coding' : ''}`} aria-label="Lesson">
      <header className="lesson-shell-topbar">
        <button type="button" className="lesson-shell-exit" onClick={onExit} aria-label="Exit lesson">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        {navigationStyle === 'pill' ? <LessonNavigationPill /> : <LessonProgressStrip />}
      </header>

      {!isCoding && devyOpen && (
        <aside className="lesson-devy-sidebar" aria-label="Devy assistant">
          <div className="lesson-devy-sidebar-header">
            <strong>Devy</strong>
            <button type="button" onClick={() => setDevyOpen(false)} aria-label="Close Devy sidebar">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div className="lesson-devy-sidebar-messages" />
          <div className="lesson-devy-sidebar-input">
            <input type="text" placeholder="How can I help?" aria-label="How can I help?" disabled />
          </div>
        </aside>
      )}

      <main className="lesson-shell-main">
        {isCoding ? <CodingLessonWorkspace /> : <div className="lesson-shell-canvas" aria-label="Lesson content" />}
      </main>

      {!isCoding && <footer className="lesson-shell-footer">
        {!devyOpen ? (
          <button type="button" className="lesson-devy-launcher" onClick={() => setDevyOpen(true)} aria-label="Open Devy sidebar">
            <img src="/assets/devy.svg" alt="" />
          </button>
        ) : <span />}
        <ActionButton variant="primary" className="lesson-shell-check" disabled>Check</ActionButton>
      </footer>}
    </section>
  )
}
