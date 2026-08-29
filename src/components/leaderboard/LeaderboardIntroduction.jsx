import { PageIntroStages } from '../ui/PageIntroStages'

const STAGES = [
  {
    title: 'Welcome to Leagues',
    body: 'Track your progress with other learners on a seasonal leaderboard.',
    mood: 'neutral',
  },
  {
    title: 'Earn Devy Coins to get ahead',
    body: 'Finish lessons and practice sessions to climb this season’s standings.',
    mood: 'neutral',
  },
  {
    title: 'Level up each season',
    body: 'When the season ends, the top of the board moves up to a tougher league.',
    mood: 'celebrating',
  },
]

export function LeaderboardIntroduction({ onComplete }) {
  return (
    <PageIntroStages
      stages={STAGES}
      finalActionLabel="See the board"
      onDone={onComplete}
      ariaLabel="About leagues"
    />
  )
}
