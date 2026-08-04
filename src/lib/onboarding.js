import {
  BRANCHES,
  branchTriage,
  dailyTimeOptions,
  experienceOptions,
  immediateNeedOptions,
  motivationOptions,
  outcomes,
  projectInterestOptions,
  roleOptions,
  roleSubQuiz,
  startingPointOptions,
} from '../data/onboarding.js'

const RUNG_REQUIRING_PLACEMENT = 2

export function getExperienceRung(experience) {
  return experienceOptions.find((option) => option.value === experience)?.rung ?? 1
}

// A role is resolved either directly or via the sub-quiz, which writes back
// here rather than leaving `help_me_choose` sitting in the answer.
export function resolveRole(answers) {
  const { role, roleFromSubQuiz } = answers
  if (role && role !== 'help_me_choose') return role
  return roleFromSubQuiz ?? null
}

export function resolveBranch(answers) {
  const { branch, branchFromTriage } = answers
  if (branch && branch !== 'not_sure') return branch
  return branchFromTriage ?? null
}

// The ordered list of steps this particular set of answers has to walk. The
// progress bar reads its length, so it stays honest as branches open and close.
export function getVisibleSteps(answers = {}) {
  const steps = [{ id: 'welcome', type: 'intro' }, { id: 'motivation', type: 'single' }]

  steps.push({ id: 'branch', type: 'single' })
  if (answers.branch === 'not_sure') steps.push({ id: 'branch_triage', type: 'single' })

  const branch = resolveBranch(answers)
  if (branch) steps.push({ id: 'role', type: 'role_reveal' })
  if (branch && answers.role === 'help_me_choose') steps.push({ id: 'role_sub_quiz', type: 'single' })

  const role = resolveRole(answers)
  if (role) steps.push({ id: 'role_payoff', type: 'payoff' })

  steps.push({ id: 'experience', type: 'single' })
  // Below rung 2 there is nothing meaningful to place against, so the question
  // is skipped rather than shown with a single sensible answer.
  if (role && getExperienceRung(answers.experience) >= RUNG_REQUIRING_PLACEMENT) {
    steps.push({ id: 'starting_point', type: 'single' })
  }

  steps.push({ id: 'project_interest', type: 'single' })
  steps.push({ id: 'immediate_need', type: 'single' })
  steps.push({ id: 'goals_payoff', type: 'payoff' })
  steps.push({ id: 'daily_time', type: 'single' })
  steps.push({ id: 'commitment_payoff', type: 'payoff' })
  steps.push({ id: 'summary', type: 'summary' })

  return steps
}

export function getStepOptions(stepId, answers = {}) {
  const branch = resolveBranch(answers)
  const role = resolveRole(answers)

  switch (stepId) {
    case 'motivation': return motivationOptions
    // The escape hatch has to exist as a selectable option, not just as a
    // branch the resolver knows how to handle.
    case 'branch': return [...BRANCHES, { value: 'not_sure', label: 'I’m not sure yet' }]
    case 'branch_triage': return branchTriage.options
    case 'role': return branch ? roleOptions[branch] ?? [] : []
    case 'role_sub_quiz': return branch ? roleSubQuiz[branch]?.options ?? [] : []
    case 'experience': return experienceOptions
    case 'starting_point': return role ? startingPointOptions[role] ?? [] : []
    case 'project_interest': return projectInterestOptions
    case 'immediate_need': return immediateNeedOptions
    case 'daily_time': return dailyTimeOptions
    default: return []
  }
}

// Which answer key a step writes. The sub-quiz and triage write to their own
// keys so the raw branch/role answers stay intact for analytics.
export const STEP_ANSWER_KEY = {
  motivation: 'motivation',
  branch: 'branch',
  branch_triage: 'branchFromTriage',
  role: 'role',
  role_sub_quiz: 'roleFromSubQuiz',
  experience: 'experience',
  starting_point: 'startingPoint',
  project_interest: 'projectInterest',
  immediate_need: 'immediateNeed',
  daily_time: 'dailyMinutes',
}

export function resolvePlacement(answers = {}) {
  const role = resolveRole(answers)
  const rung = getExperienceRung(answers.experience)
  const ladder = role ? startingPointOptions[role] ?? [] : []

  if (!ladder.length) return null
  if (answers.startingPoint && answers.startingPoint !== 'not_sure') {
    return ladder.find((option) => option.value === answers.startingPoint) ?? ladder[0]
  }
  // "Not sure" and low-experience learners are placed by rung instead.
  return ladder[Math.min(rung - 1, ladder.length - 2)] ?? ladder[0]
}

export function resolvePath(answers = {}) {
  const role = resolveRole(answers)
  return (role && outcomes.roleToPath[role]) ?? 'machine-learning'
}

export function buildProfile(answers = {}) {
  return {
    branch: resolveBranch(answers),
    branchAnswer: answers.branch ?? null,
    role: resolveRole(answers),
    roleAnswer: answers.role ?? null,
    motivation: answers.motivation ?? null,
    experience: answers.experience ?? null,
    rung: getExperienceRung(answers.experience),
    startingPoint: resolvePlacement(answers)?.value ?? null,
    projectInterest: answers.projectInterest ?? null,
    immediateNeed: answers.immediateNeed ?? null,
    dailyMinutes: answers.dailyMinutes ?? 10,
    pathId: resolvePath(answers),
    completedAt: new Date().toDateString(),
  }
}

export function computeDailyGoal(minutes = 10) {
  return outcomes.dailyGoalXp(minutes)
}

export function computeLessonsPerWeek(minutes = 10) {
  return outcomes.lessonsPerWeek(minutes)
}
