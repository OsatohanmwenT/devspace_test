import { useRef, useState } from 'react'
import { categories, explorePaths } from '../../data/paths'
import { CurrentPathCard } from './CurrentPathCard'
import { ExplorePathCard } from './ExplorePathCard'
import { LearningPathDetail } from './LearningPathDetail'

const tabs = [
  { id: 'learning', label: 'My learning' },
  { id: 'explore', label: 'Explore' },
]

export default function PathsView({ onNotice }) {
  const [tab, setTab] = useState('learning')
  const [view, setView] = useState('overview')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const tabRefs = useRef([])

  const matchesPath = (path) => {
    const query = search.trim().toLowerCase()
    const matchesCategory = category === 'All' || path.category === category
    const matchesSearch = !query || `${path.title} ${path.category} ${path.reason}`.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  }

  const recommendedPaths = explorePaths.filter((path) => path.type === 'career').slice(0, 3)
  const recommendedTitles = new Set(recommendedPaths.map((path) => path.title))

  const careerPaths = explorePaths.filter((path) => path.type === 'career' && !recommendedTitles.has(path.title) && matchesPath(path))
  const skillPaths = explorePaths.filter((path) => path.type === 'skill' && matchesPath(path))

  const handleTabKeyDown = (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const currentIndex = tabs.findIndex((item) => item.id === tab)
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length
    setTab(tabs[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  if (view === 'detail') {
    return <LearningPathDetail onNotice={onNotice} onBack={() => setView('overview')} />
  }

  return (
    <section className={`paths-view paths-view-${tab}`} aria-label="Learning paths">
      <header className="paths-page-header">
        <span className="paths-eyebrow">Learning</span>
        <h1>Learning Paths</h1>
        <p>Step-by-step paths to mastery</p>
        <div className="paths-tabs" role="tablist" aria-label="Path views" onKeyDown={handleTabKeyDown}>
          {tabs.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => { tabRefs.current[index] = el }}
              id={`paths-tab-${item.id}`}
              className={tab === item.id ? 'paths-tab active' : 'paths-tab'}
              onClick={() => setTab(item.id)}
              role="tab"
              type="button"
              aria-selected={tab === item.id}
              aria-controls={`paths-panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {tab === 'learning' ? (
        <div className="paths-learning" id="paths-panel-learning" role="tabpanel" aria-labelledby="paths-tab-learning">
          <CurrentPathCard onOpenDetail={() => setView('detail')} />
        </div>
      ) : (
        <div className="paths-explore" id="paths-panel-explore" role="tabpanel" aria-labelledby="paths-tab-explore">
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

          <section className="paths-section" aria-labelledby="career-title">
            <div className="paths-section-heading"><div><span className="paths-eyebrow">Explore</span><h2 id="career-title">Career Paths</h2></div><span className="paths-result-count" aria-live="polite" aria-atomic="true">{careerPaths.length} paths</span></div>
            <div className="illustrated-path-grid">
              {careerPaths.map((path) => <ExplorePathCard key={path.title} path={path} onNotice={onNotice} />)}
              {careerPaths.length === 0 && <p className="paths-empty">No career paths match that search yet.</p>}
            </div>
          </section>

          <section className="paths-section" aria-labelledby="skill-title">
            <div className="paths-section-heading"><div><span className="paths-eyebrow">Explore</span><h2 id="skill-title">Skill Paths</h2></div><span className="paths-result-count" aria-live="polite" aria-atomic="true">{skillPaths.length} paths</span></div>
            <div className="illustrated-path-grid skill-path-grid">
              {skillPaths.map((path) => <ExplorePathCard key={path.title} path={path} onNotice={onNotice} />)}
              {skillPaths.length === 0 && <p className="paths-empty">No skill paths match that search yet.</p>}
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
