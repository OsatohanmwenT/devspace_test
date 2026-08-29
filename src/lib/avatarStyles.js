// DiceBear SVG avatars — generated locally (no network calls, no external
// image hosting): https://www.dicebear.com/. Same style+seed always
// produces the same image, which is what lets a simulated rival "have" a
// stable-looking avatar without any profile object to store it in.
import { createAvatar } from '@dicebear/core'
import {
  adventurer,
  avataaars,
  bottts,
  funEmoji,
  micah,
  notionists,
  openPeeps,
  personas,
  pixelArt,
  thumbs,
} from '@dicebear/collection'
import { seededRandom } from './rng.js'

// A curated subset of DiceBear's ~28 collection styles — enough variety
// (illustrated people, a robot, an emoji, pixel art, minimalist portraits)
// without shipping every style's shape data in the bundle.
//
// `requiresLeagueIndex` is the progressive-reveal gate: two looks are
// available from Bronze on, and each league you actually reach — not just
// pass through — permanently unlocks the next pair, the same "climb to see
// what's next" shape as an endless-runner's character roster. Locked styles
// still render in the picker (blurred, per LOCKED_PREVIEW_SEED below) so
// there's always something visible to climb toward, never a surprise reveal.
export const AVATAR_STYLES = [
  { id: 'adventurer', label: 'Adventurer', style: adventurer, requiresLeagueIndex: 0 },
  { id: 'avataaars', label: 'Avataaars', style: avataaars, requiresLeagueIndex: 0 },
  { id: 'notionists', label: 'Notionists', style: notionists, requiresLeagueIndex: 1 },
  { id: 'micah', label: 'Micah', style: micah, requiresLeagueIndex: 1 },
  { id: 'openPeeps', label: 'Open Peeps', style: openPeeps, requiresLeagueIndex: 2 },
  { id: 'personas', label: 'Personas', style: personas, requiresLeagueIndex: 2 },
  { id: 'bottts', label: 'Bot', style: bottts, requiresLeagueIndex: 3 },
  { id: 'pixelArt', label: 'Pixel Art', style: pixelArt, requiresLeagueIndex: 3 },
  { id: 'funEmoji', label: 'Fun Emoji', style: funEmoji, requiresLeagueIndex: 4 },
  { id: 'thumbs', label: 'Thumbs', style: thumbs, requiresLeagueIndex: 4 },
]

// A fixed seed for locked-style previews in the picker, so every learner
// sees the exact same teaser image for "what Gold unlocks" rather than a
// different random face each time — the preview is the same promise for
// everyone, only when you can actually pick it differs.
export const LOCKED_PREVIEW_SEED = 'devspace-preview'

const DEFAULT_STYLE_ID = AVATAR_STYLES[0].id
const styleById = new Map(AVATAR_STYLES.map((entry) => [entry.id, entry]))

// SVG generation is cheap but not free, and the leaderboard re-derives the
// same rival avatars on every tick — cached so a re-render never regenerates
// an image it already built.
const uriCache = new Map()

export function getAvatarDataUri(styleId, seed) {
  const entry = styleById.get(styleId) ?? styleById.get(DEFAULT_STYLE_ID)
  const resolvedSeed = seed || 'devspace'
  const cacheKey = `${entry.id}:${resolvedSeed}`

  const cached = uriCache.get(cacheKey)
  if (cached) return cached

  const uri = createAvatar(entry.style, { seed: resolvedSeed }).toDataUri()
  uriCache.set(cacheKey, uri)
  return uri
}

// Whoever hasn't picked a style yet still gets one — the same one every
// time, derived from their own seed, so a rival's look never changes across
// reloads and a learner's own placeholder avatar doesn't shuffle underneath
// them before they've made a real choice.
export function getDefaultAvatarStyleId(seed) {
  const random = seededRandom('avatar-style', seed || 'devspace')
  return AVATAR_STYLES[Math.floor(random() * AVATAR_STYLES.length)].id
}

export function resolveAvatar(avatarStyle, avatarSeed, fallbackSeed) {
  const seed = avatarSeed || fallbackSeed || 'devspace'
  const styleId = avatarStyle || getDefaultAvatarStyleId(seed)
  return { styleId, seed, uri: getAvatarDataUri(styleId, seed) }
}

// `highestLeagueIndex` is the furthest league a learner has ever *reached*
// (see data/progress.js) — permanent, so a later demotion never takes a
// style back away. Bronze (index 0) is always unlocked; anyone with no
// league history yet still gets Bronze's pair.
export function isStyleUnlocked(style, highestLeagueIndex = 0) {
  return style.requiresLeagueIndex <= (highestLeagueIndex ?? 0)
}

export function getUnlockedStyles(highestLeagueIndex = 0) {
  return AVATAR_STYLES.filter((style) => isStyleUnlocked(style, highestLeagueIndex))
}
