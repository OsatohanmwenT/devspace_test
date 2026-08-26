import { useEffect, useState } from 'react'
import { currentPath, explorePaths, getPath, pathShelves } from '../../data/paths'
import { CurrentPathCard } from './CurrentPathCard'
import { CustomPathCard } from './CustomPathCard'
import { CustomPathBuilder } from './CustomPathBuilder'
import { CustomPathIntroduction } from './CustomPathIntroduction'
import { ExplorePathCard, PathPreviewModal } from './ExplorePathCard'
import { LearningPathDetail } from './LearningPathDetail'

export default function PathsView({ currentLearnerPath = currentPath, completedLessons, onOpenLesson, onChooseFramework, initialView, customPaths = {}, primaryPathId, onCreateCustomPath, onSwitchPrimaryPath, hasSeenCustomPathIntroduction, onDismissCustomPathIntroduction, profile, onFullScreenChange }) {
  const [view, setView] = useState(initialView ?? 'overview')
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedPath, setSelectedPath] = useState(null)
  const [selectedCustomPath, setSelectedCustomPath] = useState(null)
  const [previewPath, setPreviewPath] = useState(null)
  const [customPathToSwitch, setCustomPathToSwitch] = useState(null)

  // Custom path building is its own focused surface, not just another Paths
  // subview — the chrome-free callback lets the shell drop the top nav for it.
  useEffect(() => {
    onFullScreenChange?.(view === 'custom')
    return () => onFullScreenChange?.(false)
  }, [view, onFullScreenChange])
  const customPathList = Object.values(customPaths)
  const pausedCustomPaths = customPathList.filter((path) => path.id !== primaryPathId)

  const paths = (type === 'all' ? explorePaths : explorePaths.filter((path) => path.type === type)).filter((path) => {
    const term = query.trim().toLowerCase()
    return !term || [path.title, path.description, ...path.tools].join(' ').toLowerCase().includes(term)
  })

  // Authored paths get the full LearningPathDetail page — there's a roadmap to
  // walk through. Everything else is just a confirm-before-committing step,
  // so it opens as a dialog over the explore grid rather than navigating away.
  const selectPath = (path) => {
    if (pathShelves.some((authoredPath) => authoredPath.id === path.id)) {
      setSelectedPath(path)
      setView('detail')
      return
    }
    setPreviewPath(path)
  }

  const activeTargetId = selectedPath ? selectedPath.id : currentLearnerPath.id
  const isSelectedCurrent = activeTargetId === primaryPathId

  if (view === 'detail') {
    return (
      <LearningPathDetail
        path={selectedPath ? getPath(selectedPath.id, customPaths) : currentLearnerPath}
        completedLessons={completedLessons}
        onOpenLesson={onOpenLesson}
        onBack={() => setView('overview')}
        isCurrentPath={isSelectedCurrent}
        onSwitchPrimaryPath={onSwitchPrimaryPath}
        onChooseFramework={onChooseFramework}
        profile={profile}
      />
    )
  }
  if (view === 'custom' && !selectedCustomPath && !hasSeenCustomPathIntroduction) return <CustomPathIntroduction onComplete={onDismissCustomPathIntroduction} />
  if (view === 'custom') return (
    <CustomPathBuilder
      key={selectedCustomPath?.id ?? 'new-custom-path'}
      existingPath={selectedCustomPath}
      isPrimary={selectedCustomPath?.id === primaryPathId}
      onMakePrimary={(path) => { onSwitchPrimaryPath(path.id); setSelectedCustomPath(null); setView('overview') }}
      onBack={() => { setSelectedCustomPath(null); setView('overview') }}
      onStart={(route) => { onCreateCustomPath(route); setSelectedCustomPath(null); setView('overview') }}
    />
  )

  return (
    <section className="grid gap-6 max-[720px]:gap-5" aria-label="Learning paths">
      <header className="grid gap-1 max-w-[680px]">
        <h1 className="text-[26px] font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">Paths</h1>
        <p className="text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Continue learning or choose a new path.</p>
      </header>

      <section className="grid gap-3" aria-labelledby="your-progress-title">
        <h2 id="your-progress-title" className="text-[19px] font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">Your progress</h2>
        <div className="grid grid-cols-3 gap-3 max-[980px]:grid-cols-2 max-[680px]:grid-cols-1">
          <CurrentPathCard path={currentLearnerPath} onOpenDetail={() => { setSelectedPath(null); setView('detail') }} />

      {pausedCustomPaths.length > 0 && (
        <>
            {pausedCustomPaths.map((path) => (
              <button key={path.id} type="button" onClick={() => setCustomPathToSwitch(path)} className="grid min-h-[164px] content-between gap-3 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-5 text-left transition-[border-color,background,transform] duration-150 hover:-translate-y-0.5 hover:border-[#525252] hover:bg-[#252525] focus-visible:outline-3 focus-visible:outline-[#8ee6ad] focus-visible:outline-offset-3 [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:hover:border-[#d4d4d4] [[data-theme=light]_&]:hover:bg-[#fafafa]">
                <div className="min-w-0">
                  <h3 className="truncate font-rethink-sans text-[19px] font-medium leading-[1.3] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{path.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Building: {path.project}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-[#8ee6ad] [[data-theme=light]_&]:text-[#168a46]">Open path</span>
                  <span className="inline-flex rounded-full bg-[#1d3b2a] px-2 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-[#8ee6ad] [[data-theme=light]_&]:bg-[#e2f6e8] [[data-theme=light]_&]:text-[#168a46]">Custom</span>
                </div>
              </button>
            ))}
        </>
      )}
        </div>
      </section>

      <section className="grid gap-4 border-t border-[#404040] pt-5 [[data-theme=light]_&]:border-[#eeeeeb]" aria-labelledby="explore-paths-title">
        <div className="flex items-center justify-between gap-4">
          <h2 id="explore-paths-title" className="text-[19px] font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">Explore paths</h2>
          <span className="text-[12px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">{explorePaths.length} paths</span>
        </div>
        <div className="flex items-center justify-between gap-4 max-[680px]:items-stretch max-[680px]:flex-col">
          <div className="flex gap-2" role="group" aria-label="Path type">
            {[['all', 'All'], ['career', 'Career paths'], ['skill', 'Skill paths']].map(([value, label]) => {
              const isActive = type === value
              return <button key={value} type="button" aria-pressed={isActive} onClick={() => setType(value)} className={isActive ? 'min-h-10 rounded-xl border border-[#4169e1] bg-[#4169e1] px-4 text-[13px] font-semibold text-white focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-3' : 'min-h-10 rounded-xl border border-[#404040] bg-[#252525] px-4 text-[13px] text-[#f4f4f2] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-[#525252] focus-visible:outline-3 focus-visible:outline-[#4169e1] focus-visible:outline-offset-3'}>{label}</button>
            })}
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search paths"
            aria-label="Search paths"
            className="h-10 w-[280px] rounded-xl border border-[#4a4a4a] bg-[#252525] px-4 text-[13px] text-[#f4f4f2] placeholder:text-[#89898e] outline-none focus:border-[#4169e1] focus:ring-2 focus:ring-[#4169e1]/30 [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:placeholder:text-[#737371] max-[680px]:w-full"
          />
        </div>
        <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[680px]:grid-cols-1">
          {paths.map((path) => <ExplorePathCard key={path.id} path={path} onSelect={selectPath} />)}
        </div>
      </section>

      <CustomPathCard onCreatePath={() => { setSelectedCustomPath(null); setView('custom') }} />

      {previewPath && (
        <PathPreviewModal
          path={previewPath}
          onClose={() => setPreviewPath(null)}
          isCurrentPath={previewPath.id === primaryPathId}
          onSwitchPrimaryPath={onSwitchPrimaryPath}
        />
      )}
      {customPathToSwitch && (
        <CustomPathSwitchDialog
          path={customPathToSwitch}
          onClose={() => setCustomPathToSwitch(null)}
          onConfirm={() => {
            onSwitchPrimaryPath(customPathToSwitch.id)
            setCustomPathToSwitch(null)
          }}
        />
      )}
    </section>
  )
}

