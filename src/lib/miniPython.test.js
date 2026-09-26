import test from 'node:test'
import assert from 'node:assert/strict'
import { runPython } from './miniPython.js'

const out = (code) => runPython(code).output

test('assignments, arithmetic and print', () => {
  assert.equal(out('hours_per_week = 40\nweeks_per_year = 52\nyearly_total = hours_per_week * weeks_per_year\nprint(yearly_total)'), '2080\n')
  assert.equal(out('print(7 / 2)\nprint(7 // 2)\nprint(7 % 3)\nprint(2 ** 10)'), '3.5\n3\n1\n1024\n')
  assert.equal(out('print(2 + 3 * 4)\nprint((2 + 3) * 4)\nprint(-2 ** 2)'), '14\n20\n-4\n')
})

test('floats print like Python', () => {
  assert.equal(out('print(4 / 2)\nprint(0.1 + 0.2)\nprint(3.0)'), '2.0\n0.30000000000000004\n3.0\n')
})

test('augmented assignment', () => {
  assert.equal(out('total = 10\ntotal += 5\ntotal *= 2\nprint(total)'), '30\n')
})

test('strings, concatenation, f-strings and print options', () => {
  assert.equal(out('name = "Ada"\nprint("Hi, " + name + "!")'), 'Hi, Ada!\n')
  assert.equal(out("hours = 40\nprint(f'{hours} hours, {hours * 52} a year')"), '40 hours, 2080 a year\n')
  assert.equal(out('print("a", "b", sep="-", end="!")'), 'a-b!')
  assert.equal(out('print("ab" * 3)\nprint(len("hello"))'), 'ababab\n5\n')
})

test('comments and blank lines are ignored', () => {
  assert.equal(out('# setup\nx = 1  # one\n\nprint(x)'), '1\n')
})

test('booleans and comparisons', () => {
  assert.equal(out('print(3 > 2)\nprint(1 == 1.0)\nprint(True and False)\nprint(not True)'), 'True\nTrue\nFalse\nFalse\n')
})

test('NameError names the missing variable and line', () => {
  const result = runPython('total = 5\nprint(totl)')
  assert.deepEqual(result.error, { type: 'NameError', message: "name 'totl' is not defined", line: 2, name: 'totl' })
})

test('TypeError on str + int, keeping earlier output', () => {
  const result = runPython('print("start")\nprint("Total: " + 5)')
  assert.equal(result.output, 'start\n')
  assert.equal(result.error.type, 'TypeError')
  assert.equal(result.error.line, 2)
  assert.match(result.error.message, /can only concatenate str/)
})

test('ZeroDivisionError, SyntaxError and IndentationError', () => {
  assert.equal(runPython('print(1 / 0)').error.type, 'ZeroDivisionError')
  assert.equal(runPython('print("hi"').error.type, 'SyntaxError')
  assert.equal(runPython('x = 1\n  print(x)').error.type, 'IndentationError')
  assert.equal(runPython('print("oops)').error.type, 'SyntaxError')
})

test('unsupported syntax says so instead of guessing', () => {
  const result = runPython('for i in range(3):\n    print(i)')
  assert.equal(result.error.type, 'NotSupported')
  assert.equal(result.error.line, 1)
})
