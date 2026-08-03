import { useEffect, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { LessonNavigationPill } from './LessonNavigationPill'
import { LessonProgressStrip } from './LessonProgressStrip'
import { CodingLessonWorkspace } from './CodingLessonWorkspace'
import { LessonArticle } from './LessonArticle'
import { LessonQuiz } from './LessonQuiz'
import { writingProgramsArticle, writingProgramsClickFillQuiz, writingProgramsQuiz } from './lessonContent'

const STEP_INDEX = { article: 1, quiz: 2, fill: 3, coding: 4 }
const PREVIOUS_STEP = { article: undefined, quiz: 'article', fill: 'quiz', coding: 'fill' }
const NEXT_STEP = { article: 'quiz', quiz: 'fill', fill: 'coding' }
const CONTINUE_LABEL = { article: 'Continue to quiz', quiz: 'Continue to Click & Fill', fill: 'Continue to coding' }

export default function LessonView({ mode = 'article', navigationStyle = 'segments', onExit }) {
  const [step, setStep] = useState(mode)
  const [isDevyOpen, setIsDevyOpen] = useState(false)
  const isCoding = step === 'coding'
  const previousStep = PREVIOUS_STEP[step]

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

  const isDevyPanelOpen = isDevyOpen && !isCoding
  const focusRing = 'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6f66ec]'

  return (
    <section
      className={`fixed inset-0 z-20 grid overflow-hidden bg-[#121212] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818] ${isCoding ? 'grid-rows-[52px_minmax(0,1fr)]' : 'grid-rows-[56px_minmax(0,1fr)_92px] max-[720px]:grid-rows-[56px_minmax(0,1fr)_84px]'}`}
      aria-label="Lesson"
    >
      <header className="relative grid grid-cols-[1fr_auto_1fr] items-center border-b border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1a] [[data-theme=light]_&]:bg-[#fafaf8] px-5 max-[720px]:px-3.5">
        <button
          type="button"
          className={`grid w-11 h-11 place-items-center border-0 rounded-lg bg-transparent shadow-none text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-[#181818] ${focusRing}`}
          onClick={onExit}
          aria-label="Exit lesson"
        >
          <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        {navigationStyle === 'pill' ? <LessonNavigationPill /> : (
          <LessonProgressStrip
            currentStep={STEP_INDEX[step]}
            totalSteps={4}
            onPrevious={previousStep ? () => setStep(previousStep) : undefined}
          />
        )}
      </header>

      <main
        className={`min-w-0 min-h-0 p-0 transition-[margin-left] duration-[180ms] ease-in-out ${isDevyPanelOpen ? 'ml-80 max-[720px]:ml-0 max-[720px]:mt-[min(42vh,340px)]' : 'ml-0'}`}
      >
        {step === 'article' && <LessonArticle article={writingProgramsArticle} />}
        {step === 'quiz' && <LessonQuiz quiz={writingProgramsQuiz} />}
        {step === 'fill' && <LessonQuiz quiz={writingProgramsClickFillQuiz} />}
        {step === 'coding' && <CodingLessonWorkspace />}
      </main>

      {!isCoding && <aside
        className={`absolute z-[1] top-16 bottom-0 left-0 flex w-80 max-[720px]:w-full flex-col p-5 border-r max-[720px]:border-r-0 max-[720px]:border-b border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white transition-transform duration-[180ms] ease-in-out max-[720px]:top-[60px] ${isDevyPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Devy chat"
      >
        <div className="flex items-center justify-between text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]">
          <strong className="text-base">Devy</strong>
          <button
            type="button"
            className={`grid w-9 h-9 place-items-center border-0 rounded-lg bg-transparent text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] ${focusRing}`}
            onClick={() => setIsDevyOpen(false)}
            aria-label="Close Devy chat"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="flex-1">
          <p className="mt-6 text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] text-sm leading-[1.55]">Hi, I’m Devy. Ask me about programs, variables, or the example on this page.</p>
        </div>
        <form
          className="mb-5 max-[720px]:mb-4 border rounded-full border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5]"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="text"
            className="w-full h-12 border-0 rounded-[inherit] bg-transparent px-4 text-[#89898e] [[data-theme=light]_&]:text-[#aaa] font-[inherit]"
            placeholder="Ask Devy"
            aria-label="Ask Devy a question"
          />
        </form>
      </aside>}

      {!isCoding && <footer
        className={`grid grid-cols-[1fr_auto] items-center border-t border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] pt-2.5 px-6 pb-4 max-[720px]:pt-2 max-[720px]:px-3.5 max-[720px]:pb-3 transition-[margin-left] duration-[180ms] ease-in-out ${isDevyPanelOpen ? 'ml-80 max-[720px]:ml-0' : 'ml-0'}`}
      >
        <button
          type="button"
          className={`grid w-[70px] h-[70px] max-[720px]:w-[58px] max-[720px]:h-[58px] place-items-center border-0 bg-transparent p-0 ${focusRing}`}
          onClick={() => setIsDevyOpen(true)}
          aria-label="Open Devy chat"
          aria-expanded={isDevyOpen}
        >
          <img className="w-full h-full object-contain" src="/assets/devy.svg" alt="" />
        </button>
        <ActionButton
          variant="primary"
          className="min-w-[200px] max-[720px]:min-w-[164px] min-h-[50px] text-[15px] font-semibold"
          onClick={() => { setIsDevyOpen(false); setStep(NEXT_STEP[step]) }}
        >
          {CONTINUE_LABEL[step]}
        </ActionButton>
      </footer>}
    </section>
  )
}

