import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateExercise, explainError } from './codeExercise.js'

const exercise = {
  tasks: [
    { title: 'Calculate the yearly total', check: { pattern: '^\\s*\\w+\\s*=\\s*hours_per_week\\s*\\*\\s*weeks_per_year\\s*$' }, nudge: 'Multiply them.' },
    { title: 'Print the result', check: { output: '2080' }, nudge: 'Print it.' },
  ],
}
const starter = 'hours_per_week = 40\nweeks_per_year = 52\n'

test('passes when the code runs and every task holds', () => {
  const result = evaluateExercise(exercise, `${starter}yearly_total = hours_per_week * weeks_per_year\nprint(yearly_total)`)
  assert.equal(result.passed, true)
  assert.equal(result.output, '2080\n')
  assert.equal(result.coach.mood, 'success')
})

test('printing the number without calculating it does not pass', () => {
  const result = evaluateExercise(exercise, `${starter}print(2080)`)
  assert.equal(result.passed, false)
  assert.deepEqual(result.tasks.map((task) => task.done), [false, true])
  assert.equal(result.coach.text, 'Multiply them.')
})

test('the first unmet task drives the nudge', () => {
  const result = evaluateExercise(exercise, `${starter}yearly_total = hours_per_week * weeks_per_year`)
  assert.deepEqual(result.tasks.map((task) => task.done), [true, false])
  assert.equal(result.coach.text, 'Print it.')
})

test('an error fails every task and gets explained with its line', () => {
  const result = evaluateExercise(exercise, `${starter}yearly_total = hours_per_week * weeks_per_year\nprint(yearly_totl)`)
  assert.equal(result.passed, false)
  assert.equal(result.coach.mood, 'error')
  assert.equal(result.coach.line, 4)
  assert.match(result.coach.text, /Did you mean `yearly_total`\?/)
})

test('error explanations stay in plain language', () => {
  assert.match(explainError({ type: 'TypeError', message: 'can only concatenate str (not "int") to str', line: 3 }, ''), /wrap the number in `str\(\)`/)
  assert.match(explainError({ type: 'SyntaxError', message: "'(' was never closed", line: 2 }, ''), /never closes/)
  assert.match(explainError({ type: 'NameError', message: "name 'zzz' is not defined", line: 1, name: 'zzz' }, 'a = 1'), /before it's been created/)
})
