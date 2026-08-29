import { getLeague, leagues } from '../../data/leagues'
import { getRewardPool } from '../../lib/rewardConfig'
import { PageIntroStages } from '../ui/PageIntroStages'

// Fires once, the very first time the leaderboard becomes available — so in
// practice this is always Bronze, but it's still driven by `leagueIndex`
// rather than hardcoded, the same "no number lives twice" rule the reward
// config itself follows.
export function LeaderboardIntroduction({ leagueIndex = 0, onComplete }) {
  const league = getLeague(leagueIndex)
  const leagueName = league.name.replace(' League', '')
  const nextLeague = league.promoteCount > 0 && leagueIndex + 1 < leagues.length ? getLeague(leagueIndex + 1) : null

  const stages = [
    {
      eyebrow: 'Leagues',
      title: `Welcome to ${leagueName}`,
      body: 'You’ve been showing up. Now let’s see how far you can climb.',
      mood: 'walking',
    },
    {
      eyebrow: 'Learn. Master. Earn.',
      title: 'Devy Coins are earned, not given',
      body: 'A clean first-try answer, a finished lesson, a real practice round — all earn competitive Devy Coins. Repeating what you already know does not.',
      mood: 'neutral',
    },
    {
      eyebrow: `${league.name} reward pool`,
      title: `₦${getRewardPool(league.id).toLocaleString()}`,
      body: nextLeague
        ? `Climb into a reward position. Top learners can unlock ${nextLeague.name}.`
        : 'Climb into a reward position — this is the top league, so every rank here counts.',
      mood: 'celebrating',
    },
  ]

  return (
    <PageIntroStages
      stages={stages}
      finalActionLabel={`Enter ${leagueName}`}
      onDone={onComplete}
      ariaLabel={`Welcome to ${league.name}`}
    />
  )
}
