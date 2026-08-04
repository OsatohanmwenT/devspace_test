const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const WEEK_MS = 7 * DAY_MS

// Leagues roll over Sunday at 23:00 local time.
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
// shifts the whole league forward and makes the weekly cycle demonstrable.
export function now() {
  return Date.now() + readSimOffsetHours() * HOUR_MS
}

export function getWeekStart(timestamp) {
  const shifted = new Date(timestamp - BOUNDARY_HOUR * HOUR_MS)
  const dayStart = new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate())
  dayStart.setDate(dayStart.getDate() - dayStart.getDay())
  return dayStart.getTime() + BOUNDARY_HOUR * HOUR_MS
}

// Rounding absorbs the ±1h drift a DST transition introduces between boundaries.
export function getWeekIndex(timestamp) {
  return Math.round((getWeekStart(timestamp) - ANCHOR) / WEEK_MS)
}

export function getWeekStartFromIndex(weekIndex) {
  return getWeekStart(ANCHOR + weekIndex * WEEK_MS + DAY_MS)
}

export function getWeekEnd(timestamp) {
  return getWeekStartFromIndex(getWeekIndex(timestamp) + 1)
}

// How far through the week we are, 0 at the boundary and 1 at the next one.
export function getWeekProgress(timestamp) {
  const start = getWeekStart(timestamp)
  const end = getWeekEnd(timestamp)
  return Math.min(1, Math.max(0, (timestamp - start) / (end - start)))
}

export function getTimeRemaining(timestamp) {
  return Math.max(0, getWeekEnd(timestamp) - timestamp)
}

export function formatTimeRemaining(ms) {
  if (ms <= 0) return 'Ending now'
  const days = Math.floor(ms / DAY_MS)
  const hours = Math.floor((ms % DAY_MS) / HOUR_MS)
  const minutes = Math.floor((ms % HOUR_MS) / (60 * 1000))
  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}
