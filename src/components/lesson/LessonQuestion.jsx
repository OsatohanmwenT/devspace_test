import { DevyMood } from '../ui/DevyMood'
import { RichText } from './RichText'
import { tokenizePython, TOKEN_CLASSES } from './pythonHighlight'
import { clearBlank, fillNextBlank, isFillType, isQuestionCorrect } from './questionState'

const BLANK_BASE = 'inline-flex min-w-[102px] max-[720px]:min-w-[86px] min-h-[38px] max-[720px]:min-h-9 items-center justify-center mx-[3px] rounded-lg px-2.5 max-[720px]:px-2 py-[3px] font-jetbrains-mono text-[14px] font-medium leading-[1.2] align-middle focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#6699ec]'

function blankClassName(checked, selected, correct) {
  if (checked && selected && correct) return `${BLANK_BASE} border border-solid cursor-pointer border-[#04adc0] bg-[#213c3f] [[data-theme=light]_&]:bg-[#cee9ed] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800`
  if (checked && selected) return `${BLANK_BASE} border border-solid cursor-pointer border-[#ff676d] bg-[#442f30] [[data-theme=light]_&]:bg-[#f6e1e2] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800`
  if (selected) return `${BLANK_BASE} border border-solid cursor-pointer border-[#6699ec] bg-[#303030] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800`
  return `${BLANK_BASE} border border-dashed cursor-default border-[#515151] [[data-theme=light]_&]:border-[#d5d5d5] bg-[#303030] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800`
}

function Blank({ question, answer, blankIndex, checked, onAnswer, onDropOption }) {
  const selectedIndex = answer?.[blankIndex]
  const selected = selectedIndex === undefined ? undefined : question.options[selectedIndex]
  const correct = selected === question.answers[blankIndex]

  return (
    <button
      type="button"
      className={blankClassName(checked, selected, correct)}
      disabled={checked}
      onClick={() => onAnswer(clearBlank(answer, blankIndex))}
      onDragOver={(event) => {
        if (!selected && !checked) event.preventDefault()
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDropOption(Number(event.dataTransfer.getData('text/plain')), blankIndex)
      }}
      aria-label={selected ? `Blank ${blankIndex + 1}: ${selected}. Activate to clear.` : `Blank ${blankIndex + 1}: empty`}
    >
      {selected ?? ' '}
    </button>
  )
}

