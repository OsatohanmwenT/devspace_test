import { PageIntroStages } from '../ui/PageIntroStages'

const STAGES = [
  {
    title: 'Compete with your circle',
    body: 'Create a league or join one with a code to race friends, separate from the official board.',
    mood: 'neutral',
  },
  {
    title: 'Same coins, just among friends',
    body: 'Private leagues use your Season Devy Coins. Your official rank stays unchanged.',
    mood: 'neutral',
  },
  {
    title: 'Invite with a code',
    body: 'Share your invite code or link so friends can jump straight in.',
    mood: 'celebrating',
  },
]

export function PrivateLeaguesIntroduction({ onComplete }) {
  return (
    <PageIntroStages
      stages={STAGES}
      finalActionLabel="See private leagues"
      onDone={onComplete}
      ariaLabel="About private leagues"
    />
  )
}
