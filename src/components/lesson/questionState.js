// One answer model for every question type, shared by the practice quiz and the
// lesson flow so blank-filling and checking aren't reimplemented per surface.

export const FILL_TYPES = ['fill', 'code-fill']

export function isFillType(question) {
  return FILL_TYPES.includes(question.type)
}

export function emptyAnswer(question) {
  return isFillType(question) ? Array(question.answers.length).fill(undefined) : undefined
}

export function isQuestionComplete(question, answer) {
  if (!isFillType(question)) return answer !== undefined
  const blanks = answer ?? []
  return blanks.length === question.answers.length && blanks.every((blank) => blank !== undefined)
}

export function isQuestionCorrect(question, answer) {
  if (!isFillType(question)) return answer === question.correctIndex
  return question.answers.every((expected, index) => question.options[answer?.[index]] === expected)
}

// Fills the first empty blank; returns the answer unchanged when all are taken.
export function fillNextBlank(question, answer, optionIndex) {
  const blanks = [...(answer ?? emptyAnswer(question))]
  const nextBlank = blanks.findIndex((blank) => blank === undefined)
  if (nextBlank === -1) return blanks
  blanks[nextBlank] = optionIndex
  return blanks
}

export function clearBlank(answer, blankIndex) {
  const blanks = [...(answer ?? [])]
  blanks[blankIndex] = undefined
  return blanks
}

// Retry should not punish the blanks the learner already got right — only
// the wrong ones are cleared, so a partially-correct fill question keeps its
// progress across a retry instead of starting over from empty.
export function clearIncorrectBlanks(question, answer) {
  const blanks = [...(answer ?? [])]
  return blanks.map((selectedIndex, blankIndex) =>
    question.options[selectedIndex] === question.answers[blankIndex] ? selectedIndex : undefined,
  )
}
