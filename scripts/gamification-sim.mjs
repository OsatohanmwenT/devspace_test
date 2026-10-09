// Gamification stress simulation. Drives the app's real progression functions
// (applyActivity / applyCoins / coin + XP award rules / quests / badges /
// league resolution) through 120 simulated days for several learner personas
// and reports where the reward loop runs dry.
//
// Run: node scripts/gamification-sim.mjs
import { applyActivity, applyCoins, getPracticeXpAward, migrateProgress, getDailyXp } from '../src/data/progress.js'
import { getLessonCoinAward, getPracticeCoinAward } from '../src/lib/coins.js'
import { LESSON_XP } from '../src/lib/lessonMeta.js'
import { getDailyQuestsFromProgress } from '../src/lib/dailyQuests.js'
import { getBadges } from '../src/lib/badges.js'
import { STREAK_MILESTONES } from '../src/lib/streak.js'
import { practiceSessions } from '../src/data/practice.js'
import { lessonsById } from '../src/components/lesson/lessonContent.js'
import { getLeague } from '../src/data/leagues.js'
import { getStandings } from '../src/lib/leagueSim.js'
import { getSeasonIndex } from '../src/lib/season.js'

const DAYS = 120
const DAY_MS = 86400000
const START = new Date(2026, 0, 5, 9).getTime() // a Monday morning
const lessonIds = Object.keys(lessonsById)
const practiceIds = practiceSessions.map((s) => s.id)
const XP_GOAL = 50 // computeDailyGoal for a 10-min/day learner (≈ 5 min per 25 XP)

// Persona = which calendar days they show up, and how many lessons/practices
// they attempt when they do.
const personas = [
  { name: 'Daily grinder (2 lessons + 1 practice every day)', active: () => true, lessons: 2, practices: 1 },
  { name: 'Steady daily (1 lesson/day)', active: () => true, lessons: 1, practices: 0 },
  { name: 'Weekday learner (Mon-Fri, 1 lesson)', active: (d) => d % 7 < 5, lessons: 1, practices: 1 },
  { name: 'Casual (every 3rd day)', active: (d) => d % 3 === 0, lessons: 1, practices: 0 },
  { name: 'Binge then ghost (8 days heavy, then gone)', active: (d) => d < 8, lessons: 3, practices: 2 },
]

function simulate(persona) {
  let p = migrateProgress({}, getSeasonIndex(START))
  p.profile = { pathId: 'machine-learning', dailyMinutes: 10 }
  const log = []
  const lessonQueue = [...lessonIds]
  const practiceQueue = [...practiceIds]
  const events = { milestones: [], contentDryDay: null, firstZeroRewardDay: null, firstEmptyDay: null, zeroRewardDays: 0, activeDays: 0, busyDays: 0 }
  let prevBadgeCount = 0

  for (let day = 0; day < DAYS; day += 1) {
    const stamp = START + day * DAY_MS
    const today = new Date(stamp).toDateString()
    const wants = persona.active(day)
    let xpToday = 0
    let coinsToday = 0
    let didSomething = false

    if (wants) {
      events.activeDays += 1
      for (let i = 0; i < persona.lessons; i += 1) {
        const id = lessonQueue.shift()
        if (!id) break
        const xp = p.completedLessons[id] ? 0 : LESSON_XP
        const coins = getLessonCoinAward(p, id)
        p = applyActivity(p, xp, today, stamp)
        p = applyCoins(p, coins, stamp)
        p = { ...p, completedLessons: { ...p.completedLessons, [id]: { completedAt: today } } }
        xpToday += xp; coinsToday += coins; didSomething = true
      }
      for (let i = 0; i < persona.practices; i += 1) {
        const id = practiceQueue.shift()
        if (!id) break
        const xp = getPracticeXpAward(p, id, today)
        const coins = getPracticeCoinAward(p, id)
        p = applyActivity(p, xp, today, stamp)
        p = applyCoins(p, coins, stamp)
        p = { ...p, completedSessions: { ...p.completedSessions, [id]: { completedAt: today } } }
        xpToday += xp; coinsToday += coins; didSomething = true
      }
      if (!didSomething) {
        // Learner showed up and there was nothing left to learn. The app still
        // offers a warm-up replay, which keeps the streak alive but pays 0.
        events.firstEmptyDay ??= day
        p = applyActivity(p, 0, today, stamp)
      }
    } else {
      // Day skipped: roll the streak clock forward the way next-open would.
      // No decay write needed: applyActivity resolves it on the next active day.
    }

    if (didSomething) {
      events.busyDays += 1
      if (xpToday + coinsToday === 0) { events.zeroRewardDays += 1; events.firstZeroRewardDay ??= day }
    }
    if (!lessonQueue.length && !practiceQueue.length) events.contentDryDay ??= day

    const hitMilestone = STREAK_MILESTONES.filter((m) => p.earnedStreakMilestones.includes(m.days) && !events.milestones.find((e) => e.days === m.days))
    hitMilestone.forEach((m) => events.milestones.push({ days: m.days, day }))

    const badgeStats = {
      streakDays: p.streakDays, longestStreak: p.longestStreak, earnedStreakMilestones: p.earnedStreakMilestones,
      lessonsCompleted: Object.keys(p.completedLessons).length, practiceSessions: Object.keys(p.completedSessions).length, xp: p.xp,
      highestLeagueIndex: p.highestLeagueIndex,
    }
    const earned = getBadges(badgeStats).filter((b) => b.earned).length
    const newBadges = earned - prevBadgeCount
    prevBadgeCount = earned

    log.push({ day, didSomething, xpToday, coinsToday, streak: p.streakDays, xp: p.xp, coins: p.seasonCoins, newBadges, earned,
      questsDone: getDailyQuestsFromProgress(p, XP_GOAL, today).filter((q) => q.done).length })
  }

  // League outcome of the first 28-day season, using the real standings sim.
  const seasonEnd = START + 27 * DAY_MS + 20 * 3600 * 1000
  const seasonCoinsAtEnd = log[27].coins
  const standings = getStandings(getSeasonIndex(START), 0, seasonCoinsAtEnd, seasonEnd)
  const rank = standings.findIndex((e) => e.isCurrentUser) + 1

  return { p, log, events, rank, cohort: standings.length, seasonCoinsAtEnd }
}

