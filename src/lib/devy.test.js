import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLessonFlow } from '../components/lesson/lessonFlow.js'
import { lessonsById } from '../components/lesson/lessonContent.js'
import { getFallbackResponse, getGreeting, getPrompts, getResponse, matchPrompt, PROMPT_LABELS, toPlainText } from './devy.js'

const allSteps = Object.values(lessonsById).flatMap((lesson) => buildLessonFlow(lesson))
const questionSteps = allSteps.filter((step) => step.type === 'question')
const articleSteps = allSteps.filter((step) => step.type === 'article')

function responseText(response) {
  return `${toPlainText(response?.body)}${response?.code ?? ''}`.trim()
}

test('every helpable step offers prompts, and every prompt returns real content', () => {
  const helpable = [...articleSteps, ...questionSteps]
  assert.ok(helpable.length > 0)

  for (const step of helpable) {
    for (const checked of [false, true]) {
      const prompts = getPrompts(step, checked)
      assert.ok(prompts.length > 0, `${step.id} offers no prompts (checked=${checked})`)

      for (const { id, label } of prompts) {
        assert.equal(label, PROMPT_LABELS[id])
        const response = getResponse(id, step, { checked })
        assert.ok(response, `${step.id} → "${id}" returned nothing`)
        assert.ok(responseText(response).length > 0, `${step.id} → "${id}" was empty`)
      }
    }
  }
})

test('milestone steps offer no prompts', () => {
  for (const step of allSteps.filter((item) => item.kind !== 'activity')) {
    assert.deepEqual(getPrompts(step, false), [])
  }
})

test('a hint never names the correct answer', () => {
  const choiceSteps = questionSteps.filter((step) => step.question.type === 'multiple-choice')
  assert.ok(choiceSteps.length > 0)

  for (const step of choiceSteps) {
    const hint = responseText(getResponse('hint', step, { checked: false }))
    const correct = toPlainText(step.question.options[step.question.correctIndex])
    assert.ok(!hint.includes(correct), `hint for ${step.id} leaks "${correct}"`)
  }
})

test('a hint on a fill question falls back to the concept, not the answers', () => {
  const fillSteps = questionSteps.filter((step) => step.question.type !== 'multiple-choice')
  assert.ok(fillSteps.length > 0)

  for (const step of fillSteps) {
    const hint = responseText(getResponse('hint', step, { checked: false }))
    assert.ok(hint.length > 0)
    for (const answer of step.question.answers) {
      // The worked example legitimately contains these tokens; the hint must not
      // be the answer list itself.
      assert.ok(hint !== answer, `hint for ${step.id} is just the answer`)
    }
  }
})

test('"why is that the answer" is withheld until the learner has checked', () => {
  for (const step of questionSteps) {
    assert.ok(!getPrompts(step, false).some((item) => item.id === 'why'))
    assert.ok(getPrompts(step, true).some((item) => item.id === 'why'))
    assert.equal(getResponse('why', step, { checked: false }), null)
  }
})

test('"show me the example" appears only on articles that have one', () => {
  for (const step of articleSteps) {
    const offered = getPrompts(step, false).some((item) => item.id === 'example')
    assert.equal(offered, Boolean(step.content?.example), `${step.id} offers the wrong example prompt`)
  }
})

test('the greeting adapts to the profile and survives a missing one', () => {
  assert.match(getGreeting({ role: 'ml_engineer' }), /Machine Learning Engineer/)
  assert.match(getGreeting({ role: 'ui_ux_designer' }), /UI\/UX Designer/)

  for (const profile of [null, undefined, {}, { role: null }, { role: 'not_a_real_role' }]) {
    const greeting = getGreeting(profile)
    assert.ok(greeting.length > 0)
    assert.ok(!greeting.includes('undefined') && !greeting.includes('null'))
  }
})

test('typed text routes to the matching prompt', () => {
  const step = questionSteps.find((item) => item.question.type === 'multiple-choice')
  const unchecked = getPrompts(step, false)

  assert.equal(matchPrompt('give me a hint', unchecked), 'hint')
  assert.equal(matchPrompt("I'm stuck", unchecked), 'hint')
  assert.equal(matchPrompt('can you explain the concept?', unchecked), 'explain')
  assert.equal(matchPrompt('I am confused', unchecked), 'explain')
})

test('typed text cannot unlock an answer the chips are withholding', () => {
  const step = questionSteps[0]
  const unchecked = getPrompts(step, false)

  // "why" is not available before checking, so asking for it must fall through.
  assert.equal(matchPrompt('why is that the answer', unchecked), null)
  assert.equal(matchPrompt('which one is correct?', unchecked), null)

  // Once checked, the same phrasing resolves.
  assert.equal(matchPrompt('why is that the answer', getPrompts(step, true)), 'why')
})

test('unmatched text falls back to what is actually available', () => {
  const step = questionSteps[0]
  const available = getPrompts(step, false)

  assert.equal(matchPrompt('what is the meaning of life', available), null)
  const fallback = getFallbackResponse(available)
  assert.ok(toPlainText(fallback.body).length > 0)
  // The fallback names the real prompts rather than inventing capability.
  assert.ok(toPlainText(fallback.body).includes('hint'))
})

test('empty and whitespace input never matches', () => {
  const available = getPrompts(questionSteps[0], false)
  for (const text of ['', '   ', '\n']) {
    assert.equal(matchPrompt(text, available), null)
  }
})

test('unknown prompts and missing steps resolve to null rather than throwing', () => {
  assert.equal(getResponse('nonsense', questionSteps[0], { checked: true }), null)
  assert.equal(getResponse('hint', null), null)
  assert.deepEqual(getPrompts(null), [])
})
