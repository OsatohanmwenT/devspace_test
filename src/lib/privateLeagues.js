// Private leagues are social rivalry on top of the same official Season Devy
// Coins — they never touch promotion, demotion, or official coin totals
// (nothing here reads or writes leagueIndex/seasonCoins/seasonIndex on the
// stored progress object; getPrivateLeagueStandings only ever reads a coin
// total, never writes one).
//
// This app has no backend, so "inviting a friend" can't really reach another
// device. Rather than fake that, a private league's members are drawn from
// the same simulated rival pool the official leaderboard already uses
// (data/rivals.js) — the same honest-demo pattern PlansView's Premium
// toggle uses elsewhere in the app. A code always derives the same league,
// so it stays stable across reloads and "joins" feel real even though
// nothing is actually being fetched from anywhere.
import { rivals } from '../data/rivals.js'
import { rankEntries, USER_ID } from './leagueSim.js'
import { seededRandom } from './rng.js'

const USER_ROLE = 'Machine Learning Engineer path'
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I — easy to read aloud
const CODE_LENGTH = 6
const MIN_MEMBERS = 4
const MAX_MEMBERS = 6

const LEAGUE_NAME_ADJECTIVES = ['Midnight', 'Steady', 'Bright', 'Quiet', 'Rapid', 'Golden', 'Northern', 'Prime']
const LEAGUE_NAME_NOUNS = ['Coders', 'Learners', 'Builders', 'Crew', 'Circle', 'Squad', 'Collective', 'League']

export function generateInviteCode() {
  let code = ''
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return code
}

function normalizeCode(code) {
  return (code ?? '').trim().toUpperCase()
}

// Picks a fixed, stable subset of rivals for a league — seeded so the same
// id always draws the same roster, same determinism principle as
// leagueSim.js's buildCohort.
function pickMembers(seedKey) {
  const random = seededRandom('private-members', seedKey)
  const count = MIN_MEMBERS + Math.floor(random() * (MAX_MEMBERS - MIN_MEMBERS + 1))
  const pool = [...rivals]
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    const held = pool[index]
    pool[index] = pool[swap]
    pool[swap] = held
  }
  return pool.slice(0, count).map((rival) => rival.id)
}

// A code a learner didn't create still has to resolve to *something* —
// deterministically, from the code alone, so the same code always joins the
// same-looking league (name + members) no matter when it's entered.
function deriveLeagueFromCode(code) {
  const random = seededRandom('private-league', code)
  const adjective = LEAGUE_NAME_ADJECTIVES[Math.floor(random() * LEAGUE_NAME_ADJECTIVES.length)]
  const noun = LEAGUE_NAME_NOUNS[Math.floor(random() * LEAGUE_NAME_NOUNS.length)]
  return {
    id: `private-${code}`,
    name: `${adjective} ${noun}`,
    code,
    memberRivalIds: pickMembers(code),
    createdAt: Date.now(),
  }
}

export function createPrivateLeague(current, name) {
  const trimmedName = (name ?? '').trim()
  if (!trimmedName) return current

  const id = `private-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
  const code = generateInviteCode()
  const league = {
    id,
    name: trimmedName,
    code,
    memberRivalIds: pickMembers(id),
    createdAt: Date.now(),
  }

  return { ...current, privateLeagues: { ...current.privateLeagues, [id]: league } }
}

// Joining twice with the same code is a no-op rather than a duplicate entry
// — the derived league's id is the code itself, so the existing-key check
// is exactly "have I already got this league".
export function joinPrivateLeagueByCode(current, code) {
  const normalized = normalizeCode(code)
  if (!normalized) return current

  const league = deriveLeagueFromCode(normalized)
  if (current.privateLeagues?.[league.id]) return current

  return { ...current, privateLeagues: { ...current.privateLeagues, [league.id]: league } }
}

export function leavePrivateLeague(current, leagueId) {
  if (!current.privateLeagues?.[leagueId]) return current
  const next = { ...current.privateLeagues }
  delete next[leagueId]
  return { ...current, privateLeagues: next }
}

// Ranks a private league's members alongside the learner, using the exact
// score they already have on the official board — a private league has no
// pace/difficulty concept of its own, so members' coins come straight off
// rival.pace/consistency rather than being routed through any league's pace
// multiplier (mixing learners who may be in different official leagues).
export function getPrivateLeagueStandings(league, userSeasonCoins, seasonIndex) {
  const entries = (league.memberRivalIds ?? [])
    .map((rivalId) => rivals.find((rival) => rival.id === rivalId))
    .filter(Boolean)
    .map((rival) => {
      const random = seededRandom('private-coins', league.id, rival.id, seasonIndex)
      const score = Math.round(rival.pace * rival.consistency * (0.7 + random() * 0.7))
      return { id: rival.id, name: rival.name, role: rival.role, tag: rival.tag, score, isCurrentUser: false }
    })

  entries.push({ id: USER_ID, name: 'You', role: USER_ROLE, tag: null, score: userSeasonCoins, isCurrentUser: true })
  return rankEntries(entries)
}
