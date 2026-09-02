import {
  BRANCHES,
  branchTriage,
  breakPrompts,
  dailyTimeOptions,
  experienceOptions,
  immediateNeedOptions,
  javascriptExperienceOptions,
  motivationOptions,
  outcomes,
  projectInterestOptions,
  roleOptions,
  roleSubQuiz,
  stackOptions,
  stackSubQuiz,
  STACK_ROLES,
  startingPointOptions,
} from '../data/onboarding.js'

// Backend needs a preview before its language choice. Frontend deliberately
// has no framework default: new JavaScript learners begin on shared foundations.
const STACK_DEFAULTS = { backend_developer: 'node' }

const RUNG_REQUIRING_PLACEMENT = 2

export function getExperienceRung(experience) {
  return experienceOptions.find((option) => option.value === experience)?.rung ?? 1
}

export function getJavascriptExperienceRung(javascriptExperience) {
  return javascriptExperienceOptions.find((option) => option.value === javascriptExperience)?.rung ?? 1
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

// Same shape as resolveRole — a stack is resolved either directly or via its
// own sub-quiz, which writes back to a separate key so the raw answer stays intact.
export function resolveStack(answers) {
  const { stack, stackFromSubQuiz } = answers
  if (stack && stack !== 'help_me_choose') return stack
  return stackFromSubQuiz ?? null
}

// The single source of truth for which startingPointOptions entry a role's
// ladder actually lives under. Roles outside STACK_ROLES just use their own
// key; STACK_ROLES roles use `${role}_${stack}`, falling back to that role's
// default stack before the stack question has been answered (the role-break
// preview needs a ladder to show a step before the stack step exists).
export function resolveLadderKey(answers = {}) {
  const role = resolveRole(answers)
  if (!role) return null
  if (!STACK_ROLES.has(role)) return role

  if (role === 'frontend_developer' && !resolveStack(answers)) return 'frontend_developer_foundations'

  const stack = resolveStack(answers) ?? STACK_DEFAULTS[role]
  const key = `${role}_${stack}`
  return startingPointOptions[key] ? key : role
}

// The ordered list of steps this particular set of answers has to walk. The
// progress bar reads its length, so it stays honest as branches open and close.
export function getVisibleSteps(answers = {}) {
  const steps = [{ id: 'welcome', type: 'intro' }]
  const addQuestion = (id, type = 'single') => {
    steps.push({ id, type })
    steps.push({ id: `${id}_break`, type: 'break', questionId: id })
  }

  addQuestion('motivation')
  addQuestion('branch')
  if (answers.branch === 'not_sure') addQuestion('branch_triage')

  const branch = resolveBranch(answers)
  if (branch) addQuestion('role', 'role_reveal')
  if (branch && answers.role === 'help_me_choose') addQuestion('role_sub_quiz')

  const role = resolveRole(answers)

  if (role === 'backend_developer') addQuestion('stack')
  if (role === 'backend_developer' && answers.stack === 'help_me_choose') addQuestion('stack_sub_quiz')

  addQuestion('experience')
  if (role === 'frontend_developer') addQuestion('javascript_experience')
  if (role === 'frontend_developer' && answers.javascriptExperience !== 'new_to_javascript') addQuestion('stack')
  if (role === 'frontend_developer' && answers.javascriptExperience !== 'new_to_javascript' && answers.stack === 'help_me_choose') addQuestion('stack_sub_quiz')
  // Below rung 2 there is nothing meaningful to place against, so the question
  // is skipped rather than shown with a single sensible answer.
  const placementRung = role === 'frontend_developer'
    ? getJavascriptExperienceRung(answers.javascriptExperience)
    : getExperienceRung(answers.experience)
  if (role && placementRung >= RUNG_REQUIRING_PLACEMENT) {
    addQuestion('starting_point')
  }

  addQuestion('project_interest')
  addQuestion('immediate_need')
  addQuestion('daily_time')

  return steps
}

export function getBreakContent(questionId, answers = {}) {
  const config = breakPrompts[questionId]
  const answerKey = STEP_ANSWER_KEY[questionId]
  const values = toArray(answers[answerKey])
  const options = questionId === 'branch_triage'
    ? BRANCHES
    : questionId === 'role_sub_quiz'
      ? getStepOptions('role', answers)
      : questionId === 'stack_sub_quiz'
        ? getStepOptions('stack', answers)
        : getStepOptions(questionId, answers)
  const labels = values
    .map((value) => options.find((option) => option.value === value)?.label)
    .filter(Boolean)
  const answer = labels.length > 1 ? `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}` : labels[0] ?? 'that'
  const branch = questionId === 'branch' && values.includes('not_sure') ? 'not_sure' : resolveBranch(answers)

  if (!config) return null
  return {
    message: config.message(answer, labels, values),
    insight: typeof config.insight === 'function' ? config.insight(branch) : config.insight,
  }
}

export function getStepOptions(stepId, answers = {}) {
  const branch = resolveBranch(answers)
  const role = resolveRole(answers)

  switch (stepId) {
    case 'motivation': return motivationOptions
    // The escape hatch has to exist as a selectable option, not just as a
    // branch the resolver knows how to handle.
    case 'branch': return [...BRANCHES, { value: 'not_sure', label: 'I’m not sure yet', icon: 'help' }]
    case 'branch_triage': return branchTriage.options
    case 'role': return branch ? roleOptions[branch] ?? [] : []
    case 'role_sub_quiz': return branch ? roleSubQuiz[branch]?.options ?? [] : []
    case 'stack': return role ? stackOptions[role] ?? [] : []
    case 'stack_sub_quiz': return role ? stackSubQuiz[role]?.options ?? [] : []
    case 'experience': return experienceOptions
    case 'javascript_experience': return javascriptExperienceOptions
    case 'starting_point': {
      const ladderKey = resolveLadderKey(answers)
      return ladderKey ? startingPointOptions[ladderKey] ?? [] : []
    }
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
  stack: 'stack',
  stack_sub_quiz: 'stackFromSubQuiz',
  experience: 'experience',
  javascript_experience: 'javascriptExperience',
  starting_point: 'startingPoint',
  project_interest: 'projectInterest',
  immediate_need: 'immediateNeed',
  daily_time: 'dailyMinutes',
}

// Steps where more than one answer is genuinely reasonable. The UI reads this
// to toggle rather than replace, and buildProfile stores them as arrays.
export const MULTI_SELECT_STEPS = new Set(['project_interest', 'immediate_need'])

export function isMultiSelectStep(stepId) {
  return MULTI_SELECT_STEPS.has(stepId)
}

function toArray(value) {
  if (Array.isArray(value)) return value
  return value === undefined || value === null ? [] : [value]
}

// Groups a role's stage ladder into named phases instead of a flat list, so
// route review is a choice between 2-3 concepts rather than a scan of every
// individual stage. Works for any ladder length — every ladder here happens
// to be 5 stages, splitting into roughly Foundations / Core skills / Advanced.
const STAGE_GROUP_LABELS = ['Foundations', 'Core skills', 'Advanced']

export function getStageGroups(ladderOptions) {
  const stages = ladderOptions.filter((option) => option.value !== 'not_sure')
  const bandSize = Math.ceil(stages.length / STAGE_GROUP_LABELS.length)

  return STAGE_GROUP_LABELS
    .map((label, index) => ({
      id: label.toLowerCase().replace(/\s+/g, '_'),
      label,
      stages: stages.slice(index * bandSize, index * bandSize + bandSize),
    }))
    .filter((group) => group.stages.length > 0)
}

// One line per rung so the placement screen can say *why* rather than just
// *where* — the rung already drives placement, this just narrates it.
const RUNG_SUMMARY = {
  1: 'You’re just getting started',
  2: 'You’ve tried the basics',
  3: 'You’ve built things before',
  4: 'You’ve worked on real projects',
}

export function getExperienceAnswerLabel(answers = {}) {
  const role = resolveRole(answers)
  const isFrontend = role === 'frontend_developer'
  const options = isFrontend ? javascriptExperienceOptions : experienceOptions
  const value = isFrontend ? answers.javascriptExperience : answers.experience
  return options.find((option) => option.value === value)?.label ?? null
}

// Structured pieces for the placement screen's sentence, so the component can
// bold the role and answer without the copy living split across two files.
export function explainPlacement(answers, placement, roleLabelText) {
  if (!placement || !roleLabelText) return null
  const answerLabel = getExperienceAnswerLabel(answers)
  if (!answerLabel) return null

  const role = resolveRole(answers)
  const rung = role === 'frontend_developer' ? getJavascriptExperienceRung(answers.javascriptExperience) : getExperienceRung(answers.experience)
  const rungSummary = RUNG_SUMMARY[Math.min(rung, 4)] ?? RUNG_SUMMARY[1]

  const ladder = startingPointOptions[resolveLadderKey(answers)] ?? []
  const skipsAhead = ladder.length > 0 && ladder[0].value !== placement.value

  return {
    roleLabel: roleLabelText,
    answerLabel,
    rungSummary,
    placementLabel: placement.label,
    tail: skipsAhead
      ? `so we’d skip the very beginning and start you at ${placement.label}.`
      : `so we’ll start you right at the beginning, with ${placement.label}.`,
  }
}

// The rung-derived recommendation, independent of anything the learner has
// manually picked on the route-review screen. Kept separate from
// resolvePlacement so a "Recommended" badge (or a caption noting they moved
// off it) still points at the original suggestion after they choose a
// different stage — resolvePlacement itself starts returning that choice.
export function resolveRecommendedPlacement(answers = {}) {
  const ladderKey = resolveLadderKey(answers)
  const role = resolveRole(answers)
  const rung = role === 'frontend_developer'
    ? getJavascriptExperienceRung(answers.javascriptExperience)
    : getExperienceRung(answers.experience)
  const ladder = ladderKey ? startingPointOptions[ladderKey] ?? [] : []
  if (!ladder.length) return null
  return ladder[Math.min(rung - 1, ladder.length - 2)] ?? ladder[0]
}

export function resolvePlacement(answers = {}) {
  const ladderKey = resolveLadderKey(answers)
  const ladder = ladderKey ? startingPointOptions[ladderKey] ?? [] : []

  if (!ladder.length) return null
  if (answers.startingPoint && answers.startingPoint !== 'not_sure') {
    return ladder.find((option) => option.value === answers.startingPoint) ?? ladder[0]
  }
  // "Not sure" and low-experience learners are placed by rung instead.
  return resolveRecommendedPlacement(answers)
}

export function resolvePath(answers = {}) {
  const role = resolveRole(answers)
  return (role && outcomes.roleToPath[role]) ?? 'machine-learning'
}

export function isFrameworkCheckpointReady(profile, completedLessons = {}) {
  return profile?.role === 'frontend_developer'
    && profile?.frameworkDecision === 'pending'
    && Boolean(completedLessons['program-flow'])
}

export function buildProfile(answers = {}) {
  return {
    branch: resolveBranch(answers),
    branchAnswer: answers.branch ?? null,
    role: resolveRole(answers),
    roleAnswer: answers.role ?? null,
    stack: resolveStack(answers),
    javascriptExperience: answers.javascriptExperience ?? null,
    frameworkDecision: resolveRole(answers) === 'frontend_developer'
      ? (answers.javascriptExperience === 'new_to_javascript' ? 'pending' : resolveStack(answers) ? 'complete' : null)
      : null,
    motivation: answers.motivation ?? null,
    experience: answers.experience ?? null,
    rung: getExperienceRung(answers.experience),
    startingPoint: resolvePlacement(answers)?.value ?? null,
    projectInterest: toArray(answers.projectInterest),
    immediateNeed: toArray(answers.immediateNeed),
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
