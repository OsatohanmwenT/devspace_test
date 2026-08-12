export function isProfileUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const WORK_TYPES = ['campaign', 'video', 'design', 'content', 'data', 'product', 'software', 'other']

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
