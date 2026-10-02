// The organizer's view of a private league — who's active, who's slipping,
// and how the whole group is trending. Built for the "a school runs a
// competition on this" case, where the person who owns the league needs more
// than a ranked list.
//
// Every number is derived from the same per-day series the standings sum
// (leagueSim.js's rivalDailyCoins), so the dashboard can never disagree with
// the board. The learner's own days come from progress.seasonCoinLog; coins
// earned before that log existed count toward their total but not any day.
import { rivals } from '../data/rivals.js'
import { rankEntries, rivalDailyCoins, USER_ID } from './leagueSim.js'
import { isCompeting } from './privateLeagues.js'
import { getSeasonProgress, getSeasonStartFromIndex, SEASON_LENGTH_DAYS } from './season.js'

const DAY_MS = 24 * 60 * 60 * 1000
const INACTIVE_AFTER_DAYS = 3
const ON_A_ROLL_STREAK = 4
const WEEK_DAYS = 7

// Star thresholds. Rising: at least this many more coins than the week
// before, and a real jump in proportion (25%+), so a 1 → 4 bump in a busy
// class doesn't beat someone who doubled a solid week. Consistent: showed up
// on at least this share of the season's days so far, over at least a
// handful of days so day two of the season can't crown anyone.
const RISING_MIN_GAIN = 3
const RISING_MIN_RATIO = 1.25
const CONSISTENT_MIN_SHARE = 0.8
const CONSISTENT_MIN_DAYS = 5

const sum = (values) => values.reduce((total, value) => total + value, 0)

function median(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2)
}

export function getSeasonDay(timestamp) {
  return Math.min(SEASON_LENGTH_DAYS - 1, Math.floor(getSeasonProgress(timestamp) * SEASON_LENGTH_DAYS))
}

// Day 0 opens Sunday 23:00, so an hour in is the calendar day people know it by.
export function getSeasonDayDate(seasonIndex, day) {
  return new Date(getSeasonStartFromIndex(seasonIndex) + day * DAY_MS + 60 * 60 * 1000)
}

// Today is still running, so a quiet today doesn't break a streak — count
// back from yesterday in that case. `active` is one boolean per season day.
function currentStreak(active, today) {
  let day = active[today] ? today : today - 1
  let streak = 0
  while (day >= 0 && active[day]) {
    streak += 1
    day -= 1
  }
  return streak
}

function lastActiveDaysAgo(active, today) {
  for (let day = today; day >= 0; day -= 1) {
    if (active[day]) return today - day
  }
  return null
}

// Maps the learner's recorded activity dates (toDateString() strings, from
// applyActivity) onto season days. It's the fallback for coins earned before
// the per-day coin log existed — without it the organizer saw a learner with
// 13 coins listed as "Not started".
function activityDays(dates, seasonIndex) {
  const days = new Set()
  for (const text of dates ?? []) {
    const date = new Date(text)
    if (Number.isNaN(date.getTime())) continue
    for (let day = 0; day < SEASON_LENGTH_DAYS; day += 1) {
      if (getSeasonDayDate(seasonIndex, day).toDateString() === date.toDateString()) days.add(day)
    }
  }
  return days
}

// Rank on a given past day, from cumulative coins up to and including it.
function rankOnDay(people, day) {
  const totals = people.map((person) => ({ id: person.id, score: sum(person.daily.slice(0, day + 1)) }))
  return new Map(rankEntries(totals).map((entry) => [entry.id, entry.rank]))
}

function windowSum(daily, from, to) {
  return sum(daily.slice(Math.max(0, from), Math.max(0, to + 1)))
}

function statusFor({ lastActive, streak }) {
  if (lastActive === null) return { id: 'inactive', label: 'Not started' }
  if (lastActive >= INACTIVE_AFTER_DAYS) return { id: 'inactive', label: `Quiet ${lastActive}d` }
  if (streak >= ON_A_ROLL_STREAK) return { id: 'hot', label: 'On a roll' }
  return { id: 'active', label: 'Active' }
}

