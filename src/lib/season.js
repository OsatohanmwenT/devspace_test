// Extensions included so this module also resolves under `node --test`, which
// does not do Vite's extensionless resolution.

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

// A season is four of the old weekly cycles back to back — a clean multiple,
// so season 0 still lines up with the historical week-0 anchor and rollovers
// stay on the same Sunday-23:00 boundary the app has always used.
export const SEASON_LENGTH_DAYS = 28
const SEASON_MS = SEASON_LENGTH_DAYS * DAY_MS

const BOUNDARY_HOUR = 23
const ANCHOR = new Date(2024, 0, 7, BOUNDARY_HOUR, 0, 0, 0).getTime()

const SIM_OFFSET_KEY = 'devspace-sim-offset'

function readSimOffsetHours() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('simOffset')
    if (fromUrl !== null) {
      const parsed = Number(fromUrl)
      if (Number.isFinite(parsed)) {
        window.sessionStorage.setItem(SIM_OFFSET_KEY, String(parsed))
        return parsed
      }
    }
    const stored = Number(window.sessionStorage.getItem(SIM_OFFSET_KEY))
    return Number.isFinite(stored) ? stored : 0
  } catch {
    return 0
  }
}

// Every clock read in the simulation goes through here, so a single offset
// shifts the whole league forward and makes the season cycle demonstrable.
export function now() {
  return Date.now() + readSimOffsetHours() * HOUR_MS
}

export function getSeasonStart(timestamp) {
  const elapsed = timestamp - ANCHOR
  const seasonsElapsed = Math.floor(elapsed / SEASON_MS)
  return ANCHOR + seasonsElapsed * SEASON_MS
}

// Rounding absorbs the ±1h drift a DST transition introduces between boundaries.
export function getSeasonIndex(timestamp) {
  return Math.round((getSeasonStart(timestamp) - ANCHOR) / SEASON_MS)
}

export function getSeasonStartFromIndex(seasonIndex) {
  return getSeasonStart(ANCHOR + seasonIndex * SEASON_MS + DAY_MS)
}

export function getSeasonEnd(timestamp) {
  return getSeasonStartFromIndex(getSeasonIndex(timestamp) + 1)
}

// How far through the season we are, 0 at the boundary and 1 at the next one.
export function getSeasonProgress(timestamp) {
  const start = getSeasonStart(timestamp)
  const end = getSeasonEnd(timestamp)
  return Math.min(1, Math.max(0, (timestamp - start) / (end - start)))
}

export function getTimeRemaining(timestamp) {
  return Math.max(0, getSeasonEnd(timestamp) - timestamp)
}

// A season is long enough that hours only matter on the last day — "23h left"
// reads as urgent at day 27 of 28 but would be alarmist anywhere else in it.
export function formatTimeRemaining(ms) {
  if (ms <= 0) return 'Ending now'
  const days = Math.floor(ms / DAY_MS)
  const hours = Math.floor((ms % DAY_MS) / HOUR_MS)
  const minutes = Math.floor((ms % HOUR_MS) / (60 * 1000))
  if (days > 0) return `${days}d left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}
