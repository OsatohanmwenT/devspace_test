import { useState } from 'react'
import { Drawer } from '../ui/Drawer'
import { ActionButton } from '../ui/ActionButton'
import { BIO_LIMIT, cleanProfileDraft, HEADLINE_LIMIT, validateProfileDraft, WORK_TYPES } from '../../lib/profile'

const LABEL = 'text-[12px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
const FIELD = 'w-full rounded-md border border-[#4a4a4a] bg-[#252525] px-3 py-2 text-[14px] text-[#f4f4f2] placeholder:text-[#89898e] outline-none focus:border-[#4169e1] focus:ring-2 focus:ring-[#4169e1]/30 [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:placeholder:text-[#737371]'
const ERROR = 'text-[12px] text-[#f08c8c] [[data-theme=light]_&]:text-[#b42318]'
const GROUP = 'grid gap-3 rounded-xl border border-[#333336] p-4 [[data-theme=light]_&]:border-[#e6e6e2]'
const TEXT_BUTTON = 'justify-self-start border-0 bg-transparent p-0 text-[13px] font-semibold text-[#88bdf2] hover:underline focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-2 [[data-theme=light]_&]:text-[#2563eb]'
const REMOVE_BUTTON = 'justify-self-end border-0 bg-transparent p-0 text-[12px] text-[#9a9a9d] hover:text-[#f08c8c] focus-visible:outline-3 focus-visible:outline-[#93c5fd] [[data-theme=light]_&]:text-[#686968]'

const WORK_TYPE_LABELS = {
  campaign: 'Campaign',
  video: 'Video',
  design: 'Design',
  content: 'Writing',
  data: 'Data analysis',
  product: 'Product',
  software: 'Software',
  other: 'Other',
}

export function workTypeLabel(type) {
  return WORK_TYPE_LABELS[type] ?? null
}

