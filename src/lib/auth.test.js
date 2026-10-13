import assert from 'node:assert/strict'
import test from 'node:test'
import { MIN_PASSWORD_LENGTH, validateAuthForm, validateConfirmPassword, validateEmail, validatePassword } from './auth.js'

test('emails are checked for shape, not just presence', () => {
  assert.ok(validateEmail(''))
  assert.ok(validateEmail('no-at-sign'))
  assert.ok(validateEmail('a@b'))
  assert.equal(validateEmail('  Ada@Example.com '), null)
})

test('only new passwords have to meet the length rule', () => {
  const short = 'x'.repeat(MIN_PASSWORD_LENGTH - 1)
  assert.ok(validatePassword(short, { creating: true }))
  assert.equal(validatePassword(short), null)
  assert.ok(validatePassword(''))
})

test('sign-up asks for the password twice; sign-in does not', () => {
  const fields = { email: 'ada@example.com', password: 'longenough1' }
  assert.deepEqual(Object.keys(validateAuthForm({ mode: 'signup', ...fields })), ['confirmPassword'])
  assert.deepEqual(validateAuthForm({ mode: 'signup', ...fields, confirmPassword: 'longenough1' }), {})
  assert.deepEqual(validateAuthForm({ mode: 'signin', ...fields }), {})
})

test('a mismatched confirmation is caught', () => {
  assert.equal(validateConfirmPassword('longenough1', 'longenough1'), null)
  assert.ok(validateConfirmPassword('longenough1', 'longenough2'))
  assert.ok(validateConfirmPassword('longenough1', ''))
})

test('every bad field is reported at once', () => {
  const errors = validateAuthForm({ mode: 'signup', email: 'nope', password: '123' })
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'password'])
})
