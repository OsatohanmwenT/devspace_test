import { PageIntroStages } from '../ui/PageIntroStages'

const STAGES = [
  {
    title: 'Build a path around your goal',
    body: 'Tell Devy what you want to learn, build, or prepare for.',
    mood: 'neutral',
  },
  {
    title: 'Get a route that fits',
    body: 'Your route is shaped around your goal, experience, and the work you want to make.',
    mood: 'neutral',
  },
  {
    title: 'Start with a real lesson',
    body: 'Build practical skills now, then work toward a project you can share.',
    mood: 'celebrating',
  },
]

export function CustomPathIntroduction({ onComplete }) {
  return (
    <PageIntroStages
      stages={STAGES}
      finalActionLabel="Build my path"
      onDone={onComplete}
      ariaLabel="About custom paths"
    />
  )
}
