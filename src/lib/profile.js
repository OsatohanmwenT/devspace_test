export function isProfileUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function normalizeProfile(profile = null) {
  if (!profile) return null

  return {
    ...profile,
    name: typeof profile.name === 'string' ? profile.name : '',
    headline: typeof profile.headline === 'string' ? profile.headline : '',
    projects: Array.isArray(profile.projects) ? profile.projects : [],
    links: Array.isArray(profile.links) ? profile.links : [],
  }
}

export function getProfileProgress(profile, pathProgress) {
  const normalized = normalizeProfile(profile) ?? { name: '', headline: '', projects: [], links: [] }
  const items = [
    { label: 'Add your name and headline', complete: Boolean(normalized.name.trim() && normalized.headline.trim()) },
    { label: 'Add a project with proof', complete: normalized.projects.length > 0 },
    { label: 'Add a professional link', complete: normalized.links.length > 0 },
    { label: 'Complete verified learning', complete: Boolean(pathProgress?.lessonsCompleted) },
  ]
  const complete = items.filter((item) => item.complete).length

  return {
    items,
    percent: Math.round((complete / items.length) * 100),
    next: items.find((item) => !item.complete)?.label ?? 'Your profile is ready to share',
  }
}
