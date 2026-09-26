import test from 'node:test'
import assert from 'node:assert/strict'
import { BIO_LIMIT, cleanProfileDraft, getProfileProgress, isProfileUrl, normalizeProfile, validateProfileDraft, WORK_TYPES } from './profile.js'

test('profile migration keeps existing onboarding data and adds safe defaults', () => {
  assert.deepEqual(normalizeProfile({ role: 'frontend_developer' }), {
    role: 'frontend_developer', name: '', headline: '', bio: '', photo: null, projectInterest: [], immediateNeed: [], projects: [], links: [],
  })
})

test('profile migration turns older scalar interests and needs into arrays', () => {
  const profile = normalizeProfile({ projectInterest: 'video', immediateNeed: 'build_projects' })

  assert.deepEqual(profile.projectInterest, ['video'])
  assert.deepEqual(profile.immediateNeed, ['build_projects'])
})

test('profile migration leaves evidence records in place', () => {
  const project = { id: 'project-1', title: 'Task board' }
  const link = { id: 'link-1', label: 'GitHub', url: 'https://github.com/example' }
  const profile = normalizeProfile({ projects: [project], links: [link] })

  assert.deepEqual(profile.projects, [project])
  assert.deepEqual(profile.links, [link])
})

test('profile migration supports every work type and ignores unknown types', () => {
  const projects = WORK_TYPES.map((type) => ({ id: type, title: type, type }))
  const normalized = normalizeProfile({ projects: [...projects, { id: 'legacy', title: 'Legacy' }, { id: 'bad', title: 'Bad', type: 'unknown' }] })

  assert.deepEqual(normalized.projects.slice(0, WORK_TYPES.length), projects)
  assert.deepEqual(normalized.projects.at(-2), { id: 'legacy', title: 'Legacy' })
  assert.deepEqual(normalized.projects.at(-1), { id: 'bad', title: 'Bad' })
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
    next: 'Add a work sample with proof',
    items: [
      { label: 'Add your name and headline', complete: true },
      { label: 'Add a work sample with proof', complete: false },
      { label: 'Add a relevant link', complete: false },
      { label: 'Complete verified learning', complete: true },
    ],
  })
})

test('profile progress requires valid proof and relevant links', () => {
  const emptyEvidence = getProfileProgress({ name: 'Ari', headline: 'Editor', projects: [{ title: 'Reel', url: '' }], links: [{ url: 'vimeo.com/ari' }] }, {})
  assert.equal(emptyEvidence.items[1].complete, false)
  assert.equal(emptyEvidence.items[2].complete, false)

  const realEvidence = getProfileProgress({ name: 'Ari', headline: 'Editor', projects: [{ title: 'Reel', url: 'https://vimeo.com/ari' }], links: [{ url: 'https://behance.net/ari' }] }, {})
  assert.equal(realEvidence.items[1].complete, true)
  assert.equal(realEvidence.items[2].complete, true)
})

const emptyDraft = (overrides = {}) => ({ name: '', headline: '', bio: '', links: [], projects: [], ...overrides })

test('blank link and work rows are neither errors nor saved', () => {
  const draft = emptyDraft({
    links: [{ id: 'l1', label: ' ', url: '' }],
    projects: [{ id: 'w1', title: '', url: '', description: '', type: '' }],
  })

  assert.deepEqual(validateProfileDraft(draft), {})
  assert.deepEqual(cleanProfileDraft(draft), { name: '', headline: '', bio: '', links: [], projects: [] })
})

test('profile drafts reject non-http links and untitled work', () => {
  const errors = validateProfileDraft(emptyDraft({
    bio: 'x'.repeat(BIO_LIMIT + 1),
    links: [{ id: 'l1', label: 'GitHub', url: 'github.com/ada' }],
    projects: [{ id: 'w1', title: '', url: 'javascript:alert(1)', description: 'notes', type: '' }],
  }))

  assert.deepEqual(Object.keys(errors).sort(), ['bio', 'link-l1', 'work-title-w1', 'work-url-w1'])
})

test('cleaned drafts are trimmed and satisfy the profile quests', () => {
  const cleaned = cleanProfileDraft(emptyDraft({
    name: ' Ada ',
    headline: ' Aspiring analyst ',
    links: [{ id: 'l1', label: ' GitHub ', url: ' https://github.com/ada ' }],
    projects: [{ id: 'w1', title: ' Sales dashboard ', url: 'https://example.com/d', description: '', type: 'data' }],
  }))

  assert.equal(cleaned.name, 'Ada')
  assert.deepEqual(cleaned.links, [{ id: 'l1', label: 'GitHub', url: 'https://github.com/ada' }])
  assert.equal(cleaned.projects[0].type, 'data')
  const quests = getProfileProgress(cleaned, { lessonsCompleted: 1 })
  assert.equal(quests.percent, 100)
})
