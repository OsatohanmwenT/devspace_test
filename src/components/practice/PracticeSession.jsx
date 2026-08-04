import { useEffect } from 'react'
import { practiceSessions } from '../../data/practice'
import { LessonQuiz } from '../lesson/LessonQuiz'

export function PracticeSession({ sessionId, onExit, onComplete }) {
  const session = practiceSessions.find((item) => item.id === sessionId)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onExit()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onExit])

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousDocumentOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousDocumentOverflow
    }
  }, [])

  if (!session) return null

  return (
    <section className="fixed inset-0 z-20 grid grid-rows-[56px_minmax(0,1fr)] overflow-hidden bg-[#121212] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]" aria-label="Practice session">
      <header className="relative flex items-center border-b border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1a] [[data-theme=light]_&]:bg-[#fafaf8] px-5">
        <button
          type="button"
          className="grid w-11 h-11 place-items-center border-0 rounded-lg bg-transparent shadow-none text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-[#181818] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6f66ec]"
          onClick={onExit}
          aria-label="Exit practice session"
        >
          <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <span className="ml-3 text-sm font-semibold">{session.title}</span>
      </header>

      <main className="min-w-0 min-h-0 overflow-auto">
        <LessonQuiz
          quiz={{ title: session.title, intro: `A ${session.minutes}-minute practice round on ${session.topic}.`, questions: session.questions }}
          onChecked={({ correctCount, total }) => onComplete?.(session.id, correctCount, total)}
        />
      </main>
    </section>
  )
}
