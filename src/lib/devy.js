import { roleOptions } from '../data/onboarding.js'

// Devy has no model behind it. Every answer is pulled from content that already
// exists on the current step, and nothing that would spoil an unchecked answer.

export const PROMPT_LABELS = {
  summarise: 'Summarise this',
  example: 'Show me the example',
  hint: 'Give me a hint',
  explain: 'Explain the concept',
  why: 'Why is that the answer?',
}

const ROLE_LABELS = Object.fromEntries(
  Object.values(roleOptions).flat().map((option) => [option.value, option.label]),
)

function toSegments(content) {
  if (content === undefined || content === null) return []
  return Array.isArray(content) ? content : [content]
}

export function toPlainText(content) {
  return toSegments(content)
    .map((segment) => (typeof segment === 'string' ? segment : segment.code ?? segment.strong ?? ''))
    .join('')
}

function getArticle(step) {
  return step?.concept?.activities?.find((activity) => activity.type === 'article')?.content ?? null
}

function prompt(id) {
  return { id, label: PROMPT_LABELS[id] }
}

// The one-liner Devy "says" from the footer avatar — an ambient reaction to
// what just happened, not a substitute for the chat panel's real answers.
// Picked at random within the matching pool so the same moment doesn't read
// the same line twice in a row.
const LINES = {
  correct: ['Nice — that’s it.', 'Exactly right.', 'Yep, that’s the one.', 'Clean answer.'],
  // Fires on a wrong answer that still has attempts left — deliberately
  // distinct from `incorrect`, which is reserved for the final, resolved miss.
  retry: ['Not quite — give it another shot.', 'Close. Try again.', 'Not this one — have another go.'],
  incorrect: ['Not quite — check the hint if you want.', 'Close, but not that one.', 'Not this time. I’m right here if you need me.'],
}

export function getDevyLine({ event, streak }) {
  if (event === 'streak') return `${streak} correct in a row — you’re finding a rhythm.`
  const pool = LINES[event]
  if (!pool) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getGreeting(profile) {
  const roleLabel = profile?.role ? ROLE_LABELS[profile.role] : null
  if (roleLabel) {
    return `Hi, I’m Devy. I’ll keep things close to ${roleLabel} work where it helps — ask me any time.`
  }
  return 'Hi, I’m Devy. Ask me for a hint or a recap of the concept behind this step.'
}

export function getPrompts(step, checked = false) {
  if (!step) return []

  if (step.type === 'article') {
    const article = step.content
    return article?.example ? [prompt('summarise'), prompt('example')] : [prompt('summarise')]
  }

  if (step.type === 'question') {
    return checked ? [prompt('why'), prompt('explain')] : [prompt('hint'), prompt('explain')]
  }

  if (step.type === 'practice') {
    if (checked) return []
    const hints = step.content?.hints ?? []
    const labels = ['Give me a hint', 'Another hint', 'One more hint']
    return hints.map((_, index) => ({ id: `practice-hint-${index + 1}`, label: labels[index] ?? `Hint ${index + 1}` }))
  }

  return []
}

// Names an option to rule out rather than the answer — derived from the data,
// so it is always correct and never a spoiler.
function multipleChoiceHint(question) {
  const wrongIndex = question.options.findIndex((_, index) => index !== question.correctIndex)
  if (wrongIndex === -1) return { body: 'Read the options again and pick the one that matches what the lesson showed.' }
  return {
    body: [
      'It isn’t ',
      { strong: toPlainText(question.options[wrongIndex]) },
      '. Rule that one out and compare what’s left.',
    ],
  }
}

function conceptFallback(step, lead) {
  const article = getArticle(step)
  if (article?.example) return { body: lead, code: article.example.code }
  if (article?.sections?.length) return { body: article.sections[0].body }
  return { body: 'Have another look at the step before this one — it introduces everything you need here.' }
}

// Keywords route typed text to the same honest, non-spoiling responses the
// chips use — never to free-form generation, since there's no model behind it.
const KEYWORDS = {
  hint: ['hint', 'stuck', 'help', 'clue'],
  why: ['why', 'correct', 'right answer', 'wrong'],
  explain: ['explain', 'concept', 'confused', "don't understand", 'dont understand', 'what does this'],
  example: ['example', 'show me', 'sample'],
  summarise: ['summar', 'recap', 'tl;dr', 'tldr'],
}

// Matches only against prompts that are actually available right now, so a
// question about "why" before checking falls through to the fallback instead
// of silently answering early.
export function matchPrompt(text, availablePrompts) {
  const normalised = text.trim().toLowerCase()
  if (!normalised) return null

  const availableIds = new Set(availablePrompts.map((item) => item.id))
  for (const [id, keywords] of Object.entries(KEYWORDS)) {
    if (availableIds.has(id) && keywords.some((keyword) => normalised.includes(keyword))) return id
  }
  return null
}

export function getFallbackResponse(availablePrompts) {
  if (availablePrompts.length === 0) {
    return { body: 'There’s nothing more I can help with on this step — try continuing to the next one.' }
  }
  const labels = availablePrompts.map((item) => item.label)
  const list = labels.length === 1
    ? labels[0]
    : `${labels.slice(0, -1).join(', ')} or ${labels.at(-1)}`
  return { body: `I can only help with what’s on this step. Try asking me to ${list.toLowerCase()}.` }
}

export function getResponse(promptId, step, { checked = false } = {}) {
  if (!step) return null

  if (promptId.startsWith('practice-hint-')) {
    const index = Number(promptId.slice('practice-hint-'.length)) - 1
    const hint = step.content?.hints?.[index]
    return hint ? { body: hint } : null
  }

  switch (promptId) {
    case 'summarise': {
      const article = step.content
      const first = article?.sections?.[0]
      if (!article) return null
      return { body: [...toSegments(article.intro), ...(first ? [' ', ...toSegments(first.body)] : [])] }
    }

    case 'example': {
      const example = step.content?.example
      if (!example) return null
      return { body: example.body, code: example.code }
    }

    case 'hint': {
      const { question } = step
      if (!question) return null
      if (question.type === 'multiple-choice') return multipleChoiceHint(question)
      return conceptFallback(step, 'Here’s the same idea from earlier in the lesson:')
    }

    case 'explain': {
      const article = getArticle(step)
      if (!article?.sections?.length) return conceptFallback(step, 'Here’s the worked example again:')
      const body = article.sections.flatMap((section, index) => [
        ...(index > 0 ? [' '] : []),
        { strong: `${section.title}. ` },
        ...toSegments(section.body),
      ])
      return { body }
    }

    case 'why': {
      if (!checked) return null
      const explanation = step.question?.explanation
      return explanation ? { body: explanation } : null
    }

    default:
      return null
  }
}
