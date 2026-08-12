import { useState } from 'react'
import { currentPath, explorePaths, getPath, pathShelves } from '../../data/paths'
import { CurrentPathCard } from './CurrentPathCard'
import { ExplorePathCard, PathPreview } from './ExplorePathCard'
import { LearningPathDetail } from './LearningPathDetail'

export default function PathsView({ currentLearnerPath = currentPath, completedLessons, onOpenLesson }) {
  const [view, setView] = useState('overview')
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedPath, setSelectedPath] = useState(null)
  const paths = (type === 'all' ? explorePaths : explorePaths.filter((path) => path.type === type)).filter((path) => {
    const term = query.trim().toLowerCase()
    return !term || [path.title, path.description, ...path.tools].join(' ').toLowerCase().includes(term)
  })

  const selectPath = (path) => {
    if (pathShelves.some((authoredPath) => authoredPath.id === path.id)) {
      setSelectedPath(path)
      setView('detail')
      return
    }
    setSelectedPath(path)
    setView('preview')
  }

  if (view === 'detail') return <LearningPathDetail path={selectedPath ? getPath(selectedPath.id) : currentPath} completedLessons={completedLessons} onOpenLesson={onOpenLesson} onBack={() => setView('overview')} />
  if (view === 'preview' && selectedPath) return <PathPreview path={selectedPath} onBack={() => setView('overview')} />

  return (
    <section className="grid gap-8" aria-labelledby="paths-title">
      <header className="grid max-w-2xl gap-3">
        <h1 id="paths-title" className="page-title">Paths</h1>
        <p className="body-copy m-0">Continue learning or choose a new path.</p>
      </header>

      <CurrentPathCard path={currentLearnerPath} onOpenDetail={() => { setSelectedPath(null); setView('detail') }} />

      <section className="grid gap-6" aria-labelledby="explore-paths-title">
        <div className="flex items-center justify-between gap-4">
          <h2 id="explore-paths-title" className="section-title">Explore paths</h2>
          <span className="meta-copy">{explorePaths.length} paths</span>
        </div>
        <div className="flex items-center justify-between gap-4 max-[680px]:items-stretch max-[680px]:flex-col">
          <div className="flex gap-2" role="group" aria-label="Path type">
            {[['all', 'All'], ['career', 'Career paths'], ['skill', 'Skill paths']].map(([value, label]) => {
              const isActive = type === value
              return <button key={value} type="button" aria-pressed={isActive} onClick={() => setType(value)} className="control-pill flex-none px-4 text-[var(--type-label)] font-medium">{label}</button>
            })}
          </div>
          <label className="max-[680px]:w-full">
            <span className="sr-only">Search paths</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search paths" className="form-control w-56 px-4 text-sm max-[680px]:w-full" />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[680px]:grid-cols-1">
          {paths.map((path) => <ExplorePathCard key={path.id} path={path} onSelect={selectPath} />)}
        </div>
      </section>
    </section>
  )
}
