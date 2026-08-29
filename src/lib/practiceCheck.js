// Pure completion checks for every `practice` activity mode (see
// LessonPractice.jsx). Kept separate from the component so the "did the
// learner actually get this right" logic is unit-testable without React.

export function isTableTaskComplete(task, clicked) {
  if (!clicked || clicked.type !== task.target.type) return false
  if (task.target.type === 'row') return clicked.rowId === task.target.rowId
  if (task.target.type === 'column') return clicked.columnKey === task.target.columnKey
  return clicked.rowId === task.target.rowId && clicked.columnKey === task.target.columnKey
}

export function isTableTasksComplete(tasks, answeredTaskIds) {
  return tasks.every((task) => answeredTaskIds.includes(task.id))
}

export function isSortComplete(items, assignments) {
  return items.every((item) => assignments[item.id] === item.zone)
}

export function isIssueSpotterComplete(issues, foundIssueIds) {
  return issues.every((issue) => foundIssueIds.includes(issue.id))
}

export function isReorderCorrect(order, correctOrder) {
  return order.length === correctOrder.length && order.every((id, index) => id === correctOrder[index])
}

export function isFieldSelectionValid(selectedKeys, requiredKeys, optionalKeys = []) {
  const allowed = new Set([...requiredKeys, ...optionalKeys])
  const hasAllRequired = requiredKeys.every((key) => selectedKeys.includes(key))
  const hasNoForbidden = selectedKeys.every((key) => allowed.has(key))
  return hasAllRequired && hasNoForbidden
}
