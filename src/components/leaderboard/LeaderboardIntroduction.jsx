import { PageIntroStages } from '../ui/PageIntroStages'

const STAGES = [
  {
    title: 'Welcome to Leagues',
    body: 'Track your progress with other learners on a weekly leaderboard.',
    mood: 'neutral',
  },
  {
    title: 'Earn XP to get ahead',
    body: 'Finish lessons and practice sessions to climb this week’s standings.',
    mood: 'neutral',
  },
  {
    title: 'Level up each week',
    body: 'When the week ends, the top of the board moves up to a tougher league.',
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