function describeParticipant({ id, name, role, tag, total, daily, extraActiveDays, isCurrentUser }, today) {
  const active = daily.map((coins, day) => coins > 0 || Boolean(extraActiveDays?.has(day)))
  const lastActive = lastActiveDaysAgo(active, today)
  const streak = currentStreak(active, today)
  const last7 = windowSum(daily, today - 6, today)
  const prev7 = windowSum(daily, today - 13, today - 7)
  return {
    id,
    name,
    role,
    tag,
    isCurrentUser,
    score: total,
    daily: daily.slice(0, today + 1),
    // Per calendar week of the season (4 weeks of 7 days). Future days are
    // null so the weekly grid can tell "not yet" from "earned nothing".
    weeks: Array.from({ length: SEASON_LENGTH_DAYS / WEEK_DAYS }, (_, week) => {
      const days = Array.from({ length: WEEK_DAYS }, (_, offset) => {
        const day = week * WEEK_DAYS + offset
        if (day > today) return null
        return { coins: daily[day] ?? 0, active: active[day] }
      })
      const past = days.filter(Boolean)
      return { coins: sum(past.map((entry) => entry.coins)), activeDays: past.filter((entry) => entry.active).length, days }
    }),
    last7,
    prev7,
    weekDelta: last7 - prev7,
    activeDays: active.slice(0, today + 1).filter(Boolean).length,
    streak,
    lastActive,
    status: statusFor({ lastActive, streak }),
  }
}

export function getLeagueInsights(league, { seasonIndex, leagueIndex = 0, timestamp, user = {} }) {
  const today = getSeasonDay(timestamp)
  const progress = getSeasonProgress(timestamp)

  const people = (league.memberRivalIds ?? [])
    .map((rivalId) => rivals.find((rival) => rival.id === rivalId))
    .filter(Boolean)
    .map((rival) => {
      const daily = rivalDailyCoins(rival, seasonIndex, leagueIndex, progress)
      return { id: rival.id, name: rival.name, role: rival.role, tag: rival.tag, total: sum(daily), daily, isCurrentUser: false }
    })

  if (isCompeting(league)) {
    const log = user.coinLog?.seasonIndex === seasonIndex ? user.coinLog.days : []
    const daily = Array.from({ length: SEASON_LENGTH_DAYS }, (_, day) => log[day] ?? 0)
    people.push({ id: USER_ID, name: 'You', role: user.role, tag: user.tag ?? null, total: user.seasonCoins ?? 0, daily, extraActiveDays: activityDays(user.activityDates, seasonIndex), isCurrentUser: true })
  }

  // Rank a week ago, for the movement arrow. Only meaningful once the season
  // is more than a week old; before that everyone was tied at zero.
  const pastRanks = today >= 7 ? rankOnDay(people, today - 7) : null
  const ranked = rankEntries(people.map((person) => describeParticipant(person, today)))
  const participants = ranked.map((participant, index) => ({
    ...participant,
    rankChange: pastRanks ? pastRanks.get(participant.id) - participant.rank : null,
    gapAbove: index > 0 ? ranked[index - 1].score - participant.score : null,
    gapBelow: index < ranked.length - 1 ? participant.score - ranked[index + 1].score : null,
    aboveName: index > 0 ? ranked[index - 1].name : null,
  }))

  const dailyTotals = Array.from({ length: SEASON_LENGTH_DAYS }, (_, day) => ({
    day,
    date: getSeasonDayDate(seasonIndex, day),
    isFuture: day > today,
    coins: day > today ? 0 : sum(people.map((person) => person.daily[day] ?? 0)),
    active: day > today ? 0 : people.filter((person) => (person.daily[day] ?? 0) > 0).length,
  }))

  const stars = pickStars(participants, today)
  const starred = participants.map((participant) => ({
    ...participant,
    stars: [
      stars.rising[0]?.id === participant.id && 'rising',
      stars.consistent[0]?.id === participant.id && 'consistent',
    ].filter(Boolean),
  }))

  const scores = participants.map((participant) => participant.score)
  const activeThisWeek = participants.filter((participant) => participant.last7 > 0).length

  return {
    today,
    seasonDays: SEASON_LENGTH_DAYS,
    currentWeek: Math.floor(today / WEEK_DAYS),
    weekDates: Array.from({ length: SEASON_LENGTH_DAYS / WEEK_DAYS }, (_, week) => getSeasonDayDate(seasonIndex, week * WEEK_DAYS)),
    participants: starred,
    stars,
    dailyTotals,
    kpis: {
      participants: participants.length,
      activeThisWeek,
      activeShare: participants.length ? activeThisWeek / participants.length : 0,
      totalCoins: sum(scores),
      medianCoins: median(scores),
      weekCoins: sum(participants.map((participant) => participant.last7)),
      prevWeekCoins: sum(participants.map((participant) => participant.prev7)),
    },
    needsAttention: participants
      .filter((participant) => participant.status.id === 'inactive')
      .sort((a, b) => (b.lastActive ?? Infinity) - (a.lastActive ?? Infinity)),
    topMovers: [...participants]
      .filter((participant) => participant.last7 > 0)
      .sort((a, b) => b.last7 - a.last7)
      .slice(0, 3),
  }
}

