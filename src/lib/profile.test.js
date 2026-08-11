import test from 'node:test'
import assert from 'node:assert/strict'
import { getProfileProgress, isProfileUrl, normalizeProfile } from './profile.js'

test('profile migration keeps existing onboarding data and adds safe defaults', () => {
  assert.deepEqual(normalizeProfile({ role: 'frontend_developer' }), {
    role: 'frontend_developer', name: '', headline: '', projects: [], links: [],
  })
})

test('profile migration leaves evidence records in place', () => {
  const project = { id: 'project-1', title: 'Task board' }
  const link = { id: 'link-1', label: 'GitHub', url: 'https://github.com/example' }
  const profile = normalizeProfile({ projects: [project], links: [link] })

  assert.deepEqual(profile.projects, [project])
  assert.deepEqual(profile.links, [link])
})

test('only http and https proof links are accepted', () => {
  assert.equal(isProfileUrl('https://example.com/work'), true)
  assert.equal(isProfileUrl('http://example.com/work'), true)
  assert.equal(isProfileUrl('github.com/example'), false)
  assert.equal(isProfileUrl('javascript:alert(1)'), false)
})

test('profile progress identifies the next valuable evidence action', () => {
  assert.deepEqual(getProfileProgress({ name: 'Ari', headline: 'Frontend developer' }, { lessonsCompleted: 2 }), {
    percent: 50,
    next: 'Add a project with proof',
    items: [
      { label: 'Add your name and headline', complete: true },
      { label: 'Add a project with proof', complete: false },
      { label: 'Add a professional link', complete: false },
      { label: 'Complete verified learning', complete: true },
    ],
  })
})
