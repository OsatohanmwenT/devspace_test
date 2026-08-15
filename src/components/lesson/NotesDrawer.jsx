import { useEffect, useState } from 'react'
import { Drawer } from '../ui/Drawer'

function loadNotes(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? []
  } catch {
    return []
  }
}

export function NotesDrawer({ lessonTitle, conceptTitle, storageKey, onClose }) {
  const [notes, setNotes] = useState(() => loadNotes(storageKey))
  const [draft, setDraft] = useState('')

  useEffect(() => {
    setNotes(loadNotes(storageKey))
    setDraft('')
  }, [storageKey])

  const addNote = () => {
    const text = draft.trim()
    if (!text) return
    const nextNotes = [...notes, text]
    setNotes(nextNotes)
    localStorage.setItem(storageKey, JSON.stringify(nextNotes))
    setDraft('')
  }

  return (
    <Drawer title="Notes" subtitle={conceptTitle ? `${lessonTitle} · ${conceptTitle}` : lessonTitle} onClose={onClose} labelledBy="lesson-notes-title">
      <div className="grid gap-5">
        <label className="sr-only" htmlFor="lesson-note">Write a note</label>
        <textarea
          id="lesson-note"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a note…"
          className="min-h-[132px] w-full resize-y rounded-xl border border-[#404040] bg-[#1f1f1f] px-4 py-3 text-[15px] leading-[1.55] text-[#f4f4f2] placeholder:text-[#89898e] focus:border-[#6699ec] focus:outline-none [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:placeholder:text-[#888]"
        />
        <button
          type="button"
          onClick={addNote}
          disabled={!draft.trim()}
          className="justify-self-start rounded-xl border-0 bg-[#5541ed] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_3px_0_#3828b8] transition-colors hover:bg-[#6655f2] disabled:cursor-not-allowed disabled:bg-[#7771bb] disabled:shadow-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#88bdf2]"
        >
          + Add note
        </button>

        <div className="border-t border-[#404040] pt-5 [[data-theme=light]_&]:border-[#e1e1e1]">
          {notes.length === 0 ? (
            <p className="m-0 text-[15px] leading-[1.55] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">No notes on this concept yet.</p>
          ) : (
            <ul className="m-0 grid list-none gap-3 p-0">
              {notes.map((note, index) => <li key={`${note}-${index}`} className="rounded-xl bg-[#262626] px-4 py-3 text-[15px] leading-[1.55] text-[#d7d7da] [[data-theme=light]_&]:bg-[#f5f5f5] [[data-theme=light]_&]:text-[#454545]">{note}</li>)}
            </ul>
          )}
        </div>
      </div>
    </Drawer>
  )
}
