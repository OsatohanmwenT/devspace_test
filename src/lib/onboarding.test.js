import test from 'node:test'
import assert from 'node:assert/strict'
import { ALL_ROLES, BRANCHES, roleOptions, roleSubQuiz, stackOptions, STACK_ROLES, startingPointOptions, branchTriage } from '../data/onboarding.js'
import {
  buildProfile,
  getBreakContent,
  getVisibleSteps,
  getStepOptions,
  isFrameworkCheckpointReady,
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
      // STACK_ROLES roles (frontend_developer, backend_developer) have no bare
      // ladder — their ladder always lives under `${role}_${stack}` instead,
      // one per stackOptions entry.
      if (STACK_ROLES.has(option.value)) {
        assert.ok(stackOptions[option.value]?.length, `${option.value} has no stack options`)
        for (const stack of stackOptions[option.value].slice(1)) {
          assert.ok(startingPointOptions[`${option.value}_${stack.value}`]?.length, `${option.value}_${stack.value} has no ladder`)
        }
        continue
      }
      assert.ok(startingPointOptions[option.value]?.length, `${option.value} has no ladder`)
    }
    // Every sub-quiz answer must be a real role in that same branch.
    for (const option of roleSubQuiz[branch].options) {
      assert.ok(options.some((role) => role.value === option.value), `${option.value} is not a ${branch} role`)
    }
  }
})

test('every role resolves to a path', () => {
  assert.equal(ALL_ROLES.length, 30)
  assert.equal(new Set(ALL_ROLES).size, 30, 'role values must be unique across branches')
  for (const role of ALL_ROLES) {
    assert.ok(resolvePath({ role }), `${role} does not resolve to a path`)
  }
})

test('non coding roles resolve to their authored career paths', () => {
  assert.equal(resolvePath({ role: 'technical_project_coordinator' }), 'technical-project-coordinator')
  assert.equal(resolvePath({ role: 'digital_marketer' }), 'digital-marketing')
  assert.equal(resolvePath({ role: 'data_analyst' }), 'data-analyst')
  assert.equal(resolvePath({ role: 'video_editor' }), 'video-editor')
  assert.equal(resolvePath({ role: 'content_creator' }), 'content-creator')
  assert.equal(resolvePath({ role: 'social_media_manager' }), 'social-media-manager')
  assert.equal(resolvePath({ role: 'graphic_designer' }), 'graphic-designer')
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
  assert.equal(visited.at(-1), 'daily_time_break')
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
  assert.equal(visited.at(-1), 'daily_time_break')

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
  assert.equal(resolvePath(decided), 'fullstack-developer')
})

test('frontend placement follows JavaScript readiness, not general experience', () => {
  const base = { branch: 'web', role: 'frontend_developer' }
  assert.ok(!ids({ ...base, experience: 'worked_clients_teams', javascriptExperience: 'new_to_javascript' }).includes('starting_point'))
  assert.ok(ids({ ...base, experience: 'complete_beginner', javascriptExperience: 'javascript_basics', stack: 'react' }).includes('starting_point'))
  assert.ok(ids({ ...base, experience: 'complete_beginner', javascriptExperience: 'interactive_pages', stack: 'react' }).includes('starting_point'))
})

test('every direct and guided role route has answerable steps', () => {
  for (const { value: branch } of BRANCHES) {
    for (const [routeType, roles] of [['direct', roleOptions[branch].slice(1).map((option) => option.value)], ['guided', roleSubQuiz[branch].options.map((option) => option.value)]]) {
      for (const role of roles) {
        const answers = {
          branch,
          role: routeType === 'direct' ? role : 'help_me_choose',
          ...(routeType === 'guided' ? { roleFromSubQuiz: role } : {}),
          experience: 'tried_small_exercises',
          projectInterest: ['games'],
          immediateNeed: ['build_projects'],
          dailyMinutes: 10,
        }
        if (role === 'frontend_developer') Object.assign(answers, { javascriptExperience: 'interactive_pages', stack: 'react' })
        if (role === 'backend_developer') Object.assign(answers, { stack: 'node' })

        for (const step of getVisibleSteps(answers)) {
          if (!STEP_ANSWER_KEY[step.id]) continue
          assert.ok(getStepOptions(step.id, answers).length > 0, `${branch}/${routeType}/${role}/${step.id} has no options`)
        }
      }
    }
  }
})

test('frontend placement follows JavaScript readiness', () => {
  const beginner = { branch: 'web', role: 'frontend_developer', experience: 'worked_clients_teams', javascriptExperience: 'new_to_javascript' }
  assert.equal(resolvePlacement(beginner).value, 'html_css_basics')

  const shipped = { branch: 'web', role: 'frontend_developer', experience: 'complete_beginner', javascriptExperience: 'interactive_pages', stack: 'react' }
  assert.equal(resolvePlacement(shipped).value, 'dom_interactivity')
})

test('new JavaScript learners defer framework choice', () => {
  const answers = { branch: 'web', role: 'frontend_developer', experience: 'complete_beginner', javascriptExperience: 'new_to_javascript' }
  const steps = ids(answers)
  assert.ok(!steps.includes('stack'))
  assert.equal(buildProfile(answers).stack, null)
  assert.equal(buildProfile(answers).frameworkDecision, 'pending')
})

test('JavaScript-ready frontend learners choose a framework before placement', () => {
  const answers = { branch: 'web', role: 'frontend_developer', experience: 'complete_beginner', javascriptExperience: 'interactive_pages', stack: 'react' }
  const steps = ids(answers)
  assert.ok(steps.indexOf('javascript_experience') < steps.indexOf('stack'))
  assert.ok(steps.indexOf('stack') < steps.indexOf('starting_point'))
  assert.equal(buildProfile(answers).frameworkDecision, 'complete')
})

