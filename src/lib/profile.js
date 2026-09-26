import { roleOptions } from '../data/onboarding.js'

const ROLE_LABELS = Object.fromEntries(Object.values(roleOptions).flat().map((option) => [option.value, option.label]))

export function getRoleLabel(role) {
  return ROLE_LABELS[role] ?? 'Practitioner'
}

export function isProfileUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Social handles are stored as whatever the learner typed — a bare username,
// an @handle or a full URL — and only turned into a link when shown, so the
// edit form can hand back exactly what they entered.
export const SOCIAL_FIELDS = [
  { id: 'github', label: 'GitHub', base: 'https://github.com/', placeholder: 'username' },
  { id: 'linkedin', label: 'LinkedIn', base: 'https://www.linkedin.com/in/', placeholder: 'username' },
  { id: 'x', label: 'X', base: 'https://x.com/', placeholder: '@handle' },
]

export function getSocialUrl(kind, value) {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return null
  if (kind === 'website') {
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    return isProfileUrl(url) && url.includes('.') ? url : null
  }
  const field = SOCIAL_FIELDS.find((entry) => entry.id === kind)
  if (!field) return null
  if (/^https?:\/\//i.test(raw)) return isProfileUrl(raw) ? raw : null
  const handle = raw.replace(/^@/, '').replace(/^(www\.)?[a-z]+\.com\/(in\/)?/i, '').replace(/\/+$/, '')
  return /^[\w.-]+$/.test(handle) ? `${field.base}${handle}` : null
}

// A website shown as text drops the scheme and trailing slash.
export function getDisplayUrl(url) {
  return url ? url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '') : ''
}

export const AVAILABILITY_OPTIONS = [
  { value: 'open_to_work', label: 'Open to work' },
  { value: 'freelance', label: 'Available for freelance' },
  { value: 'collaborate', label: 'Open to collaborate' },
  { value: 'learning', label: 'Heads-down learning' },
]

const SOURCES = ['devspace', 'custom']

const text = (value) => (typeof value === 'string' ? value : '')

function normalizeContact(contact) {
  const source = contact && typeof contact === 'object' ? contact : {}
  return {
    email: text(source.email),
    phone: text(source.phone),
    location: text(source.location),
    website: text(source.website),
    github: text(source.github),
    linkedin: text(source.linkedin),
    x: text(source.x),
    // Phone and email are private by default — the owner sees them, a
    // visitor to the public profile only does once they're switched on.
    showEmail: source.showEmail === true,
    showPhone: source.showPhone === true,
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
    // A chosen DiceBear look (see lib/avatarStyles.js) — only meaningful
    // once `photo` is absent, since a real uploaded photo always wins.
    avatarStyle: typeof profile.avatarStyle === 'string' && profile.avatarStyle ? profile.avatarStyle : null,
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
    pronouns: text(profile.pronouns),
    // Bio and headline can each be written by DevSpace from real progress or
    // by the learner. Older profiles never chose, so a bio they'd already
    // written counts as their own.
    bioSource: SOURCES.includes(profile.bioSource) ? profile.bioSource : (text(profile.bio).trim() ? 'custom' : 'devspace'),
    headlineSource: SOURCES.includes(profile.headlineSource) ? profile.headlineSource : (text(profile.headline).trim() ? 'custom' : 'devspace'),
    availability: AVAILABILITY_OPTIONS.some((option) => option.value === profile.availability) ? profile.availability : null,
    contact: normalizeContact(profile.contact),
    bannerTheme: typeof profile.bannerTheme === 'string' && profile.bannerTheme ? profile.bannerTheme : null,
    bannerImage: typeof profile.bannerImage === 'string' && profile.bannerImage ? profile.bannerImage : null,
    featuredBadges: Array.isArray(profile.featuredBadges) ? profile.featuredBadges.filter((id) => typeof id === 'string') : [],
  }
}

// Every link on the profile that resolves to a real URL — the website and
// social handles first, then any custom links, in that order.
export function getProfileLinks(profile) {
  const normalized = normalizeProfile(profile)
  if (!normalized) return []
  const { contact } = normalized
  const socials = [
    { id: 'website', label: 'Website', url: getSocialUrl('website', contact.website) },
    ...SOCIAL_FIELDS.map((field) => ({ id: field.id, label: field.label, url: getSocialUrl(field.id, contact[field.id]) })),
  ]
  const custom = normalized.links
    .filter((link) => isProfileUrl(link?.url))
    .map((link, index) => ({ id: link.id ?? `link-${index}`, label: link.label?.trim() || getDisplayUrl(link.url), url: link.url, custom: true }))
  return [...socials.filter((link) => link.url), ...custom]
}

export function getProfileProgress(profile, pathProgress) {
  const normalized = normalizeProfile(profile) ?? { name: '', headline: '', projects: [], links: [] }
  const items = [
    { label: 'Add your name and headline', complete: Boolean(normalized.name.trim() && (normalized.headlineSource === 'devspace' || normalized.headline.trim())) },
    { label: 'Add a work sample with proof', complete: normalized.projects.some((project) => project?.title?.trim() && isProfileUrl(project.url)) },
    { label: 'Add a relevant link', complete: getProfileLinks(normalized).length > 0 },
    { label: 'Complete verified learning', complete: Boolean(pathProgress?.lessonsCompleted) },
  ]
  const complete = items.filter((item) => item.complete).length

  return {
    items,
    percent: Math.round((complete / items.length) * 100),
    next: items.find((item) => !item.complete)?.label ?? 'Your profile is ready to share',
  }
}
