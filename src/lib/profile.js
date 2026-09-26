export function isProfileUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const WORK_TYPES = ['campaign', 'video', 'design', 'content', 'data', 'product', 'software', 'other']

export const HEADLINE_LIMIT = 80
export const BIO_LIMIT = 400

export function normalizeProfile(profile = null) {
  if (!profile) return null

  return {
    ...profile,
    name: typeof profile.name === 'string' ? profile.name : '',
    headline: typeof profile.headline === 'string' ? profile.headline : '',
    bio: typeof profile.bio === 'string' ? profile.bio : '',
    photo: typeof profile.photo === 'string' && profile.photo ? profile.photo : null,
    projectInterest: Array.isArray(profile.projectInterest)
      ? profile.projectInterest
      : profile.projectInterest ? [profile.projectInterest] : [],
    immediateNeed: Array.isArray(profile.immediateNeed)
      ? profile.immediateNeed
      : profile.immediateNeed ? [profile.immediateNeed] : [],
    projects: Array.isArray(profile.projects)
      ? profile.projects.map((project) => {
        const { type, ...rest } = project ?? {}
        return { ...rest, ...(WORK_TYPES.includes(type) ? { type } : {}) }
      })
      : [],
    links: Array.isArray(profile.links) ? profile.links : [],
  }
}

export function getProfileProgress(profile, pathProgress) {
  const normalized = normalizeProfile(profile) ?? { name: '', headline: '', projects: [], links: [] }
  const items = [
    { label: 'Add your name and headline', complete: Boolean(normalized.name.trim() && normalized.headline.trim()) },
    { label: 'Add a work sample with proof', complete: normalized.projects.some((project) => project?.title?.trim() && isProfileUrl(project.url)) },
    { label: 'Add a relevant link', complete: normalized.links.some((link) => isProfileUrl(link?.url)) },
    { label: 'Complete verified learning', complete: Boolean(pathProgress?.lessonsCompleted) },
  ]
  const complete = items.filter((item) => item.complete).length

  return {
    items,
    percent: Math.round((complete / items.length) * 100),
    next: items.find((item) => !item.complete)?.label ?? 'Your profile is ready to share',
  }
}

// Rows the learner has left entirely empty are dropped on save rather than
// flagged, so opening "Add link" and changing your mind is never an error.
const isBlankLink = (link) => !link.label.trim() && !link.url.trim()
const isBlankWork = (work) => !work.title.trim() && !work.url.trim() && !work.description.trim()

export function validateProfileDraft(draft) {
  const errors = {}
  if (draft.headline.length > HEADLINE_LIMIT) errors.headline = `Keep it under ${HEADLINE_LIMIT} characters.`
  if (draft.bio.length > BIO_LIMIT) errors.bio = `Keep it under ${BIO_LIMIT} characters.`
  draft.links.forEach((link) => {
    if (isBlankLink(link)) return
    if (!isProfileUrl(link.url.trim())) errors[`link-${link.id}`] = 'Use a full address starting with https://'
  })
  draft.projects.forEach((work) => {
    if (isBlankWork(work)) return
    if (!work.title.trim()) errors[`work-title-${work.id}`] = 'Give this work a title.'
    if (work.url.trim() && !isProfileUrl(work.url.trim())) errors[`work-url-${work.id}`] = 'Use a full address starting with https://'
  })
  return errors
}

export function cleanProfileDraft(draft) {
  return {
    name: draft.name.trim(),
    headline: draft.headline.trim(),
    bio: draft.bio.trim(),
    links: draft.links
      .filter((link) => !isBlankLink(link))
      .map((link) => ({ id: link.id, label: link.label.trim(), url: link.url.trim() })),
    projects: draft.projects
      .filter((work) => !isBlankWork(work))
      .map((work) => ({
        id: work.id,
        title: work.title.trim(),
        url: work.url.trim(),
        description: work.description.trim(),
        ...(WORK_TYPES.includes(work.type) ? { type: work.type } : {}),
      })),
  }
}
