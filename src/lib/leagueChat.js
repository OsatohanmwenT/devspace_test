// The class space for a private league: shared channels everyone in the
// league reads (Discord/Skool-style), plus direct messages with the lead or
// any member. It's what turns a league from a scoreboard into a classroom.
//
// Same honest-demo rule as the rest of private leagues (see
// privateLeagues.js): there's no backend, so classmates are the simulated
// rival personas. Their messages are seeded deterministically from the
// league and channel, so the space reads the same on every reload, and they
// never pretend to reply to you. Your own messages are real and saved on
// this device, in progress.leagueChats.
import { rivals } from '../data/rivals.js'
import { USER_ID } from './leagueSim.js'
import { seededRandom } from './rng.js'
import { getSeasonStartFromIndex } from './season.js'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
export const MAX_MESSAGE_LENGTH = 2000

export const CHANNELS = [
  { id: 'announcements', name: 'announcements', topic: 'Updates from the lead', leadOnly: true },
  { id: 'general', name: 'general', topic: 'Chat with the whole class' },
  { id: 'help', name: 'help', topic: 'Stuck on something? Ask here' },
  { id: 'wins', name: 'wins', topic: 'Share what you finished or shipped' },
]

const SEEDED_POSTS = {
  announcements: [
    'Welcome, everyone! Standings reset each season, so every week counts. Aim for a little progress most days rather than one big push.',
    'Reminder: a lesson a day keeps your streak alive — and the consistent star is picked from the people who show up.',
    'Halfway point this week. Check the board and see who you can catch!',
  ],
  general: [
    'Morning all — anyone else doing a lesson before class?',
    'That last practice round was tougher than I expected 😅',
    'Who else is trying to keep a streak going this week?',
    'Just realised how close the middle of the board is. Game on.',
    'Anyone want to pair up on the next module?',
  ],
  help: [
    'Can someone explain the difference between a list and a tuple? The lesson example lost me.',
    'Stuck on the checkpoint question about loops — any hints without spoilers?',
    'Does practice count toward coins if I repeat a session the same day?',
    'What’s the best order to do the review questions in?',
  ],
  wins: [
    'Finished the whole first module today 🎉',
    'Cleared a checkpoint first try — finally!',
    '7-day streak! Didn’t think I’d manage it.',
    'Built my first small project from the lesson — it actually runs.',
  ],
}

const LEAD_WELCOME_DM = (league) => `Hi! Welcome to ${league.name}. Message me here if anything’s unclear, and post in #help if you’re stuck — someone usually knows.`

export function isLeadYou(league) {
  return league?.ownerId === USER_ID
}

// Whoever runs the league. If you created it, that's you; a league you
// joined by code gets a lead from its roster — deterministic, so it's the
// same person every time.
export function getLeagueLead(league) {
  if (isLeadYou(league)) return { id: USER_ID, name: 'You', isYou: true }
  const ids = league.memberRivalIds ?? []
  if (!ids.length) return null
  const random = seededRandom('league-lead', league.id)
  const rival = rivals.find((entry) => entry.id === ids[Math.floor(random() * ids.length)])
  return rival ? { id: rival.id, name: rival.name, role: rival.role, isYou: false } : null
}

export const dmKey = (personId) => `dm:${personId}`
export const isDmKey = (key) => key.startsWith('dm:')

// The people you can message: the lead first (unless it's you), then
// everyone else in the league.
export function getDirectContacts(league) {
  const lead = getLeagueLead(league)
  const members = (league.memberRivalIds ?? [])
    .map((id) => rivals.find((rival) => rival.id === id))
    .filter(Boolean)
    .map((rival) => ({ id: rival.id, name: rival.name, role: rival.role, isLead: rival.id === lead?.id }))
  return [...members.filter((member) => member.isLead), ...members.filter((member) => !member.isLead)]
}

export function canPost(league, key) {
  const channel = CHANNELS.find((entry) => entry.id === key)
  if (channel?.leadOnly) return isLeadYou(league)
  if (isDmKey(key)) return (league.memberRivalIds ?? []).includes(key.slice(3))
  return Boolean(channel)
}

function authorFor(league, authorId) {
  const lead = getLeagueLead(league)
  if (authorId === USER_ID) return { id: USER_ID, name: 'You', isYou: true, isLead: lead?.id === USER_ID }
  const rival = rivals.find((entry) => entry.id === authorId)
  return { id: authorId, name: rival?.name ?? 'Former member', role: rival?.role, isYou: false, isLead: lead?.id === authorId }
}

// Posts from classmates, spread across the season so far. Only people still
// in the league post, and nothing is dated after `timestamp`.
function seededMessages(league, key, seasonIndex, timestamp) {
  const seasonStart = getSeasonStartFromIndex(seasonIndex)
  const lead = getLeagueLead(league)

  if (isDmKey(key)) {
    const personId = key.slice(3)
    if (!lead || lead.isYou || personId !== lead.id) return []
    return [{ id: `seed-${key}`, authorId: lead.id, text: LEAD_WELCOME_DM(league), at: seasonStart + 2 * HOUR_MS, seeded: true }]
  }

  const posts = SEEDED_POSTS[key] ?? []
  if (key === 'announcements' && (!lead || lead.isYou)) return []
  const members = (league.memberRivalIds ?? []).filter((id) => id !== lead?.id)
  if (!members.length && key !== 'announcements') return []

  const random = seededRandom('league-chat', league.id, key, seasonIndex)
  const elapsedDays = Math.max(0, (timestamp - seasonStart) / DAY_MS)
  return posts
    .map((text, index) => {
      const authorId = key === 'announcements' ? lead.id : members[Math.floor(random() * members.length)]
      const day = (index / posts.length) * 27 + random() * 2
      return { id: `seed-${key}-${index}`, authorId, text, at: seasonStart + day * DAY_MS + (8 + random() * 12) * HOUR_MS, seeded: true }
    })
    .filter((message) => message.at <= timestamp && (message.at - seasonStart) / DAY_MS <= elapsedDays)
}

export function getConversation(league, key, stored, { seasonIndex, timestamp }) {
  const own = (stored?.[league.id]?.[key] ?? []).filter((message) => message.at <= timestamp || message.authorId === USER_ID)
  return [...seededMessages(league, key, seasonIndex, timestamp), ...own]
    .sort((a, b) => a.at - b.at)
    .map((message) => ({ ...message, author: authorFor(league, message.authorId) }))
}

// The latest message in a conversation, for the sidebar preview.
export function getLastMessage(league, key, stored, clock) {
  const messages = getConversation(league, key, stored, clock)
  return messages[messages.length - 1] ?? null
}

// `id` and `at` are rolled by the caller, same reason as createPrivateLeague:
// a React updater can run twice, and this has to stay pure.
export function postLeagueMessage(current, leagueId, key, text, { id, at }) {
  const league = current.privateLeagues?.[leagueId]
  const trimmed = (text ?? '').trim()
  if (!league || !trimmed || !canPost(league, key)) return current

  const leagueChats = current.leagueChats ?? {}
  const thread = leagueChats[leagueId]?.[key] ?? []
  const message = { id, authorId: USER_ID, text: trimmed.slice(0, MAX_MESSAGE_LENGTH), at }
  return {
    ...current,
    leagueChats: { ...leagueChats, [leagueId]: { ...leagueChats[leagueId], [key]: [...thread, message] } },
  }
}
