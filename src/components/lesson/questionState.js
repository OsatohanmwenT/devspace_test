// One answer model for every question type, shared by the practice quiz and the
// lesson flow so blank-filling and checking aren't reimplemented per surface.

export const FILL_TYPES = ['fill', 'code-fill']
// A "run this query, click the rows it returns" task — see TableSelect in
// LessonQuestion.jsx. The answer is an unordered array of selected row ids.
export const TABLE_TYPES = ['table-select']

export function isFillType(question) {
  return FILL_TYPES.includes(question.type)
}

export function isTableType(question) {
  return TABLE_TYPES.includes(question.type)
}

export function emptyAnswer(question) {
  if (isFillType(question)) return Array(question.answers.length).fill(undefined)
  if (isTableType(question)) return []
  return undefined
}

export function isQuestionComplete(question, answer) {
  if (isFillType(question)) {
    const blanks = answer ?? []
    return blanks.length === question.answers.length && blanks.every((blank) => blank !== undefined)
  }
  if (isTableType(question)) return (answer ?? []).length > 0
  return answer !== undefined
}

export function isQuestionCorrect(question, answer) {
  if (isFillType(question)) return question.answers.every((expected, index) => question.options[answer?.[index]] === expected)
  if (isTableType(question)) {
    const selected = [...(answer ?? [])].sort()
    const expected = [...question.correctRowIds].sort()
    return selected.length === expected.length && selected.every((id, index) => id === expected[index])
  }
  return answer === question.correctIndex
}

// A wrong attempt with a retry left clears only the wrong blanks — a
// correctly-filled blank stays put so a retry doesn't undo progress the
// learner already got right.
export function clearIncorrectBlanks(question, answer) {
  const blanks = [...(answer ?? [])]
  return blanks.map((selectedIndex, blankIndex) =>
    question.options[selectedIndex] === question.answers[blankIndex] ? selectedIndex : undefined,
  )
}

// Row selection is a plain toggle — clicking a selected row deselects it.
export function toggleRowSelection(answer, rowId) {
  const current = answer ?? []
  return current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId]
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