test('backend language selection remains independent of experience', () => {
  const base = { branch: 'backend', role: 'backend_developer' }
  assert.ok(ids({ ...base, experience: 'complete_beginner' }).includes('stack'))
  assert.ok(ids({ ...base, experience: 'worked_clients_teams' }).includes('stack'))
})

test('legacy frontend profiles do not gain a deferred framework decision', () => {
  const legacy = buildProfile({ branch: 'web', role: 'frontend_developer', experience: 'complete_beginner' })
  assert.equal(legacy.frameworkDecision, null)
})

test('the framework checkpoint opens only after pending learners finish foundations', () => {
  const profile = { role: 'frontend_developer', frameworkDecision: 'pending' }
  assert.equal(isFrameworkCheckpointReady(profile, {}), false)
  assert.equal(isFrameworkCheckpointReady(profile, { 'program-flow': { completedAt: 'today' } }), true)
  assert.equal(isFrameworkCheckpointReady({ ...profile, frameworkDecision: 'complete' }, { 'program-flow': { completedAt: 'today' } }), false)
})

test('an explicit starting point wins over JavaScript placement', () => {
  const base = { branch: 'web', role: 'frontend_developer', experience: 'built_small_projects', javascriptExperience: 'interactive_pages', stack: 'react' }
  assert.equal(resolvePlacement({ ...base, startingPoint: 'react_routing_apis' }).value, 'react_routing_apis')
  assert.equal(resolvePlacement({ ...base, startingPoint: 'not_sure' }).value, 'dom_interactivity')
})

test('low-experience backend learners are still placed by general experience', () => {
  const shipped = { branch: 'backend', role: 'backend_developer', experience: 'built_used_by_others', stack: 'node' }
  assert.equal(resolvePlacement(shipped).value, 'auth_security')
})

test('visible steps grow and shrink with the answers', () => {
  const empty = ids({})
  assert.equal(empty[0], 'welcome')
  assert.equal(empty.at(-1), 'daily_time_break')
  assert.ok(!empty.includes('role'))

  const full = ids({ branch: 'web', role: 'frontend_developer', experience: 'built_small_projects' })
  assert.ok(full.length > empty.length)
  assert.ok(full.includes('role_break'))
})

test('every question is immediately followed by a Devy break', () => {
  const steps = getVisibleSteps({ branch: 'web', role: 'frontend_developer', experience: 'built_small_projects' })
  for (const [index, step] of steps.entries()) {
    if (!STEP_ANSWER_KEY[step.id]) continue
    assert.deepEqual(steps[index + 1], { id: `${step.id}_break`, type: 'break', questionId: step.id })
  }
})

test('break content includes selected labels for single and multi-select answers', () => {
  const single = getBreakContent('branch', { branch: 'web' })
  assert.match(single.message, /Websites & Interfaces/)
  assert.equal(single.insight, 'The web turns ideas into tools anyone can reach.')
  assert.deepEqual(Object.keys(single), ['message', 'insight'])

  const multi = getBreakContent('project_interest', { projectInterest: ['ai_tools', 'games'] })
  assert.equal(multi.message, 'Nice mix. Your projects will feel familiar.')
  assert.equal(multi.insight, 'Relevant projects make new skills stick.')
})

test('triage and role feedback resolve insights from the selected branch', () => {
  const triage = getBreakContent('branch_triage', { branch: 'not_sure', branchFromTriage: 'ai' })
  assert.equal(triage.insight, 'AI is reshaping how every industry works.')

  const role = getBreakContent('role', { branch: 'ai', role: 'ml_engineer' })
  const roleQuiz = getBreakContent('role_sub_quiz', { branch: 'ai', role: 'help_me_choose', roleFromSubQuiz: 'ml_engineer' })
  assert.equal(role.insight, 'AI roles turn data into useful predictions and tools.')
  assert.equal(roleQuiz.insight, role.insight)
})

test('every feedback type returns a concise message and insight', () => {
  const cases = {
    motivation: { motivation: 'professional_developer' },
    branch: { branch: 'ai' },
    branch_triage: { branch: 'not_sure', branchFromTriage: 'ai' },
    role: { branch: 'ai', role: 'ml_engineer' },
    role_sub_quiz: { branch: 'ai', role: 'help_me_choose', roleFromSubQuiz: 'ml_engineer' },
    experience: { experience: 'complete_beginner' },
    starting_point: { branch: 'ai', role: 'ml_engineer', experience: 'built_small_projects', startingPoint: 'core_ml_algorithms' },
    project_interest: { projectInterest: ['ai_tools', 'games'] },
    immediate_need: { immediateNeed: ['learn_basics', 'build_projects'] },
    daily_time: { dailyMinutes: 10 },
  }

  for (const [stepId, answers] of Object.entries(cases)) {
    const content = getBreakContent(stepId, answers)
    assert.ok(content.message.trim(), `${stepId} has no message`)
    assert.ok(content.insight.trim(), `${stepId} has no insight`)
    assert.ok(content.insight.split(/\s+/).length <= 10, `${stepId} insight is too long`)
  }
})

test('duplicate payoff steps are not part of the flow', () => {
  const steps = ids({ branch: 'web', role: 'frontend_developer', experience: 'built_small_projects' })
  assert.ok(!steps.includes('role_payoff'))
  assert.ok(!steps.includes('goals_payoff'))
  assert.ok(!steps.includes('commitment_payoff'))
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
