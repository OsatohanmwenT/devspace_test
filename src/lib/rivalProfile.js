// Synthesizes the stats the competitor-inspection drawer shows. There's no
// backend, so a rival's "recent proof" is invented — deterministically, per
// (rival.id, seasonIndex), so it's stable across reloads and re-renders
// rather than flickering to a new story every time the drawer reopens.
import { seededRandom } from './rng.js'

const PROOF_LINES = [
  'Shipped a portfolio project this week',
  'Finished a checkpoint on the first attempt',
  'Posted a write-up of a recent build',
  'Cleared a reinforcement check after a rough first pass',
  'Started a new module ahead of schedule',
]

export function getRivalProfile(rival, seasonIndex) {
  const random = seededRandom('rival-profile', rival.id, seasonIndex)

  const streakDays = 1 + Math.floor(random() * 45)
  const conceptsMastered = 3 + Math.floor(random() * 40)
  const reinforcementChecks = Math.floor(random() * 12)
  const projectMilestones = Math.floor(random() * 6)
  const recentProof = PROOF_LINES[Math.floor(random() * PROOF_LINES.length)]

  return { streakDays, conceptsMastered, reinforcementChecks, projectMilestones, recentProof }
}
