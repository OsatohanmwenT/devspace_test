import { useState } from 'react';
import { ActionButton } from '../ui/ActionButton';
import { LessonQuestion } from './LessonQuestion';
import { isQuestionComplete, isQuestionCorrect } from './questionState';

// Multi-question page used by Practice sessions. The lesson flow renders one
// question per screen instead — see LessonView.
export function LessonQuiz({ quiz, initialState, onStateChange, onComplete, onChecked }) {
  const [answers, setAnswers] = useState(initialState?.answers ?? {})
  const [checked, setChecked] = useState(initialState?.checked ?? false)

  const updateState = (nextAnswers, nextChecked) => {
    setAnswers(nextAnswers)
    setChecked(nextChecked)
    onStateChange?.({ answers: nextAnswers, checked: nextChecked })
  }

  const canCheck = quiz.questions.every((question) => isQuestionComplete(question, answers[question.id]))
  const correctCount = quiz.questions.filter((question) => isQuestionCorrect(question, answers[question.id])).length

  const checkAnswers = () => {
    updateState(answers, true)
    onChecked?.({ correctCount, total: quiz.questions.length })
    if (correctCount === quiz.questions.length) onComplete?.()
  }

  return (
    <article className="h-full overflow-auto bg-[#1f1f1f] [[data-theme=light]_&]:bg-white" aria-labelledby="lesson-quiz-title">
      <div className="w-[min(100%,760px)] mx-auto pt-[clamp(24px,4vw,48px)] px-7 pb-10 max-[720px]:pt-6 max-[720px]:px-5 max-[720px]:pb-9">
        <h1
          id="lesson-quiz-title"
          className="max-w-[22ch] mt-0 mb-2.5 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rethink-sans text-[clamp(26px,3vw,34px)] max-[720px]:text-[28px] font-semibold leading-[1.15]"
        >
          {quiz.title}
        </h1>
        <p className="max-w-[58ch] m-0 text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] text-[17px] max-[720px]:text-base leading-[1.55]">{quiz.intro}</p>

        <div className="grid gap-7 max-[720px]:gap-6 mt-7 max-[720px]:mt-6 max-w-[62ch]">
          {quiz.questions.map((question, questionIndex) => (
            <LessonQuestion
              key={question.id}
              question={question}
              prefix={`${questionIndex + 1}. `}
              answer={answers[question.id]}
              checked={checked}
              onAnswer={(nextAnswer) => updateState({ ...answers, [question.id]: nextAnswer }, false)}
            />
          ))}
        </div>

        <div className="flex items-center gap-3.5 mt-8 max-[720px]:flex-wrap">
          <ActionButton
            variant="primary"
            className="min-w-[200px] min-h-[50px] text-[15px] font-semibold"
            disabled={!canCheck}
            onClick={checkAnswers}
            aria-describedby={!canCheck ? 'lesson-quiz-check-hint' : undefined}
          >
            Check answers
          </ActionButton>
          {!canCheck && <span className="text-[#89898e] [[data-theme=light]_&]:text-[#aaa] text-[13px]" id="lesson-quiz-check-hint">Answer every question to unlock</span>}
          {checked && canCheck && (
            <p className="m-0 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-sm font-semibold" role="status">
              {correctCount} of {quiz.questions.length} correct
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