// Two ways to be recognised that aren't just "top of the board": the most
// improved over the last week, and the most reliable across the season. The
// leader already gets the #1 spot — these are for the people a teacher wants
// to call out who might never top the ranking. Each list is best-first; the
// first entry is the star, the rest are runners-up.
export function pickStars(participants, today) {
  const rising = today < WEEK_DAYS
    ? []
    : participants
        .filter((participant) => participant.weekDelta >= RISING_MIN_GAIN && participant.last7 >= participant.prev7 * RISING_MIN_RATIO)
        .sort((a, b) => b.weekDelta - a.weekDelta || b.last7 - a.last7 || a.rank - b.rank)
        .slice(0, 3)

  const daysSoFar = today + 1
  const consistent = participants
    .filter((participant) => participant.activeDays >= CONSISTENT_MIN_DAYS && participant.activeDays / daysSoFar >= CONSISTENT_MIN_SHARE)
    .sort((a, b) => b.activeDays - a.activeDays || b.streak - a.streak || a.rank - b.rank)
    .slice(0, 3)

  return { rising, consistent }
}

const firstName = (name) => name.split(' ')[0]

// A ready-to-send nudge for one participant — organizers message people over
// email or a class chat this app has no access to, so the practical thing is
// text they can paste. It names the one fact most likely to get someone
// moving: the gap to the next place, or that they haven't started.
export function buildReminder(league, participant, insights) {
  const daysLeft = insights.seasonDays - insights.today - 1
  const timeLeft = daysLeft <= 0 ? 'today is the last day' : `there ${daysLeft === 1 ? 'is 1 day' : `are ${daysLeft} days`} left`
  const hello = `Hi ${firstName(participant.name)}`

  if (participant.lastActive === null) {
    return `${hello} — ${league.name} is underway and you haven't earned a coin yet. One lesson puts you on the board, and ${timeLeft}.`
  }
  if (participant.rank === 1) {
    return `${hello} — you're leading ${league.name}${participant.gapBelow ? ` by ${participant.gapBelow} coins` : ''}. Keep it going: ${timeLeft}.`
  }
  const gap = participant.gapAbove
  const chase = gap === 0 ? `you're level with ${participant.aboveName}` : `you're ${gap} coin${gap === 1 ? '' : 's'} behind ${participant.aboveName} for #${participant.rank - 1}`
  const quiet = participant.lastActive >= 3 ? ` We haven't seen you in ${participant.lastActive} days —` : ''
  return `${hello} —${quiet} in ${league.name} ${chase}, and ${timeLeft}. A lesson today could change that.`
}

function csvCell(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

// A spreadsheet-friendly export for organizers who report results elsewhere
// (a school newsletter, a grade book). One row per participant.
export function buildInsightsCsv(league, insights) {
  const header = ['Rank', 'Places moved (7 days)', 'Name', 'Path', 'Season coins', 'Coins behind next place', 'Coins last 7 days', 'Change vs previous 7 days', 'Active days', 'Current streak', 'Last active', 'Status']
  const rows = insights.participants.map((participant) => [
    participant.rank,
    participant.rankChange ?? '',
    participant.isCurrentUser ? 'You' : participant.name,
    participant.role,
    participant.score,
    participant.gapAbove ?? '',
    participant.last7,
    participant.weekDelta,
    participant.activeDays,
    participant.streak,
    participant.lastActive === null ? 'Never' : participant.lastActive === 0 ? 'Today' : `${participant.lastActive} days ago`,
    participant.status.label,
  ])
  return [[`${league.name} — season standings`], header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}
