import { PageIntroStages } from '../ui/PageIntroStages'

const STAGES = [
  {
    title: 'Weekly rivalries',
    body: 'Each week you’re matched one-on-one against a rival, with the whole matchup visible as it happens.',
    mood: 'neutral',
  },
  {
    title: 'Win = 3, draw = 1, loss = 0',
    body: 'Whoever earns more verified Devy Coins during the week wins the matchup. Points add up all season.',
    mood: 'neutral',
  },
  {
    title: 'Rivalry only',
    body: 'Head-to-head never touches your official coins, rank, or rewards — it’s bragging rights, not another economy.',
    mood: 'celebrating',
  },
]

export function HeadToHeadIntroduction({ onComplete }) {
  return (
    <PageIntroStages
      stages={STAGES}
      finalActionLabel="See this week's matchup"
      onDone={onComplete}
      ariaLabel="About head-to-head"
    />
  )
}
