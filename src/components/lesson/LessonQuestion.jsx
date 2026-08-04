import { RichText } from './RichText'
import { tokenizePython, TOKEN_CLASSES } from './pythonHighlight'
import { clearBlank, fillNextBlank, isFillType, isQuestionCorrect } from './questionState'

const BLANK_BASE = 'inline-flex min-w-[102px] max-[720px]:min-w-[86px] min-h-[38px] max-[720px]:min-h-9 items-center justify-center mx-[3px] rounded-lg px-2.5 max-[720px]:px-2 py-[3px] text-[15px] leading-[1.2] align-middle font-[inherit] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#6f66ec]'

function blankClassName(checked, selected, correct) {
  if (checked && selected && correct) return `${BLANK_BASE} border border-solid cursor-pointer border-[#04adc0] bg-[#213c3f] [[data-theme=light]_&]:bg-[#cee9ed] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]`
  if (checked && selected) return `${BLANK_BASE} border border-solid cursor-pointer border-[#ff676d] bg-[#442f30] [[data-theme=light]_&]:bg-[#f6e1e2] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]`
  if (selected) return `${BLANK_BASE} border border-solid cursor-pointer border-[#6f66ec] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]`
  return `${BLANK_BASE} border border-dashed cursor-default border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]`
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
          className="min-h-11 rounded-[10px] border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-4 font-[inherit] text-[15px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818] transition-[border-color,background] duration-[120ms] enabled:hover:border-[#6f66ec] enabled:hover:bg-[#272634] [[data-theme=light]_&]:enabled:hover:bg-[#f1f0fd] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#6f66ec]"
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
    <div className="overflow-hidden rounded-xl border border-[#404040] [[data-theme=light]_&]:border-[#3a3a3a] bg-[#1e1e1e]">
      <div className="flex items-center gap-2 border-b border-[#404040] bg-[#252526] px-4 py-2.5">
        <span className="grid h-4 w-4 place-items-center rounded-sm bg-[#569cd6] text-[9px] font-bold text-[#1e1e1e]">PY</span>
        <span className="font-['JetBrains_Mono',ui-monospace,monospace] text-xs text-[#d4d4d4]">{question.filename ?? 'script.py'}</span>
      </div>
      <pre className="overflow-x-auto p-4 font-['JetBrains_Mono',ui-monospace,monospace] text-[14px] leading-[1.9] text-[#d4d4d4]">
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
    <p className="m-0 text-[clamp(19px,2.2vw,24px)] max-[720px]:text-xl leading-[1.7] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]">
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
    <div className="grid gap-2.5" role="group" aria-label={question.prompt}>
      {question.options.map((option, optionIndex) => {
        const isSelected = answer === optionIndex
        const isCorrectOption = optionIndex === question.correctIndex
        const optionClassName = checked && isCorrectOption
          ? 'border-[#04adc0] bg-[#213c3f] [[data-theme=light]_&]:bg-[#cee9ed]'
          : checked && isSelected
            ? 'border-[#ff676d] bg-[#442f30] [[data-theme=light]_&]:bg-[#f6e1e2]'
            : isSelected
              ? 'border-[#6f66ec] bg-[#2f2e3e] [[data-theme=light]_&]:bg-[#e5e4f4]'
              : 'border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] hover:border-[#6f66ec]'

        return (
          <button
            type="button"
            key={optionIndex}
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-[15px] leading-[1.5] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818] transition-[border-color,background] duration-[120ms] ${optionClassName}`}
            aria-pressed={isSelected}
            disabled={checked}
            onClick={() => onAnswer(optionIndex)}
          >
            <RichText content={option} />
            <span className="grid h-6 w-6 flex-none place-items-center rounded-md border border-[#404040] [[data-theme=light]_&]:border-[#d4d4d4] text-[11px] text-[#89898e] [[data-theme=light]_&]:text-[#737371]" aria-hidden="true">
              {optionIndex + 1}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function LessonQuestion({ question, answer, checked, onAnswer, headingLevel: Heading = 'h2', prefix }) {
  const correct = checked && isQuestionCorrect(question, answer)
  const placeOption = (optionIndex, blankIndex) => {
    if (checked || !Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= question.options.length || answer?.includes(optionIndex) || answer?.[blankIndex] !== undefined) return
    const nextAnswer = [...(answer ?? Array(question.answers.length).fill(undefined))]
    nextAnswer[blankIndex] = optionIndex
    onAnswer(nextAnswer)
  }

  return (
    <section className="grid gap-4">
      <Heading className="m-0 font-['Space_Grotesk',Arial,sans-serif] text-[19px] font-semibold tracking-[-0.02em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]">
        {prefix}<RichText content={question.prompt} />
      </Heading>

      {question.type === 'code-fill'
        ? <CodeFill question={question} answer={answer} checked={checked} onAnswer={onAnswer} onDropOption={placeOption} />
        : isFillType(question)
          ? <ProseFill question={question} answer={answer} checked={checked} onAnswer={onAnswer} onDropOption={placeOption} />
          : <MultipleChoice question={question} answer={answer} checked={checked} onAnswer={onAnswer} />}

      {isFillType(question) && (
        <>
          <p className="m-0 text-base font-semibold text-[#b2b2b6] [[data-theme=light]_&]:text-[#777]">Click or drag an option to fill the blanks:</p>
          <TokenBank question={question} answer={answer} checked={checked} onAnswer={onAnswer} />
        </>
      )}

      {checked && (
        <p className={`m-0 text-sm leading-[1.5] ${correct ? 'text-[#04adc0]' : 'text-[#ff676d]'}`}>
          <RichText content={question.explanation} />
        </p>
      )}
    </section>
  )
}
