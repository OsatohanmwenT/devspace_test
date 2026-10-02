import test from 'node:test'
import assert from 'node:assert/strict'
import { canPost, CHANNELS, dmKey, getConversation, getDirectContacts, getLeagueLead, postLeagueMessage } from './leagueChat.js'
import { createPrivateLeague, joinPrivateLeagueByCode, leavePrivateLeague } from './privateLeagues.js'
import { USER_ID } from './leagueSim.js'
import { getSeasonStartFromIndex } from './season.js'

const DAY_MS = 24 * 60 * 60 * 1000
const SEASON = 34
const midSeason = getSeasonStartFromIndex(SEASON) + 14 * DAY_MS
const clock = { seasonIndex: SEASON, timestamp: midSeason }

const owned = createPrivateLeague({ privateLeagues: {} }, 'Year 11 Cup', '🏆', { id: 'mine', code: 'ABC234', kind: 'class' })
const ownedLeague = owned.privateLeagues.mine
const joined = joinPrivateLeagueByCode({ privateLeagues: {} }, 'XYZ789')
const joinedLeague = Object.values(joined.privateLeagues)[0]

test('you lead a league you created; a joined league gets a stable lead from its roster', () => {
  assert.equal(getLeagueLead(ownedLeague).id, USER_ID)
  const lead = getLeagueLead(joinedLeague)
  assert.ok(joinedLeague.memberRivalIds.includes(lead.id))
  assert.equal(getLeagueLead(joinedLeague).id, lead.id)
})

test('the lead is listed first among direct contacts', () => {
  const [first] = getDirectContacts(joinedLeague)
  assert.equal(first.isLead, true)
  assert.equal(getDirectContacts(ownedLeague).some((contact) => contact.isLead), false)
})

test('only the lead can post announcements; anyone can post in the other channels', () => {
  assert.equal(canPost(ownedLeague, 'announcements'), true)
  assert.equal(canPost(joinedLeague, 'announcements'), false)
  for (const channel of CHANNELS.filter((entry) => !entry.leadOnly)) assert.equal(canPost(joinedLeague, channel.id), true)
})

test('you can message people in the league, and no one else', () => {
  assert.equal(canPost(joinedLeague, dmKey(joinedLeague.memberRivalIds[0])), true)
  assert.equal(canPost(joinedLeague, dmKey('not-a-member')), false)
})

test('posting saves your message into that conversation only', () => {
  const next = postLeagueMessage(owned, 'mine', 'general', '  Hello class!  ', { id: 'm1', at: midSeason })
  const general = getConversation(ownedLeague, 'general', next.leagueChats, clock)
  const mine = general.filter((message) => message.author.isYou)

  assert.equal(mine.length, 1)
  assert.equal(mine[0].text, 'Hello class!')
  assert.equal(mine[0].author.isLead, true)
  assert.equal(getConversation(ownedLeague, 'help', next.leagueChats, clock).some((message) => message.author.isYou), false)
})

test('blank messages and posts where you are not allowed are ignored', () => {
  assert.equal(postLeagueMessage(owned, 'mine', 'general', '   ', { id: 'x', at: midSeason }), owned)
  assert.equal(postLeagueMessage(joined, joinedLeague.id, 'announcements', 'Hi', { id: 'x', at: midSeason }), joined)
})

test('seeded classmate posts are stable and never dated in the future', () => {
  const first = getConversation(joinedLeague, 'general', {}, clock)
  const again = getConversation(joinedLeague, 'general', {}, clock)
  assert.deepEqual(first, again)
  assert.ok(first.every((message) => message.at <= midSeason))

  const early = getConversation(joinedLeague, 'general', {}, { seasonIndex: SEASON, timestamp: getSeasonStartFromIndex(SEASON) + DAY_MS })
  assert.ok(early.length < first.length)
})

test('a joined league’s lead sends a welcome; your own league’s announcements start empty', () => {
  const lead = getLeagueLead(joinedLeague)
  const dm = getConversation(joinedLeague, dmKey(lead.id), {}, clock)
  assert.equal(dm.length, 1)
  assert.equal(dm[0].author.isLead, true)
  assert.deepEqual(getConversation(ownedLeague, 'announcements', {}, clock), [])
})

test('leaving a league clears its class space', () => {
  const withMessage = postLeagueMessage(owned, 'mine', 'general', 'Hi', { id: 'm1', at: midSeason })
  const left = leavePrivateLeague(withMessage, 'mine')
  assert.equal(left.leagueChats.mine, undefined)
})
