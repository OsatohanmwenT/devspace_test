import { useState } from 'react'
import { categories, explorePaths } from '../../data/paths'
import { CurrentPathCard } from './CurrentPathCard'
import { ExplorePathCard } from './ExplorePathCard'
import { LearningPathDetail } from './LearningPathDetail'

export default function PathsView({ onNotice, onOpenLesson }) {
  const [view, setView] = useState('overview')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const matchesPath = (path) => {
    const query = search.trim().toLowerCase()
    const matchesCategory = category === 'All' || path.category === category
    const matchesSearch = !query || `${path.title} ${path.category} ${path.reason}`.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  }

  const recommendedPaths = explorePaths.filter((path) => path.type === 'career').slice(0, 3)
  const recommendedTitles = new Set(recommendedPaths.map((path) => path.title))

  const allPaths = explorePaths.filter((path) => !recommendedTitles.has(path.title) && matchesPath(path))

  if (view === 'detail') {
    return <LearningPathDetail onNotice={onNotice} onOpenLesson={onOpenLesson} onBack={() => setView('overview')} />
  }

  return (
    <section className="paths-view" aria-label="Learning paths">
      <header className="paths-page-header">
        <h1>Learning Paths</h1>
        <p>Continue where you left off, or find your next path</p>
      </header>

      <div className="paths-learning">
        <CurrentPathCard onOpenDetail={() => setView('detail')} />
      </div>

      <div className="paths-explore">
        <section className="paths-discovery-controls" aria-label="Find a path">
          <div className="paths-search-field">
            <label htmlFor="path-search">Explore paths</label>
            <input id="path-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search career paths or skills..." />
          </div>
          <div className="paths-category-filters" role="group" aria-label="Path categories">
            {categories.map((item) => (
              <button
                className={category === item ? 'active' : ''}
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="paths-section" aria-labelledby="recommended-title">
          <div className="paths-section-heading">
            <div>
              <span className="paths-eyebrow">Recommended for you</span>
              <h2 id="recommended-title">Paths that fit your direction</h2>
              <p className="paths-section-caption">Always shown based on your current path — independent of search and filters.</p>
            </div>
          </div>
          <div className="illustrated-path-grid">
            {recommendedPaths.map((path) => <ExplorePathCard key={path.title} path={path} onNotice={onNotice} />)}
          </div>
        </section>

        <section className="paths-section" aria-labelledby="all-paths-title">
          <div className="paths-section-heading"><div><span className="paths-eyebrow">Explore</span><h2 id="all-paths-title">All Paths</h2></div><span className="paths-result-count" aria-live="polite" aria-atomic="true">{allPaths.length} paths</span></div>
          <div className="illustrated-path-grid">
            {allPaths.map((path) => <ExplorePathCard key={path.title} path={path} onNotice={onNotice} />)}
            {allPaths.length === 0 && <p className="paths-empty">No paths match that search yet.</p>}
          </div>
        </section>
      </div>
    </section>
  )
}
