import test from 'node:test'
import assert from 'node:assert/strict'
import { AVATAR_STYLES, getAvatarDataUri, getDefaultAvatarStyleId, getUnlockedStyles, isStyleUnlocked, resolveAvatar } from './avatarStyles.js'

test('every curated style has a distinct id and label', () => {
  const ids = AVATAR_STYLES.map((entry) => entry.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(AVATAR_STYLES.every((entry) => entry.label.trim().length > 0))
})

test('the same style and seed always produce the same image', () => {
  const first = getAvatarDataUri('bottts', 'ada-lovelace')
  const second = getAvatarDataUri('bottts', 'ada-lovelace')
  assert.equal(first, second)
})

test('a different seed produces a different image in the same style', () => {
  const a = getAvatarDataUri('bottts', 'ada-lovelace')
  const b = getAvatarDataUri('bottts', 'grace-hopper')
  assert.notEqual(a, b)
})

test('an unknown style id falls back rather than throwing', () => {
  assert.doesNotThrow(() => getAvatarDataUri('not-a-real-style', 'someone'))
})

test('every generated image is a usable data URI', () => {
  const uri = getAvatarDataUri('avataaars', 'someone')
  assert.ok(uri.startsWith('data:image/svg+xml'))
})

test('getDefaultAvatarStyleId is deterministic for the same seed', () => {
  assert.equal(getDefaultAvatarStyleId('rival-1'), getDefaultAvatarStyleId('rival-1'))
})

test('getDefaultAvatarStyleId always returns one of the curated styles', () => {
  const ids = new Set(AVATAR_STYLES.map((entry) => entry.id))
  for (const seed of ['a', 'b', 'c', 'd', 'e']) {
    assert.ok(ids.has(getDefaultAvatarStyleId(seed)))
  }
})

test('resolveAvatar picks a default style when none is set, and keeps a chosen one', () => {
  const withoutChoice = resolveAvatar(null, null, 'rival-7')
  assert.equal(withoutChoice.seed, 'rival-7')
  assert.ok(AVATAR_STYLES.some((entry) => entry.id === withoutChoice.styleId))

  const withChoice = resolveAvatar('pixelArt', 'my-seed', 'rival-7')
  assert.equal(withChoice.styleId, 'pixelArt')
  assert.equal(withChoice.seed, 'my-seed')
})

test('resolveAvatar falls back to a stable default seed when nothing is given', () => {
  const resolved = resolveAvatar(null, null, null)
  assert.equal(resolved.seed, 'devspace')
})

// The progressive-reveal gate: two styles start unlocked (Bronze), and
// climbing the ladder — never demotion — is the only way to more.
test('a fresh learner with no league history still has Bronze’s pair unlocked', () => {
  const unlocked = getUnlockedStyles(undefined)
  assert.equal(unlocked.length, 2)
  assert.ok(unlocked.every((style) => style.requiresLeagueIndex === 0))
})

test('unlocked styles grow monotonically with the highest league reached', () => {
  const counts = [0, 1, 2, 3, 4].map((highest) => getUnlockedStyles(highest).length)
  assert.deepEqual(counts, [2, 4, 6, 8, 10])
})

test('reaching Diamond unlocks every curated style', () => {
  assert.equal(getUnlockedStyles(4).length, AVATAR_STYLES.length)
})

test('isStyleUnlocked agrees with getUnlockedStyles for every style at every league', () => {
  for (let highest = 0; highest <= 4; highest += 1) {
    const unlockedIds = new Set(getUnlockedStyles(highest).map((style) => style.id))
    for (const style of AVATAR_STYLES) {
      assert.equal(isStyleUnlocked(style, highest), unlockedIds.has(style.id))
    }
  }
})