const pad = (v, n) => String(v).padEnd(n)
const out = []
const say = (s = '') => out.push(s)

say('# Gamification simulation — real progression code, 120 days')
say(`Content inventory: ${lessonIds.length} authored lessons, ${practiceIds.length} practice sessions.`)
say(`Hard ceiling on reward: ${lessonIds.length * LESSON_XP + practiceIds.length * 10} XP, ${lessonIds.length * 5 + practiceIds.length * 8} season coins — ever.`)
say()

for (const persona of personas) {
  const r = simulate(persona)
  const l = r.log
  const lastRewardDay = [...l].reverse().find((d) => d.xpToday + d.coinsToday > 0)?.day ?? -1
  say(`## ${persona.name}`)
  say(`- Days they showed up: ${r.events.activeDays}; days they actually earned something: ${r.events.busyDays - r.events.zeroRewardDays}`)
  say(`- Content ran out on day: ${r.events.contentDryDay ?? 'never'}; first "showed up, nothing to do" day: ${r.events.firstEmptyDay ?? 'never'}`)
  say(`- Last day any XP/coins were paid: day ${lastRewardDay}   (final XP ${r.p.xp}, lifetime coins ${r.p.lifetimeCoins})`)
  say(`- Streak at day 120: ${r.p.streakDays} (longest ${r.p.longestStreak}); milestones hit: ${r.events.milestones.map((m) => `${m.days}d@day${m.day}`).join(', ') || 'none'}`)
  say(`- Badges earned (of ${getBadges({}).length}): ${l.at(-1).earned}; days a new badge dropped: ${l.filter((d) => d.newBadges > 0).map((d) => d.day).join(',') || 'none'}`)
  say(`- Days with all 3 daily quests complete: ${l.filter((d) => d.questsDone === 3).length}`)
  say(`- Season 1: ${r.seasonCoinsAtEnd} coins -> rank ${r.rank}/${r.cohort} in ${getLeague(0).name}`)
  say()
}

// Reward-per-day curve for the grinder: shows the cliff.
// Rival difficulty: what does a real Bronze/Silver season cost?
import { buildCohort, rivalSeasonCoins } from '../src/lib/leagueSim.js'
for (const li of [0, 1, 2]) {
  const totals = buildCohort(getSeasonIndex(START), li).map((r) => rivalSeasonCoins(r, getSeasonIndex(START), li, 1)).sort((a, b) => b - a)
  say(`League ${getLeague(li).name}: rival season coins top=${totals[0]} 5th=${totals[4]} median=${totals[14]} last=${totals.at(-1)}  (user's lifetime content ceiling is 101)`)
}
say()
const g = simulate(personas[0])
say('## Daily reward cliff (grinder): day -> XP+coins earned')
say(g.log.slice(0, 12).map((d) => `d${d.day}:${d.xpToday}xp/${d.coinsToday}c`).join('  '))
say('...')
say(`days 12-120 total XP: ${g.log.slice(12).reduce((a, d) => a + d.xpToday, 0)}`)

// A max-effort streak can only be reached with *something* to do each day.
const s = simulate(personas[1])
say()
say('## Steady daily learner: the day the streak loop loses its meaning')
say(`Lessons run out on day ${s.events.contentDryDay}; a lesson-gated streak cannot be extended after that unless warm-ups count.`)

console.log(out.join('\n'))
