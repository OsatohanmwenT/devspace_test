import { useRef, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { Avatar } from '../ui/Avatar'
import { Drawer } from '../ui/Drawer'
import { CheckIcon, LockIcon } from '../ui/icons'
import { getLeague } from '../../data/leagues'
import { ImageUploadError, readImageAsBannerDataUrl, readImageAsSquareDataUrl } from '../../lib/imageUpload'
import { AVATAR_STYLES, getAvatarDataUri, isStyleUnlocked, LOCKED_PREVIEW_SEED } from '../../lib/avatarStyles'
import { AVAILABILITY_OPTIONS, getSocialUrl, isProfileUrl, SOCIAL_FIELDS } from '../../lib/profile'
import { BANNER_THEMES, getBannerTheme, LinkIcon, ProfileBanner } from './profileTheme'

const FIELD_LABEL = 'text-[13px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
const FIELD_INPUT = 'w-full min-w-0 rounded-xl border border-[#404040] bg-[#1f1f1f] px-3.5 py-3 text-[15px] text-[#f4f4f2] outline-none placeholder:text-[#6b6b70] focus-visible:border-[#88bdf2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:placeholder:text-[#a3a3a0]'
const HINT = 'm-0 text-[12px] leading-[1.5] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'
const ERROR = 'text-[12px] text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]'
const MAX_CUSTOM_LINKS = 4

// Who fills each part in. DevSpace-owned parts are verified from real
// progress, so they're shown rather than edited; "shared" parts let the
// learner choose between DevSpace's version and their own.
const SECTIONS = [
  { id: 'look', label: 'Look', owner: 'you', hint: 'Banner, theme colour and photo — the first thing anyone sees.' },
  { id: 'about', label: 'About', owner: 'shared', hint: 'DevSpace can write your headline and bio from your progress, or you can write your own.' },
  { id: 'contact', label: 'Contact', owner: 'you', hint: 'Private unless you switch it on — you always see it, visitors only see what you choose.' },
  { id: 'links', label: 'Links', owner: 'you', hint: "Where people can see your work. Usernames are fine — we'll build the link." },
  { id: 'devspace', label: 'From DevSpace', owner: 'devspace', hint: 'Verified from what you actually complete. It updates on its own as you learn.' },
]

const OWNER_TAGS = {
  you: { label: 'You fill this in', className: 'bg-[#262629] text-[#c4c4c7] [[data-theme=light]_&]:bg-[#f0f0ed] [[data-theme=light]_&]:text-[#525252]' },
  shared: { label: 'DevSpace or you', className: 'bg-[#6699ec]/15 text-[#89baff] [[data-theme=light]_&]:text-[#2563eb]' },
  devspace: { label: 'Written by DevSpace', className: 'bg-[#168a46]/15 text-[#6ee7a8] [[data-theme=light]_&]:text-[#168a46]' },
}

function SparkIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8Z" fill="currentColor" />
    </svg>
  )
}

