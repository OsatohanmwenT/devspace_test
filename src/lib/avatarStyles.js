// Every avatar in Devspace — the learner's own and every simulated rival's —
// is a DiceBear SVG generated locally (no network calls, no external image
// hosting): https://www.dicebear.com/. Same style+seed always produces the
// same image, which is what lets a rival "have" a stable-looking avatar
// without any profile object to store it in.
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

// A curated subset of DiceBear's ~28 collection styles — enough variety to
// browse (illustrated people, a robot, an emoji, pixel art, minimalist
// portraits) without shipping every style's shape data in the bundle.
export const AVATAR_STYLES = [
  { id: 'adventurer', label: 'Adventurer', style: adventurer },
  { id: 'avataaars', label: 'Avataaars', style: avataaars },
  { id: 'notionists', label: 'Notionists', style: notionists },
  { id: 'micah', label: 'Micah', style: micah },
  { id: 'openPeeps', label: 'Open Peeps', style: openPeeps },
  { id: 'personas', label: 'Personas', style: personas },
  { id: 'bottts', label: 'Bot', style: bottts },
  { id: 'pixelArt', label: 'Pixel Art', style: pixelArt },
  { id: 'funEmoji', label: 'Fun Emoji', style: funEmoji },
  { id: 'thumbs', label: 'Thumbs', style: thumbs },
]

// A handful of fixed seeds shown for every style in the picker, so browsing
// "all the styles" always previews the same six faces per style rather than
// a different random set on every open.
export const PREVIEW_SEEDS = ['nova', 'atlas', 'juno', 'orion', 'luna', 'kai']

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
// reloads and the learner's own placeholder avatar doesn't shuffle underneath
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
