import { useEffect, useState } from 'react'
import { currentPath, explorePaths, getPath, pathShelves } from '../../data/paths'
import { CurrentPathCard, PathProgressCard } from './CurrentPathCard'
import { CustomPathCard } from './CustomPathCard'
import { CustomPathBuilder } from './CustomPathBuilder'
import { CustomPathIntroduction } from './CustomPathIntroduction'
import { ExplorePathCard, PathPreviewModal } from './ExplorePathCard'
import { LearningPathDetail } from './LearningPathDetail'

export default function PathsView({ currentLearnerPath = currentPath, completedLessons, onOpenLesson, onChooseFramework, initialView, initialSelectedPathId, customPaths = {}, primaryPathId, onCreateCustomPath, onStartPath, hasSeenCustomPathIntroduction, onDismissCustomPathIntroduction, profile, onFullScreenChange }) {
  // A caller (Home's "Also learning" quick-switch) can land directly on a
  // specific path's detail rather than the overview — `path` only needs an
  // `id`, since LearningPathDetail always re-fetches the full record via
  // `getPath` below.
  const [view, setView] = useState(initialView ?? (initialSelectedPathId ? 'detail' : 'overview'))
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedPath, setSelectedPath] = useState(() => initialSelectedPathId ? { id: initialSelectedPathId } : null)
  const [selectedCustomPath, setSelectedCustomPath] = useState(null)
  const [previewPath, setPreviewPath] = useState(null)

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
      onMakePrimary={(path) => { onStartPath(path.id); setSelectedCustomPath(null); setView('overview') }}
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
              <PathProgressCard
                key={path.id}
                title={path.title}
                subtitle={`Building: ${path.project}`}
                badge="Custom"
                actionLabel="Resume"
                onOpen={() => onStartPath(path.id)}
              />
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
          onStartPath={onStartPath}
        />
      )}
    </section>
  )
}