function FormSection({ section, children }) {
  const tag = OWNER_TAGS[section.owner]
  return (
    <fieldset className="m-0 grid gap-4 border-0 p-0">
      <div className="grid gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <legend className="float-left p-0 font-rethink-sans text-[16px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{section.label}</legend>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tag.className}`}>
            {section.owner !== 'you' && <SparkIcon className="size-3" />}
            {tag.label}
          </span>
        </div>
        <p className={`clear-left ${HINT}`}>{section.hint}</p>
      </div>
      {children}
    </fieldset>
  )
}

// DevSpace's version or the learner's own, for one field.
function SourceSwitch({ label, value, onChange }) {
  return (
    <div className="inline-grid grid-cols-2 rounded-lg bg-[#262629] p-0.5 [[data-theme=light]_&]:bg-[#f0f0ed]" role="radiogroup" aria-label={label}>
      {[
        { value: 'devspace', text: 'DevSpace' },
        { value: 'custom', text: 'Write my own' },
      ].map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`min-h-8 rounded-md px-3 text-[12.5px] font-semibold transition-colors ${
            value === option.value
              ? 'bg-[#3a3a3e] text-[#f4f4f2] shadow-sm [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800'
              : 'text-[#9a9a9d] hover:text-[#f4f4f2] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:text-neutral-800'
          }`}
        >
          {option.text}
        </button>
      ))}
    </div>
  )
}

function GeneratedPreview({ children }) {
  return (
    <div className="grid gap-2 rounded-xl border border-dashed border-[#404040] bg-[#1a1a1c] px-3.5 py-3 [[data-theme=light]_&]:border-[#dededa] [[data-theme=light]_&]:bg-[#fafaf8]">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[.07em] text-[#6ee7a8] [[data-theme=light]_&]:text-[#168a46]">
        <SparkIcon className="size-3" /> Written by DevSpace
      </span>
      <div className="text-[14px] leading-[1.6] text-[#c4c4c7] [[data-theme=light]_&]:text-[#525252]">{children}</div>
    </div>
  )
}

function PublicToggle({ checked, onChange, disabled }) {
  return (
    <label className={`inline-flex items-center gap-2 text-[12.5px] ${disabled ? 'opacity-50' : 'cursor-pointer'} text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]`}>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span
        className="relative h-5 w-9 flex-none rounded-full bg-[#3a3a3e] transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-[#6699ec] peer-checked:after:translate-x-4 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:bg-[#d8d8d4]"
        aria-hidden="true"
      />
      Show on public profile
    </label>
  )
}

export function EditProfileModal({ profile, generated = {}, initialSection = 'look', highestLeagueIndex = 0, onOpenBadges, onSave, onClose }) {
  const [section, setSection] = useState(SECTIONS.some((entry) => entry.id === initialSection) ? initialSection : 'look')
  const [headlineSource, setHeadlineSource] = useState(profile?.headlineSource ?? 'devspace')
  const [bioSource, setBioSource] = useState(profile?.bioSource ?? 'devspace')
  const contact = profile?.contact ?? {}
  const [name, setName] = useState(profile?.name ?? '')
  const [pronouns, setPronouns] = useState(profile?.pronouns ?? '')
  const [headline, setHeadline] = useState(profile?.headline ?? '')
  const [availability, setAvailability] = useState(profile?.availability ?? null)
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [photo, setPhoto] = useState(profile?.photo ?? null)
  const [avatarStyle, setAvatarStyle] = useState(profile?.avatarStyle ?? null)
  const [bannerTheme, setBannerTheme] = useState(profile?.bannerTheme ?? BANNER_THEMES[0].id)
  const [bannerImage, setBannerImage] = useState(profile?.bannerImage ?? null)
  const [fields, setFields] = useState({
    location: contact.location ?? '',
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    website: contact.website ?? '',
    github: contact.github ?? '',
    linkedin: contact.linkedin ?? '',
    x: contact.x ?? '',
    showEmail: contact.showEmail ?? false,
    showPhone: contact.showPhone ?? false,
  })
  const [links, setLinks] = useState(() => (profile?.links ?? []).map((link, index) => ({ id: link.id ?? `link-${index}`, label: link.label ?? '', url: link.url ?? '' })))
  const [photoError, setPhotoError] = useState('')
  const [bannerError, setBannerError] = useState('')
  const [processing, setProcessing] = useState(null)
  const photoInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  const setField = (key) => (value) => setFields((current) => ({ ...current, [key]: value }))
  const theme = getBannerTheme(bannerTheme)
  const seed = name.trim() || 'you'

  const pickImage = (kind, read, apply, setError) => async (event) => {
    const file = event.target.files?.[0]
    // Cleared immediately so picking the same file again still fires onChange.
    event.target.value = ''
    if (!file) return

    setError('')
    setProcessing(kind)
    try {
      apply(await read(file))
    } catch (error) {
      setError(error instanceof ImageUploadError ? error.message : 'Could not process that image')
    } finally {
      setProcessing(null)
    }
  }

  const updateLink = (id, key, value) => setLinks((current) => current.map((link) => (link.id === id ? { ...link, [key]: value } : link)))

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]))
    onSave({
      name: name.trim(),
      pronouns: pronouns.trim(),
      headline: headline.trim(),
      headlineSource: headlineSource === 'custom' && headline.trim() ? 'custom' : 'devspace',
      bioSource: bioSource === 'custom' && bio.trim() ? 'custom' : 'devspace',
      availability,
      bio: bio.trim(),
      photo,
      avatarStyle,
      bannerTheme,
      bannerImage,
      contact: trimmed,
      links: links
        .map((link) => ({ id: link.id, label: link.label.trim(), url: link.url.trim() }))
        .filter((link) => link.url),
    })
    onClose()
  }

  return (
    <Drawer id="edit-profile" title="Edit profile" subtitle="Make it yours — every detail shows on your shared profile" onClose={onClose} labelledBy="edit-profile-title">
      <form className="grid gap-6" onSubmit={handleSubmit}>
        <div className="sticky -top-6 z-10 -mx-6 -mt-6 border-b border-[#333336] bg-[#151517] px-6 pt-2 max-[680px]:-top-6 max-[680px]:-mx-4 max-[680px]:px-4 [[data-theme=light]_&]:border-[#ececea] [[data-theme=light]_&]:bg-white">
          <div className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Profile sections">
            {SECTIONS.map((entry) => {
              const selected = entry.id === section
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setSection(entry.id)}
                  className={`inline-flex min-h-11 flex-none items-center gap-1.5 border-b-2 px-3 text-[13.5px] font-semibold whitespace-nowrap transition-colors ${
                    selected
                      ? 'border-[#6699ec] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'
                      : 'border-transparent text-[#9a9a9d] hover:text-[#f4f4f2] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:text-neutral-800'
                  }`}
                >
                  {entry.owner === 'devspace' && <SparkIcon className="size-3 text-[#6ee7a8] [[data-theme=light]_&]:text-[#168a46]" />}
                  {entry.label}
                </button>
              )
            })}
          </div>
        </div>

        {section === 'look' && (
        <FormSection section={SECTIONS[0]}>
          {/* A live preview, so the banner, accent and avatar are judged together. */}
          <div className="overflow-hidden rounded-2xl border border-[#333336] [[data-theme=light]_&]:border-[#e6e6e2]">
            <ProfileBanner theme={theme} image={bannerImage} className="h-24" />
            <div className="relative flex min-h-11 items-center bg-[#1b1b1d] px-4 py-3 pl-20 [[data-theme=light]_&]:bg-white">
              <span className="absolute -top-8 left-4 flex rounded-full ring-4 ring-[#1b1b1d] [[data-theme=light]_&]:ring-white">
                {photo || avatarStyle ? (
                  <Avatar name={name || 'Learner'} photo={photo} avatarStyle={avatarStyle} avatarSeed={photo ? undefined : seed} size="lg" />
                ) : (
                  <span className="grid size-14 place-items-center rounded-full font-rethink-sans text-xl font-medium text-white" style={{ backgroundColor: theme.accent }} aria-hidden="true">{(name.trim()[0] ?? 'L').toUpperCase()}</span>
                )}
              </span>
              <div className="grid min-w-0 gap-0.5">
                <span className="truncate text-[14px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{name.trim() || 'Your name'}</span>
                <span className="h-1.5 w-16 rounded-full" style={{ backgroundColor: theme.accent }} aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <span className={FIELD_LABEL}>Theme</span>
            <div className="grid grid-cols-7 gap-2 max-[480px]:grid-cols-4" role="radiogroup" aria-label="Profile theme">
              {BANNER_THEMES.map((option) => {
                const selected = option.id === bannerTheme
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    title={option.label}
                    onClick={() => setBannerTheme(option.id)}
                    className={`relative h-11 overflow-hidden rounded-xl border-2 transition-transform hover:-translate-y-0.5 ${selected ? 'border-[#f4f4f2] [[data-theme=light]_&]:border-neutral-800' : 'border-transparent'}`}
                    style={{ background: option.background }}
                  >
                    {selected && (
                      <span className="absolute inset-0 grid place-items-center bg-black/20 text-white">
                        <CheckIcon className="size-4" />
                      </span>
                    )}
                    <span className="sr-only">{option.label}</span>
                  </button>
                )
              })}
            </div>
            <p className={HINT}>{theme.label} — its accent colour carries through your profile{bannerImage ? ', under your own banner image' : ''}.</p>
          </div>

          <div className="grid grid-cols-2 items-start gap-x-3 gap-y-4 max-[480px]:grid-cols-1">
            <div className="grid content-start gap-1.5">
              <span className={FIELD_LABEL}>Banner image</span>
              <div className="flex flex-wrap gap-2">
                <ActionButton type="button" variant="neutral" className="min-h-9 px-3 text-[13px]" onClick={() => bannerInputRef.current?.click()} disabled={processing === 'banner'}>
                  {processing === 'banner' ? 'Processing…' : bannerImage ? 'Change banner' : 'Upload banner'}
                </ActionButton>
                {bannerImage && (
                  <ActionButton type="button" variant="neutral" className="min-h-9 px-3 text-[13px]" onClick={() => setBannerImage(null)}>
                    Remove
                  </ActionButton>
                )}
              </div>
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={pickImage('banner', readImageAsBannerDataUrl, setBannerImage, setBannerError)} />
              {bannerError ? <span className={ERROR}>{bannerError}</span> : <p className={HINT}>Wide images work best (3:1).</p>}
            </div>

            <div className="grid content-start gap-1.5">
              <span className={FIELD_LABEL}>Photo</span>
              <div className="flex flex-wrap gap-2">
                <ActionButton type="button" variant="neutral" className="min-h-9 px-3 text-[13px]" onClick={() => photoInputRef.current?.click()} disabled={processing === 'photo'}>
                  {processing === 'photo' ? 'Processing…' : photo ? 'Change photo' : 'Add photo'}
                </ActionButton>
                {photo && (
                  <ActionButton type="button" variant="neutral" className="min-h-9 px-3 text-[13px]" onClick={() => setPhoto(null)}>
                    Remove
                  </ActionButton>
                )}
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={pickImage('photo', readImageAsSquareDataUrl, setPhoto, setPhotoError)} />
              {photoError && <span className={ERROR}>{photoError}</span>}
            </div>
          </div>

          <div className="grid gap-2">
            <span className={FIELD_LABEL}>Avatar style</span>
            <p className={HINT}>Unlocked as you climb the leaderboard — a photo, when you have one, is always shown instead.</p>
            <div className="grid grid-cols-5 gap-2 max-[480px]:grid-cols-4">
              {AVATAR_STYLES.map((style) => {
                const unlocked = isStyleUnlocked(style, highestLeagueIndex)
                const uri = getAvatarDataUri(style.id, unlocked ? seed : LOCKED_PREVIEW_SEED)
                const selected = avatarStyle === style.id
                const unlockLabel = `Unlocks at ${getLeague(style.requiresLeagueIndex).name}`

                return (
                  <button
                    key={style.id}
                    type="button"
                    disabled={!unlocked}
                    aria-pressed={selected}
                    onClick={() => setAvatarStyle(style.id)}
                    title={unlocked ? style.label : unlockLabel}
                    className={`relative grid place-items-center rounded-xl border p-1.5 transition-colors ${selected ? 'border-[#6699ec] bg-[#1d2f5d]/40' : 'border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1]'} ${unlocked ? 'cursor-pointer hover:border-[#6699ec]' : 'cursor-default'}`}
                  >
                    <img src={uri} alt="" aria-hidden="true" className={`size-11 rounded-full ${unlocked ? '' : 'opacity-40 blur-[2px]'}`} />
                    {!unlocked && (
                      <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/25" aria-hidden="true">
                        <LockIcon className="size-4 text-white" />
                      </span>
                    )}
                    <span className="sr-only">{unlocked ? style.label : `${style.label} — ${unlockLabel}`}</span>
                  </button>
                )
              })}
            </div>
            {avatarStyle && (
              <button
                type="button"
                className="justify-self-start text-[12px] font-medium text-[#89baff] hover:underline [[data-theme=light]_&]:text-[#3d77eb]"
                onClick={() => setAvatarStyle(null)}
              >
                Use auto-assigned look instead
              </button>
            )}
          </div>
        </FormSection>
        )}

        {section === 'about' && (
        <FormSection section={SECTIONS[1]}>
          <div className="grid grid-cols-[minmax(0,1fr)_132px] gap-3 max-[420px]:grid-cols-1">
            <label className="grid gap-1.5">
              <span className={FIELD_LABEL}>Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="Your name" className={FIELD_INPUT} />
            </label>
            <label className="grid gap-1.5">
              <span className={FIELD_LABEL}>Pronouns</span>
              <input value={pronouns} onChange={(event) => setPronouns(event.target.value)} maxLength={20} placeholder="e.g. she/her" className={FIELD_INPUT} />
            </label>
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="profile-headline" className={FIELD_LABEL}>Headline</label>
              <SourceSwitch label="Headline source" value={headlineSource} onChange={setHeadlineSource} />
            </div>
            {headlineSource === 'devspace' ? (
              <GeneratedPreview>{generated.headline || 'Your role, from your learning path'}</GeneratedPreview>
            ) : (
              <input id="profile-headline" value={headline} onChange={(event) => setHeadline(event.target.value)} maxLength={80} placeholder={generated.headline ? `e.g. ${generated.headline} building for fintech` : 'e.g. Aspiring Machine Learning Engineer'} className={FIELD_INPUT} />
            )}
          </div>

          <div className="grid gap-2">
            <span className={FIELD_LABEL}>Status</span>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_OPTIONS.map((option) => {
                const selected = availability === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setAvailability(selected ? null : option.value)}
                    className={`min-h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
                      selected
                        ? 'border-transparent text-white'
                        : 'border-[#404040] text-[#c4c4c7] hover:border-[#6b6b70] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:text-[#525252]'
                    }`}
                    style={selected ? { backgroundColor: theme.accent } : undefined}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <label className="grid gap-1.5">
            <span className={FIELD_LABEL}>Location</span>
            <input value={fields.location} onChange={(event) => setField('location')(event.target.value)} maxLength={60} placeholder="e.g. Lagos, Nigeria" className={FIELD_INPUT} />
          </label>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="profile-bio" className={FIELD_LABEL}>Bio</label>
              <SourceSwitch label="Bio source" value={bioSource} onChange={setBioSource} />
            </div>
            {bioSource === 'devspace' ? (
              <GeneratedPreview>{generated.about || 'DevSpace writes this from your goals, track and daily practice once you start learning.'}</GeneratedPreview>
            ) : (
              <>
                <textarea id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={400} rows={5} placeholder="What you're building, what you're learning, what you're after" className={`resize-none ${FIELD_INPUT}`} />
                <div className="flex items-center justify-between gap-3">
                  {generated.about && !bio.trim() ? (
                    <button type="button" className="text-[12px] font-semibold text-[#89baff] hover:underline [[data-theme=light]_&]:text-[#3d77eb]" onClick={() => setBio(generated.about.slice(0, 400))}>
                      Start from DevSpace's version
                    </button>
                  ) : <span />}
                  <span className="text-[11px] tabular-nums text-[#6b6b70]">{bio.length} / 400</span>
                </div>
              </>
            )}
          </div>
        </FormSection>
        )}

        {section === 'contact' && (
        <FormSection section={SECTIONS[2]}>
          <div className="grid gap-1.5">
            <label htmlFor="profile-email" className={FIELD_LABEL}>Email</label>
            <input id="profile-email" type="email" value={fields.email} onChange={(event) => setField('email')(event.target.value)} maxLength={120} placeholder="you@example.com" autoComplete="email" className={FIELD_INPUT} />
            <PublicToggle checked={fields.showEmail} disabled={!fields.email.trim()} onChange={setField('showEmail')} />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="profile-phone" className={FIELD_LABEL}>Phone</label>
            <input id="profile-phone" type="tel" value={fields.phone} onChange={(event) => setField('phone')(event.target.value)} maxLength={30} placeholder="+234 800 000 0000" autoComplete="tel" className={FIELD_INPUT} />
            <PublicToggle checked={fields.showPhone} disabled={!fields.phone.trim()} onChange={setField('showPhone')} />
          </div>
        </FormSection>
        )}

        {section === 'links' && (
        <FormSection section={SECTIONS[3]}>
          <label className="grid gap-1.5">
            <span className={FIELD_LABEL}>Portfolio or website</span>
            <span className="relative">
              <LinkIcon kind="website" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#86868a]" />
              <input value={fields.website} onChange={(event) => setField('website')(event.target.value)} maxLength={200} placeholder="yourname.dev" className={`pl-10 ${FIELD_INPUT}`} />
            </span>
            {fields.website.trim() && !getSocialUrl('website', fields.website) && <span className={ERROR}>That doesn't look like a web address</span>}
          </label>

          {SOCIAL_FIELDS.map((field) => (
            <label key={field.id} className="grid gap-1.5">
              <span className={FIELD_LABEL}>{field.label}</span>
              <span className="relative">
                <LinkIcon kind={field.id} className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#86868a]" />
                <input value={fields[field.id]} onChange={(event) => setField(field.id)(event.target.value)} maxLength={200} placeholder={field.placeholder} className={`pl-10 ${FIELD_INPUT}`} />
              </span>
              {fields[field.id].trim() && !getSocialUrl(field.id, fields[field.id]) && <span className={ERROR}>Use a username or a full link</span>}
            </label>
          ))}

          <div className="grid gap-2.5">
            <span className={FIELD_LABEL}>More links</span>
            {links.map((link) => (
              <div key={link.id} className="grid gap-1.5">
                <div className="grid grid-cols-[120px_minmax(0,1fr)_auto] gap-2 max-[420px]:grid-cols-[minmax(0,1fr)_auto]">
                  <input value={link.label} onChange={(event) => updateLink(link.id, 'label', event.target.value)} maxLength={30} placeholder="Label" aria-label="Link label" className={`${FIELD_INPUT} max-[420px]:col-span-2`} />
                  <input value={link.url} onChange={(event) => updateLink(link.id, 'url', event.target.value)} maxLength={300} placeholder="https://" aria-label="Link address" className={FIELD_INPUT} />
                  <button
                    type="button"
                    onClick={() => setLinks((current) => current.filter((entry) => entry.id !== link.id))}
                    className="grid size-12 place-items-center rounded-xl text-[#9a9a9d] hover:bg-[#262629] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:bg-[#f0f0ed] [[data-theme=light]_&]:hover:text-neutral-800"
                    aria-label={`Remove ${link.label || 'link'}`}
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  </button>
                </div>
                {link.url.trim() && !isProfileUrl(link.url.trim()) && <span className={ERROR}>Start the address with https://</span>}
              </div>
            ))}
            {links.length < MAX_CUSTOM_LINKS && (
              <button
                type="button"
                onClick={() => setLinks((current) => [...current, { id: `link-${Date.now()}`, label: '', url: '' }])}
                className="justify-self-start rounded-lg px-1 text-[13px] font-semibold text-[#89baff] hover:underline [[data-theme=light]_&]:text-[#3d77eb]"
              >
                + Add a link
              </button>
            )}
          </div>
        </FormSection>
        )}

        {section === 'devspace' && (
          <FormSection section={SECTIONS[4]}>
            <dl className="m-0 grid gap-4">
              {[
                { label: 'Experience', value: generated.experience?.length ? generated.experience.join(' · ') : 'Appears when you complete your first module' },
                { label: 'Milestones & credentials', value: `${generated.milestones ?? 0} passed` },
                { label: 'Learning path', value: generated.pathTitle ?? 'None chosen yet' },
              ].map((row) => (
                <div key={row.label} className="grid gap-1 border-b border-[#333336] pb-4 [[data-theme=light]_&]:border-[#ececea]">
                  <dt className={FIELD_LABEL}>{row.label}</dt>
                  <dd className="m-0 text-[14px] leading-[1.55] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{row.value}</dd>
                </div>
              ))}
              <div className="grid gap-2 border-b border-[#333336] pb-4 [[data-theme=light]_&]:border-[#ececea]">
                <dt className={FIELD_LABEL}>Skills</dt>
                <dd className="m-0 flex flex-wrap gap-1.5">
                  {generated.skills?.length
                    ? generated.skills.map((skill) => (
                      <span key={skill} className="rounded-md bg-[#262629] px-2.5 py-1 text-[12.5px] font-medium text-[#d4d4d4] [[data-theme=light]_&]:bg-[#f0f0ed] [[data-theme=light]_&]:text-[#404040]">{skill}</span>
                    ))
                    : <span className="text-[14px] text-[#9a9a9d]">Grow as you complete modules</span>}
                </dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="grid gap-1">
                  <dt className={FIELD_LABEL}>Badges</dt>
                  <dd className="m-0 text-[14px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{generated.badges ?? 0} of {generated.badgesTotal ?? 0} collected</dd>
                </div>
                <ActionButton type="button" variant="neutral" className="min-h-9 px-3 text-[13px]" onClick={onOpenBadges}>Choose pinned badges</ActionButton>
              </div>
            </dl>
          </FormSection>
        )}

        <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-[#333336] bg-[#151517] px-6 py-4 max-[680px]:-mx-4 max-[680px]:px-4 [[data-theme=light]_&]:border-[#ececea] [[data-theme=light]_&]:bg-white">
          <ActionButton type="submit" className="min-h-12 w-full" disabled={Boolean(processing)}>Save profile</ActionButton>
        </div>
      </form>
    </Drawer>
  )
}
