import test from 'node:test'
import assert from 'node:assert/strict'
import { ALL_ROLES, BRANCHES, roleOptions, roleSubQuiz, startingPointOptions, branchTriage } from '../data/onboarding.js'
import {
  buildProfile,
  getVisibleSteps,
  getStepOptions,
  resolveBranch,
  resolvePath,
  resolvePlacement,
  resolveRole,
  isMultiSelectStep,
  MULTI_SELECT_STEPS,
  STEP_ANSWER_KEY,
} from './onboarding.js'

const ids = (answers) => getVisibleSteps(answers).map((step) => step.id)

test('every branch has roles, a sub-quiz, and reachable ladders', () => {
  for (const { value: branch } of BRANCHES) {
    const options = roleOptions[branch]
    assert.ok(options?.length, `${branch} has no roles`)
    assert.equal(options[0].value, 'help_me_choose', `${branch} is missing the help option`)
    assert.ok(roleSubQuiz[branch]?.options?.length, `${branch} has no sub-quiz`)

    for (const option of options.slice(1)) {
      assert.ok(startingPointOptions[option.value]?.length, `${option.value} has no ladder`)
    }
    // Every sub-quiz answer must be a real role in that same branch.
    for (const option of roleSubQuiz[branch].options) {
      assert.ok(options.some((role) => role.value === option.value), `${option.value} is not a ${branch} role`)
    }
  }
})

test('every role resolves to a path', () => {
  assert.equal(ALL_ROLES.length, 25)
  assert.equal(new Set(ALL_ROLES).size, 25, 'role values must be unique across branches')
  for (const role of ALL_ROLES) {
    assert.ok(resolvePath({ role }), `${role} does not resolve to a path`)
  }
})

// Walks the flow the way a user does, asserting every answerable step can
// actually be answered. A missing options case makes the flow unadvanceable.
function walk(pick) {
  const answers = {}
  const visited = []
  for (let guard = 0; guard < 30; guard += 1) {
    const steps = getVisibleSteps(answers)
    const step = steps[visited.length]
    if (!step) break
    visited.push(step.id)
    const key = STEP_ANSWER_KEY[step.id]
    if (!key) continue
    const options = getStepOptions(step.id, answers)
    assert.ok(options.length > 0, `step "${step.id}" offers no options`)
    const picked = pick(step.id, options)
    answers[key] = isMultiSelectStep(step.id) ? [picked] : picked
  }
  return { answers, visited }
}

test('every answerable step in a full walk offers options', () => {
  const { answers, visited } = walk((_, options) => options[0].value)
  assert.equal(visited.at(-1), 'summary')
  assert.ok(visited.includes('branch'))
  assert.ok(buildProfile(answers).pathId)
})

test('the branch step exposes a selectable "not sure"', () => {
  const options = getStepOptions('branch', {})
  assert.equal(options.length, BRANCHES.length + 1)
  assert.ok(options.some((option) => option.value === 'not_sure'))
})

test('a walk that takes both escape hatches still completes', () => {
  const { answers, visited } = walk((stepId, options) => {
    if (stepId === 'branch') return 'not_sure'
    if (stepId === 'role') return 'help_me_choose'
    return options[0].value
  })

  assert.ok(visited.includes('branch_triage'))
  assert.ok(visited.includes('role_sub_quiz'))
  assert.equal(visited.at(-1), 'summary')

  const profile = buildProfile(answers)
  assert.ok(profile.role && profile.role !== 'help_me_choose')
  assert.ok(profile.branch && profile.branch !== 'not_sure')
  assert.ok(profile.pathId)
})

test('the "not sure" branch resolves through triage instead of dead-ending', () => {
  const stuck = { branch: 'not_sure' }
  assert.equal(resolveBranch(stuck), null)
  assert.ok(ids(stuck).includes('branch_triage'))
  assert.ok(getStepOptions('branch_triage', stuck).length > 0)

  const triaged = { branch: 'not_sure', branchFromTriage: 'data' }
  assert.equal(resolveBranch(triaged), 'data')
  assert.deepEqual(getStepOptions('role', triaged), roleOptions.data)
})

test('every triage option maps to a real branch', () => {
  for (const option of branchTriage.options) {
    assert.ok(BRANCHES.some((branch) => branch.value === option.value), `${option.value} is not a branch`)
  }
})

