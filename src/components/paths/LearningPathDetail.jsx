import { useEffect, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { BookOpenIcon, ChecklistIcon } from '../ui/icons'
import { FAMILY_ACCENTS } from './ExplorePathCard'
import { LessonRow } from './LessonRow'
import { CheatsheetDrawer } from './CheatsheetDrawer'
import { GuidebookView } from './GuidebookView'
import { getRegionTopics } from '../../data/learningResources'

export function LearningPathDetail({ path, completedLessons, onOpenLesson, onBack }) {
  const regions = path.cards
  const lessons = regions.flatMap((region) => region.lessons)
  const currentLesson = lessons.find((lesson) => lesson.state === 'current')
  const [selectedLessonId, setSelectedLessonId] = useState(currentLesson?.id)
  const [startedLessonIds, setStartedLessonIds] = useState([])
  const [pinnedRegionId, setPinnedRegionId] = useState(null)
  const [openResource, setOpenResource] = useState(null)
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId)
  const selectedRegion = regions.find((region) => region.lessons.some((lesson) => lesson.id === selectedLessonId)) ?? regions[0]
  const selectedLessonStarted = selectedLesson && startedLessonIds.includes(selectedLesson.id)
  const canOpenLesson = selectedLesson?.state === 'current'
  const familyAccent = (FAMILY_ACCENTS[path.family] ?? FAMILY_ACCENTS.backend).accent

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !openResource) onBack()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onBack, openResource])

  useEffect(() => {
    const updatePinnedRegion = () => {
      const pinnedHeader = [...document.querySelectorAll('[data-region-header]')]
        .filter((header) => {
          const bounds = header.getBoundingClientRect()
          return bounds.top <= 12 && bounds.bottom > 12
        })
        .at(-1)

      const pinnedId = pinnedHeader?.dataset.regionHeader ?? null
      setPinnedRegionId((currentId) => currentId === pinnedId ? currentId : pinnedId)
    }

    updatePinnedRegion()
    window.addEventListener('scroll', updatePinnedRegion, { passive: true })
    window.addEventListener('resize', updatePinnedRegion)
    return () => {
      window.removeEventListener('scroll', updatePinnedRegion)
      window.removeEventListener('resize', updatePinnedRegion)
    }
  }, [path.id])

  return (
    <section className="min-w-0 pb-8" aria-labelledby="path-detail-title">
      <button
        className="mb-4.5 inline-flex min-h-11 items-center gap-2 border-0 bg-transparent p-0 text-[15px] font-semibold text-[var(--text-primary)] hover:text-[var(--border-focus)] focus-visible:rounded-lg focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--border-focus)]"
        onClick={onBack}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m15 5-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>My learning</span>
        <BookOpenIcon className="w-5 h-5" />
      </button>
      <div className="grid grid-cols-[minmax(340px,420px)_minmax(0,700px)] justify-between items-start gap-14 max-[900px]:grid-cols-1 max-[900px]:gap-9 max-[680px]:gap-6">
        <aside className="sticky top-[22px] grid grid-cols-1 gap-3.5 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--surface-default)] px-7 pb-7 pt-[26px] shadow-[var(--shadow-raised)] max-[900px]:static max-[900px]:grid-cols-[120px_minmax(0,1fr)_auto] max-[900px]:items-center max-[900px]:p-[22px] max-[680px]:grid-cols-[92px_minmax(0,1fr)] max-[680px]:gap-x-4 max-[680px]:gap-y-3 max-[680px]:p-4.5">
          <div className="relative grid min-h-[178px] place-items-center -mt-1.5 mb-1 after:content-[''] after:absolute after:bottom-[15px] after:left-1/2 after:-translate-x-1/2 after:w-[166px] after:h-3.5 after:rounded-full after:bg-black/50 [[data-theme=light]_&]:after:bg-black/[0.12] max-[900px]:row-span-3 max-[900px]:min-h-[120px] max-[900px]:m-0 max-[900px]:after:bottom-[5px] max-[900px]:after:w-[106px] max-[900px]:after:h-2.5 max-[680px]:min-h-[92px] max-[680px]:after:bottom-[2px] max-[680px]:after:w-[80px] max-[680px]:after:h-2">
            <img className="relative z-[1] block w-[174px] h-[174px] object-contain rotate-[-2deg] max-[900px]:w-[118px] max-[900px]:h-[118px] max-[680px]:w-[92px] max-[680px]:h-[92px]" src={selectedRegion.image} alt="" />
          </div>
          <span className="text-[11px] font-semibold tracking-[.1em] uppercase" style={{ color: familyAccent }}>{selectedRegion.level}</span>
          <h2
            id="path-detail-title"
            className="mt-[-2px] text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] font-['Rethink_Sans',Arial,sans-serif] text-[30px] font-semibold max-[680px]:text-[23px]"
          >
            {selectedRegion.title}
          </h2>
          <p className="max-w-[29ch] mt-[-2px] mb-1 text-[14px] leading-[1.55] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)] max-[900px]:col-start-2 max-[680px]:[grid-column:1/-1] max-[680px]:mt-0">
            {selectedRegion.summary}
          </p>
          <div className="grid grid-cols-2 gap-3 mt-1 pt-[18px] border-t border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-hairline)] max-[900px]:row-span-2 max-[900px]:col-start-3 max-[900px]:border-t-0 max-[900px]:border-l max-[900px]:pt-0 max-[900px]:pl-[22px] max-[680px]:row-span-1 max-[680px]:[grid-column:1/-1] max-[680px]:border-t max-[680px]:border-l-0 max-[680px]:pl-0 max-[680px]:pt-3.5">
            <ActionButton variant="secondary" className="inline-flex items-center justify-center gap-2 px-3 text-xs font-semibold" onClick={() => setOpenResource('cheatsheet')}><ChecklistIcon className="size-4" />Cheatsheet</ActionButton>
            <ActionButton variant="secondary" className="inline-flex items-center justify-center gap-2 px-3 text-xs font-semibold" onClick={() => setOpenResource('guidebook')}><BookOpenIcon className="size-4" />Guidebook</ActionButton>
          </div>
        </aside>

        <div className="grid w-[min(100%,700px)] min-w-0 gap-12 mx-auto">
          {regions.map((region) => {
            return (
              <section className="relative grid" key={region.id} aria-labelledby={`${region.id}-title`}>
                <header
                  data-region-header={region.id}
                  className={`relative isolate sticky top-3 z-[2] grid min-h-[70px] content-center justify-items-center gap-1 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--surface-default)] px-[18px] py-3 text-center shadow-[var(--shadow-raised)] max-[680px]:min-h-[64px] ${pinnedRegionId === region.id ? "after:content-[''] after:pointer-events-none after:fixed after:top-0 after:left-0 after:z-0 after:h-3 after:w-screen after:bg-[var(--surface-canvas)]" : ''}`}
                >
                  <span className="relative z-[1] text-[11px] font-bold tracking-[.1em] uppercase text-[var(--brand-cta)]">
                    {region.level.replace('Region', 'Section')}
                  </span>
                  <h2 id={`${region.id}-title`} className="relative z-[1] m-0 text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] text-[16px] font-medium">{region.title}</h2>
                </header>
                <div className="relative grid gap-2.5 pt-8 px-6 pb-1 before:content-[''] before:absolute before:top-3 before:bottom-[18px] before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:bg-[var(--border-default)] [[data-theme=light]_&]:before:bg-[var(--border-hairline)] max-[680px]:pt-6 max-[680px]:px-0 max-[680px]:pb-0.5">
                  {region.lessons.map((lesson, index) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      index={index}
                      isSelected={lesson.id === selectedLessonId}
                      onSelect={() => setSelectedLessonId(lesson.id)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
          {selectedLesson && (
            <aside
              className="sticky bottom-[18px] z-[5] mx-4 flex min-h-[92px] items-center justify-between gap-[18px] rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--surface-default)] px-[18px] py-4 shadow-[var(--shadow-raised)] max-[680px]:mx-0 max-[680px]:min-h-0 max-[680px]:p-3"
              aria-label="Selected lesson"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold tracking-[.08em] uppercase text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">{canOpenLesson ? 'Current lesson' : 'Lesson preview'}</span>
                <h2 className="mt-[5px] overflow-hidden text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] font-['Rethink_Sans',Arial,sans-serif] text-[18px] font-medium text-ellipsis whitespace-nowrap max-[680px]:max-w-[140px] max-[680px]:text-[15px]">{selectedLesson.title}</h2>
                {selectedLesson.description && <p className="max-w-[420px] mt-1.5 text-[13px] leading-[1.4] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">{selectedLesson.description}</p>}
              </div>
              {canOpenLesson && (
                <ActionButton variant="primary" className="min-h-11 w-fit! px-7 whitespace-nowrap" onClick={() => {
                  setStartedLessonIds((startedIds) => startedIds.includes(selectedLesson.id)
                    ? startedIds
                    : [...startedIds, selectedLesson.id])
                  onOpenLesson(selectedLesson.id)
                }}>
                  {selectedLessonStarted ? 'Continue' : 'Start lesson'}
                </ActionButton>
              )}
            </aside>
          )}
        </div>
      </div>
      {openResource === 'cheatsheet' && (
        <CheatsheetDrawer
          title="Cheatsheet"
          subtitle={selectedRegion.title}
          topics={getRegionTopics(selectedRegion.id)}
          onClose={() => setOpenResource(null)}
        />
      )}
      {openResource === 'guidebook' && (
        <GuidebookView
          key={selectedRegion.id}
          region={selectedRegion}
          onBack={() => setOpenResource(null)}
        />
      )}
    </section>
  )
}
