import { useRef, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { LessonQuestion } from './LessonQuestion'
import { isQuestionComplete, isQuestionCorrect } from './questionState'

// A single-question, single-attempt recall check — not the in-lesson retry
// flow. Kept deliberately simple: the reinforcement surface for this phase is
// "does this still stick," not another coaching loop.
export function RecallCheckModal({ conceptTitle, question, onOutcome, onClose }) {
  const [answer, setAnswer] = useState(undefined)
  const [checked, setChecked] = useState(false)
  const hasReportedOutcome = useRef(false)

  const canCheck = isQuestionComplete(question, answer)

  const finish = () => {
    if (!hasReportedOutcome.current) {
      hasReportedOutcome.current = true
      const correct = isQuestionCorrect(question, answer)
      onOutcome({ correct, attempts: 1, firstTryCorrect: correct })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 px-5">
      <div
        className="relative grid w-full max-w-[560px] gap-5 rounded-3xl bg-[#14252c] px-7 py-7 shadow-[0_18px_48px_rgba(0,0,0,.45)] [[data-theme=light]_&]:bg-white max-[520px]:px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recall-check-title"
      >
        <button
          type="button"
          className="absolute right-5 top-5 grid size-9 place-items-center rounded-lg border-0 bg-transparent text-[#b2b2b6] hover:bg-[#262626] hover:text-[#f4f4f2] [[data-theme=light]_&]:text-[#777] [[data-theme=light]_&]:hover:bg-[#f5f5f5]"
          onClick={onClose}
          aria-label="Close, without recording an outcome"
        >
          <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        <p id="recall-check-title" className="m-0 pr-8 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#9a9a9d]">
          Quick review · {conceptTitle}
        </p>

        <LessonQuestion question={question} answer={answer} checked={checked} onAnswer={setAnswer} headingLevel="h2" />

        <ActionButton
          variant="primary"
          className="min-h-11 w-full text-[15px] font-semibold"
          onClick={checked ? finish : () => setChecked(true)}
          disabled={!checked && !canCheck}
        >
          {checked ? 'Done' : 'Check'}
        </ActionButton>
      </div>
    </div>
  )
}