let idCounter = 0
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${(idCounter += 1)}`

function Field({ id, label, hint, error, children }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={LABEL}>{label}</label>
        {hint && <span className="text-[11px] tabular-nums text-[#86868a] [[data-theme=light]_&]:text-[#767674]">{hint}</span>}
      </div>
      {children}
      {error && <span id={`${id}-error`} className={ERROR}>{error}</span>}
    </div>
  )
}

function toDraft(identity) {
  return {
    name: identity?.name ?? '',
    headline: identity?.headline ?? '',
    bio: identity?.bio ?? '',
    links: (identity?.links ?? []).map((link) => ({ id: link.id ?? newId('link'), label: link.label ?? '', url: link.url ?? '' })),
    projects: (identity?.projects ?? []).map((work) => ({
      id: work.id ?? newId('work'),
      title: work.title ?? '',
      url: work.url ?? '',
      description: work.description ?? '',
      type: work.type ?? '',
    })),
  }
}

export function ProfileEditor({ identity, onSave, onClose }) {
  const [draft, setDraft] = useState(() => toDraft(identity))
  const [errors, setErrors] = useState({})

  const setField = (key, value) => setDraft((current) => ({ ...current, [key]: value }))
  const updateItem = (key, id, patch) =>
    setDraft((current) => ({ ...current, [key]: current[key].map((item) => (item.id === id ? { ...item, ...patch } : item)) }))
  const removeItem = (key, id) => setDraft((current) => ({ ...current, [key]: current[key].filter((item) => item.id !== id) }))

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = validateProfileDraft(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSave(cleanProfileDraft(draft))
    onClose()
  }

  return (
    <Drawer id="profile-editor" title="Edit profile" subtitle="Your record is built from lessons you complete. This part is yours to say." onClose={onClose} labelledBy="profile-editor-title">
      <form className="grid gap-7" onSubmit={submit} noValidate>
        <fieldset className="m-0 grid gap-4 border-0 p-0">
          <legend className="mb-3 p-0 text-[11px] font-bold uppercase tracking-[.09em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Identity</legend>
          <Field id="profile-name" label="Name">
            <input id="profile-name" className={FIELD} value={draft.name} onChange={(event) => setField('name', event.target.value)} autoComplete="name" placeholder="How you want to be credited" />
          </Field>
          <Field id="profile-headline" label="Headline" hint={`${draft.headline.length}/${HEADLINE_LIMIT}`} error={errors.headline}>
            <input
              id="profile-headline"
              className={FIELD}
              value={draft.headline}
              onChange={(event) => setField('headline', event.target.value)}
              placeholder="e.g. Aspiring data analyst learning Python"
              aria-invalid={Boolean(errors.headline)}
              aria-describedby={errors.headline ? 'profile-headline-error' : undefined}
            />
          </Field>
          <Field id="profile-bio" label="About" hint={`${draft.bio.length}/${BIO_LIMIT}`} error={errors.bio}>
            <textarea
              id="profile-bio"
              rows={4}
              className={`${FIELD} resize-y leading-[1.6]`}
              value={draft.bio}
              onChange={(event) => setField('bio', event.target.value)}
              placeholder="What you're working toward and why. Leave blank to use your onboarding answers."
              aria-invalid={Boolean(errors.bio)}
              aria-describedby={errors.bio ? 'profile-bio-error' : undefined}
            />
          </Field>
        </fieldset>

        <fieldset className="m-0 grid gap-3 border-0 p-0">
          <legend className="mb-3 p-0 text-[11px] font-bold uppercase tracking-[.09em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Work samples</legend>
          {draft.projects.map((work, index) => (
            <div key={work.id} className={GROUP}>
              <Field id={`work-title-${work.id}`} label={`Title`} error={errors[`work-title-${work.id}`]}>
                <input id={`work-title-${work.id}`} className={FIELD} value={work.title} onChange={(event) => updateItem('projects', work.id, { title: event.target.value })} aria-invalid={Boolean(errors[`work-title-${work.id}`])} aria-describedby={errors[`work-title-${work.id}`] ? `work-title-${work.id}-error` : undefined} />
              </Field>
              <Field id={`work-type-${work.id}`} label="Type">
                <select id={`work-type-${work.id}`} className={FIELD} value={work.type} onChange={(event) => updateItem('projects', work.id, { type: event.target.value })}>
                  <option value="">Choose a type</option>
                  {WORK_TYPES.map((type) => <option key={type} value={type}>{WORK_TYPE_LABELS[type]}</option>)}
                </select>
              </Field>
              <Field id={`work-url-${work.id}`} label="Link to proof" error={errors[`work-url-${work.id}`]}>
                <input id={`work-url-${work.id}`} type="url" inputMode="url" className={FIELD} value={work.url} onChange={(event) => updateItem('projects', work.id, { url: event.target.value })} placeholder="https://" aria-invalid={Boolean(errors[`work-url-${work.id}`])} aria-describedby={errors[`work-url-${work.id}`] ? `work-url-${work.id}-error` : undefined} />
              </Field>
              <Field id={`work-description-${work.id}`} label="What it shows">
                <textarea id={`work-description-${work.id}`} rows={2} className={`${FIELD} resize-y leading-[1.6]`} value={work.description} onChange={(event) => updateItem('projects', work.id, { description: event.target.value })} />
              </Field>
              <button type="button" className={REMOVE_BUTTON} onClick={() => removeItem('projects', work.id)} aria-label={`Remove work sample ${index + 1}`}>Remove</button>
            </div>
          ))}
          <button type="button" className={TEXT_BUTTON} onClick={() => setField('projects', [...draft.projects, { id: newId('work'), title: '', url: '', description: '', type: '' }])}>
            + Add work sample
          </button>
        </fieldset>

        <fieldset className="m-0 grid gap-3 border-0 p-0">
          <legend className="mb-3 p-0 text-[11px] font-bold uppercase tracking-[.09em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Links</legend>
          {draft.links.map((link, index) => (
            <div key={link.id} className={GROUP}>
              <Field id={`link-label-${link.id}`} label="Label">
                <input id={`link-label-${link.id}`} className={FIELD} value={link.label} onChange={(event) => updateItem('links', link.id, { label: event.target.value })} placeholder="GitHub, portfolio, LinkedIn…" />
              </Field>
              <Field id={`link-${link.id}`} label="Address" error={errors[`link-${link.id}`]}>
                <input id={`link-${link.id}`} type="url" inputMode="url" className={FIELD} value={link.url} onChange={(event) => updateItem('links', link.id, { url: event.target.value })} placeholder="https://" aria-invalid={Boolean(errors[`link-${link.id}`])} aria-describedby={errors[`link-${link.id}`] ? `link-${link.id}-error` : undefined} />
              </Field>
              <button type="button" className={REMOVE_BUTTON} onClick={() => removeItem('links', link.id)} aria-label={`Remove link ${index + 1}`}>Remove</button>
            </div>
          ))}
          <button type="button" className={TEXT_BUTTON} onClick={() => setField('links', [...draft.links, { id: newId('link'), label: '', url: '' }])}>
            + Add link
          </button>
        </fieldset>

        {Object.keys(errors).length > 0 && (
          <p className={`m-0 ${ERROR}`} role="alert">Some fields need attention before saving.</p>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[#333336] pt-5 [[data-theme=light]_&]:border-[#e6e6e2]">
          <ActionButton variant="neutral" className="min-h-10 text-[14px]" onClick={onClose}>Cancel</ActionButton>
          <ActionButton type="submit" className="min-h-10 text-[14px]">Save profile</ActionButton>
        </div>
      </form>
    </Drawer>
  )
}