function TokenBank({ question, answer, checked, onAnswer }) {
  const used = answer ?? []

  return (
    <div className="flex flex-wrap gap-2.5" role="group" aria-label="Answer options">
      {question.options.map((option, optionIndex) => (
        <button
          type="button"
          key={optionIndex}
          className="min-h-11 rounded-[10px] border border-[#4a4a4a] [[data-theme=light]_&]:border-[#d5d5d5] bg-[#303030] [[data-theme=light]_&]:bg-white px-4 font-jetbrains-mono text-[14px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 transition-[border-color,background] duration-[120ms] enabled:hover:border-[#6699ec] enabled:hover:bg-[#393747] [[data-theme=light]_&]:enabled:hover:bg-[#f0f5fd] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#6699ec]"
          disabled={used.includes(optionIndex) || checked}
          draggable={!used.includes(optionIndex) && !checked}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', String(optionIndex))
          }}
          onClick={() => onAnswer(fillNextBlank(question, answer, optionIndex))}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

// Code with blanks — a Parsons-style exercise. The static parts are syntax
// highlighted; the blanks are the same fill model as prose questions.
function CodeFill({ question, answer, checked, onAnswer, onDropOption }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#404040] [[data-theme=light]_&]:border-[#3a3a3a] bg-[#1e1e1e]">
      <div className="flex items-center gap-2 border-b border-[#404040] bg-[#252526] px-4 py-2.5">
        <span className="grid h-4 w-4 place-items-center rounded-sm bg-[#569cd6] text-[9px] font-bold text-neutral-800">PY</span>
        <span className="font-jetbrains-mono text-[13px] text-[#d4d4d4]">{question.filename ?? 'script.py'}</span>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 font-jetbrains-mono text-[14px] leading-[1.8] text-[#d4d4d4]">
        <code>
          {question.segments.map((segment, index) => (
            <span key={index}>
              {tokenizePython(segment).map((token, tokenIndex) => (
                <span key={tokenIndex} className={TOKEN_CLASSES[token.type]}>{token.value}</span>
              ))}
              {index < question.answers.length && (
                <Blank question={question} answer={answer} blankIndex={index} checked={checked} onAnswer={onAnswer} onDropOption={onDropOption} />
              )}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}

function ProseFill({ question, answer, checked, onAnswer, onDropOption }) {
  return (
    <p className="m-0 text-[clamp(18px,1.5vw,21px)] max-[720px]:text-[19px] leading-[1.55] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
      {question.segments.map((segment, index) => (
        <span key={index}>
          {segment}
          {index < question.answers.length && (
            <Blank question={question} answer={answer} blankIndex={index} checked={checked} onAnswer={onAnswer} onDropOption={onDropOption} />
          )}
        </span>
      ))}
    </p>
  )
}

function MultipleChoice({ question, answer, checked, onAnswer }) {
  return (
    <div className="grid gap-2" role="group" aria-label={question.prompt}>
      {question.options.map((option, optionIndex) => {
        const isSelected = answer === optionIndex
        const isCorrectOption = optionIndex === question.correctIndex
        const isIncorrectSelection = checked && isSelected && !isCorrectOption
        const optionClassName = checked && isCorrectOption
          ? 'border-[#2b5540] bg-[#16281f] [[data-theme=light]_&]:border-[#b6e3ca] [[data-theme=light]_&]:bg-[#e7f6ee]'
          : isIncorrectSelection
            ? 'border-[#ff676d] bg-[#442f30] [[data-theme=light]_&]:border-[#ff676d] [[data-theme=light]_&]:bg-[#fdecea]'
            : isSelected
              ? 'border-[#6699ec] bg-[#2f2e3e] [[data-theme=light]_&]:bg-[#e4eaf4]'
              : 'border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] hover:border-[#6699ec]'

        return (
          <button
            type="button"
            key={optionIndex}
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left text-[15px] leading-[1.5] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 transition-[border-color,background] duration-[120ms] ${optionClassName}`}
            aria-pressed={isSelected}
            aria-invalid={isIncorrectSelection}
            disabled={checked}
            onClick={() => onAnswer(optionIndex)}
          >
            <RichText content={option} />
            {checked && isCorrectOption && <svg className="size-5 flex-none text-[#16834e]" viewBox="0 0 24 24" fill="none" aria-label="Correct answer"><path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            {isIncorrectSelection && <svg className="size-5 flex-none text-[#b3261e]" viewBox="0 0 24 24" fill="none" aria-label="Incorrect answer"><path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
          </button>
        )
      })}
    </div>
  )
}

export function LessonQuestion({ question, answer, checked, onAnswer, onAskDevy, headingLevel: Heading = 'h2', prefix }) {
  const correct = checked && isQuestionCorrect(question, answer)
  const placeOption = (optionIndex, blankIndex) => {
    if (checked || !Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= question.options.length || answer?.includes(optionIndex) || answer?.[blankIndex] !== undefined) return
    const nextAnswer = [...(answer ?? Array(question.answers.length).fill(undefined))]
    nextAnswer[blankIndex] = optionIndex
    onAnswer(nextAnswer)
  }

  return (
    <section className="grid w-full max-w-[720px] gap-3">
      <Heading className="m-0 font-rethink-sans text-[19px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
        {prefix}<RichText content={question.prompt} />
      </Heading>

      {isFillType(question)
        ? <div className="grid gap-3 rounded-2xl border border-[#373737] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#202020] [[data-theme=light]_&]:bg-[#f7f7f7] p-3.5 max-[720px]:p-3">
          {question.type === 'code-fill'
            ? <CodeFill question={question} answer={answer} checked={checked} onAnswer={onAnswer} onDropOption={placeOption} />
            : <ProseFill question={question} answer={answer} checked={checked} onAnswer={onAnswer} onDropOption={placeOption} />}
          <div className="grid gap-2.5">
            <p className="m-0 text-[15px] font-semibold text-[#b2b2b6] [[data-theme=light]_&]:text-[#777]">Click or drag an option to fill the blanks:</p>
            <TokenBank question={question} answer={answer} checked={checked} onAnswer={onAnswer} />
          </div>
        </div>
        : <MultipleChoice question={question} answer={answer} checked={checked} onAnswer={onAnswer} />}

      {checked && (
        <div className="grid gap-3">
          <div className={`rounded-2xl border px-5 py-3.5 ${correct ? 'border-[#2b5540] bg-[#16281f] [[data-theme=light]_&]:border-[#b6e3ca] [[data-theme=light]_&]:bg-[#e7f6ee]' : 'border-[#5c2f2b] bg-[#2a1817] [[data-theme=light]_&]:border-[#f5c6c2] [[data-theme=light]_&]:bg-[#fdecea]'}`}>
            <strong className={`block text-sm ${correct ? 'text-[#6ee7a8] [[data-theme=light]_&]:text-[#197a4b]' : 'text-[#ffa8a2] [[data-theme=light]_&]:text-[#b3261e]'}`}>{correct ? 'Correct' : 'Not quite'}</strong>
            <p className="m-0 mt-2 text-[15px] leading-[1.55] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800"><RichText content={question.explanation} /></p>
          </div>

          {/* The same flat "Still confused?" ran after a win and a miss alike.
              Devy takes the miss personally — at the question, not the learner —
              which is what makes the offer of help land instead of nag. */}
          {onAskDevy && <aside className="flex items-center gap-3 rounded-xl border border-[#404040] bg-[#262626] px-4 py-2.5 [[data-theme=light]_&]:border-[#e7e7e7] [[data-theme=light]_&]:bg-white max-[720px]:items-start" aria-label="Get help from Devy">
            <DevyMood mood={correct ? 'neutral' : 'annoyed'} className="size-9 flex-none" />
            <div className="min-w-0 flex-1">
              <strong className="block text-sm text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{correct ? 'Want the why?' : 'That one catches people out.'}</strong>
              <p className="m-0 mt-0.5 text-[13px] leading-[1.4] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{correct ? 'Devy can unpack why this answer works.' : 'Devy can walk you through it.'}</p>
            </div>
            <button type="button" className="min-h-9 flex-none rounded-lg border border-[#5c5c60] bg-transparent px-3.5 text-sm font-semibold text-[#f4f4f2] hover:border-[#6699ec] hover:bg-[#303030] [[data-theme=light]_&]:border-[#e5e5e5] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:border-[#d4d4d4] [[data-theme=light]_&]:hover:bg-[#fafafa]" onClick={onAskDevy}>Ask Devy</button>
          </aside>}
        </div>
      )}
    </section>
  )
}
