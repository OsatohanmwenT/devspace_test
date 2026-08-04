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
