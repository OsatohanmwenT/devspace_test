import test from 'node:test'
import assert from 'node:assert/strict'
import { getProfileLinks, getProfileProgress, getSocialUrl, isProfileUrl, normalizeProfile, WORK_TYPES } from './profile.js'

test('profile migration keeps existing onboarding data and adds safe defaults', () => {
  assert.deepEqual(normalizeProfile({ role: 'frontend_developer' }), {
    role: 'frontend_developer', name: '', headline: '', bio: '', photo: null, avatarStyle: null, projectInterest: [], immediateNeed: [], projects: [], links: [],
    pronouns: '', bioSource: 'devspace', headlineSource: 'devspace', availability: null, bannerTheme: null, bannerImage: null, featuredBadges: [],
    contact: { email: '', phone: '', location: '', website: '', github: '', linkedin: '', x: '', showEmail: false, showPhone: false },
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

test('social handles become links whether typed as a name, @handle or URL', () => {
  assert.equal(getSocialUrl('github', 'ari-dev'), 'https://github.com/ari-dev')
  assert.equal(getSocialUrl('x', '@ari'), 'https://x.com/ari')
  assert.equal(getSocialUrl('linkedin', 'linkedin.com/in/ari/'), 'https://www.linkedin.com/in/ari')
  assert.equal(getSocialUrl('github', 'https://github.com/ari'), 'https://github.com/ari')
  assert.equal(getSocialUrl('github', 'not a handle'), null)
  assert.equal(getSocialUrl('website', 'ari.dev'), 'https://ari.dev')
  assert.equal(getSocialUrl('website', 'nonsense'), null)
})

test('profile links list socials first, then valid custom links', () => {
  const links = getProfileLinks({ contact: { github: 'ari', website: 'ari.dev' }, links: [{ label: 'Blog', url: 'https://blog.ari.dev' }, { url: 'bad' }] })
  assert.deepEqual(links.map((link) => link.label), ['Website', 'GitHub', 'Blog'])
})

test('a social handle alone completes the link quest', () => {
  assert.equal(getProfileProgress({ contact: { github: 'ari' } }, {}).items[2].complete, true)
})
