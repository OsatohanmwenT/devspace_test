import { seededRandom } from './rng.js'

// Bronze's cash-winner ceiling (180, see lib/rewardConfig.js) is bigger than
// the hand-authored rival pool (45) — without more identities, everyone in a
// Bronze cohort would be a cash winner, which defeats the point of showing a
// reward-zone boundary at all. This tops the pool up procedurally rather than
// hand-authoring hundreds of personas. Precomputed once at module load, since
// it's deterministic and would otherwise be regenerated on every cohort build.
const FIRST_NAMES = [
  'Ade', 'Bola', 'Chike', 'Dara', 'Emeka', 'Funmi', 'Grace', 'Hana', 'Ibrahim', 'Jide',
  'Kemi', 'Lola', 'Musa', 'Ngozi', 'Obi', 'Peju', 'Quincy', 'Rita', 'Segun', 'Tolu',
  'Uche', 'Vera', 'Wale', 'Yusuf', 'Zainab', 'Amara', 'Bayo', 'Chidi', 'Dayo', 'Efe',
]
const LAST_NAMES = [
  'Adeyemi', 'Balogun', 'Chukwu', 'Danjuma', 'Eze', 'Fashola', 'Garba', 'Hassan', 'Idowu', 'Jibrin',
  'Kalu', 'Lawal', 'Mohammed', 'Nnamdi', 'Okafor', 'Peters', 'Quadri', 'Raji', 'Suleiman', 'Tunde',
]
const ROLES = [
  'Product Designer', 'UX/UI Designer', 'Data Scientist path', 'Backend Developer path',
  'AI Engineer path', 'Machine Learning Engineer path', 'Student',
]

const SYNTHETIC_POOL_SIZE = 320

function buildSyntheticRival(index) {
  const random = seededRandom('synthetic-rival', index)
  const first = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)]
  const last = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)]
  const role = ROLES[Math.floor(random() * ROLES.length)]
  // Same shape and rough range as the hand-authored rivals in data/rivals.js,
  // so a synthetic entry is indistinguishable from an authored one in the sim.
  const pace = 20 + Math.round(random() * 75)
  const consistency = 0.35 + random() * 0.55
  const tag = random() < 0.1 ? 'PRO' : null

  return { id: `synth-${index}`, name: `${first} ${last}`, role, tag, pace, consistency }
}

export const SYNTHETIC_RIVALS = Array.from({ length: SYNTHETIC_POOL_SIZE }, (_, index) => buildSyntheticRival(index))