function CustomPathSwitchDialog({ path, onClose, onConfirm }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/65 p-5 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
      <article className="w-full max-w-[440px] rounded-2xl border border-[#404040] bg-[#1f1f1f] p-6 shadow-[0_24px_60px_rgba(0,0,0,.45)] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white" role="dialog" aria-modal="true" aria-labelledby="custom-path-switch-title" onMouseDown={(event) => event.stopPropagation()}>
        <span className="inline-flex rounded-full bg-[#1d3b2a] px-2 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-[#8ee6ad] [[data-theme=light]_&]:bg-[#e2f6e8] [[data-theme=light]_&]:text-[#168a46]">Custom</span>
        <h2 id="custom-path-switch-title" className="mt-3 font-rethink-sans text-[22px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Make {path.title} your primary path?</h2>
        <p className="mt-2 text-[14px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Your current path will be saved, so you can return to it later.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="min-h-10 rounded-xl px-4 text-[13px] font-semibold text-[#d4d4d4] hover:bg-[#303030] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-3 [[data-theme=light]_&]:text-[#525252] [[data-theme=light]_&]:hover:bg-[#f5f5f4]" onClick={onClose}>Cancel</button>
          <button type="button" className="min-h-10 rounded-xl bg-[#168a46] px-4 text-[13px] font-semibold text-white hover:bg-[#11753a] focus-visible:outline-3 focus-visible:outline-[#8ee6ad] focus-visible:outline-offset-3" onClick={onConfirm}>Make primary</button>
        </div>
      </article>
    </div>
  )
}