test('help_me_choose writes back and yields a valid ladder key', () => {
  const undecided = { branch: 'web', role: 'help_me_choose' }
  assert.equal(resolveRole(undecided), null)
  assert.ok(ids(undecided).includes('role_sub_quiz'))
  // The bug in v2: this lookup was undefined.
  assert.equal(getStepOptions('starting_point', undecided).length, 0)

  const decided = { ...undecided, roleFromSubQuiz: 'fullstack_developer', experience: 'built_small_projects' }
  assert.equal(resolveRole(decided), 'fullstack_developer')
  assert.ok(getStepOptions('starting_point', decided).length > 0)
  assert.equal(resolvePath(decided), 'backend-developer')
})

test('placement question appears only from rung 2 upward', () => {
  const base = { branch: 'web', role: 'frontend_developer' }
  assert.ok(!ids({ ...base, experience: 'complete_beginner' }).includes('starting_point'))
  assert.ok(!ids({ ...base, experience: 'watched_tutorials' }).includes('starting_point'))
  assert.ok(ids({ ...base, experience: 'tried_small_exercises' }).includes('starting_point'))
  assert.ok(ids({ ...base, experience: 'worked_clients_teams' }).includes('starting_point'))
})

test('low-experience learners are still placed, by rung', () => {
  const beginner = { branch: 'web', role: 'frontend_developer', experience: 'complete_beginner' }
  assert.equal(resolvePlacement(beginner).value, 'html_css_basics')

  const shipped = { branch: 'web', role: 'frontend_developer', experience: 'built_used_by_others' }
  assert.equal(resolvePlacement(shipped).value, 'react_basics')
})

test('an explicit starting point wins over the rung, and "not sure" falls back', () => {
  const base = { branch: 'web', role: 'frontend_developer', experience: 'built_small_projects' }
  assert.equal(resolvePlacement({ ...base, startingPoint: 'react_routing_apis' }).value, 'react_routing_apis')
  assert.equal(resolvePlacement({ ...base, startingPoint: 'not_sure' }).value, 'dom_interactivity')
})

test('visible steps grow and shrink with the answers', () => {
  const empty = ids({})
  assert.equal(empty[0], 'welcome')
  assert.equal(empty.at(-1), 'summary')
  assert.ok(!empty.includes('role'))

  const full = ids({ branch: 'web', role: 'frontend_developer', experience: 'built_small_projects' })
  assert.ok(full.length > empty.length)
  assert.ok(full.includes('role_payoff'))
})

test('multi-select steps store arrays and every other step stays scalar', () => {
  const { answers } = walk((_, options) => options[0].value)

  for (const [stepId, key] of Object.entries(STEP_ANSWER_KEY)) {
    if (answers[key] === undefined) continue
    const stored = answers[key]
    if (isMultiSelectStep(stepId)) assert.ok(Array.isArray(stored), `${stepId} should store an array`)
    else assert.ok(!Array.isArray(stored), `${stepId} should stay scalar`)
  }

  const profile = buildProfile(answers)
  assert.ok(Array.isArray(profile.projectInterest))
  assert.ok(Array.isArray(profile.immediateNeed))
  assert.ok(!Array.isArray(profile.motivation))
})

test('multi-select answers survive into the profile, and absent ones default to empty', () => {
  const many = buildProfile({ projectInterest: ['ai_tools', 'games', 'fintech'], immediateNeed: ['build_projects'] })
  assert.deepEqual(many.projectInterest, ['ai_tools', 'games', 'fintech'])
  assert.deepEqual(many.immediateNeed, ['build_projects'])

  const none = buildProfile({})
  assert.deepEqual(none.projectInterest, [])
  assert.deepEqual(none.immediateNeed, [])

  // A scalar left over from an older stored profile still normalises.
  assert.deepEqual(buildProfile({ projectInterest: 'games' }).projectInterest, ['games'])
})

test('the multi-select set only names steps that exist', () => {
  for (const stepId of MULTI_SELECT_STEPS) {
    assert.ok(STEP_ANSWER_KEY[stepId], `${stepId} is not a real answerable step`)
  }
})

test('the profile records the raw answers alongside the resolved ones', () => {
  const profile = buildProfile({
    branch: 'not_sure',
    branchFromTriage: 'ai',
    role: 'help_me_choose',
    roleFromSubQuiz: 'ml_engineer',
    experience: 'built_used_by_others',
    dailyMinutes: 15,
  })

  assert.equal(profile.branch, 'ai')
  assert.equal(profile.branchAnswer, 'not_sure')
  assert.equal(profile.role, 'ml_engineer')
  assert.equal(profile.roleAnswer, 'help_me_choose')
  assert.equal(profile.pathId, 'machine-learning')
  assert.equal(profile.rung, 4)
  assert.equal(profile.dailyMinutes, 15)
  assert.ok(profile.startingPoint)
})
