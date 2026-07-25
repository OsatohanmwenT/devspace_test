import { useState } from 'react'

const pathShelves = [
  {
    id: 'machine-learning',
    family: 'ml',
    level: 'Career path',
    title: 'Machine Learning Engineer',
    description: 'Build the skills to prepare data, train models and deploy reliable ML systems.',
    progress: '12% complete',
    emblem: '/assets/scientific-thinking.png',
    cards: [
      { title: 'Orientation', state: 'completed', image: '/assets/programming-with-variables.png' },
      { title: 'Python Foundations', state: 'completed', image: '/assets/programming-with-variables.png' },
      { title: 'Data & Math Foundations', state: 'current', progress: '35%', image: '/assets/probability-and-chance.png' },
      { title: 'EDA & Features', state: 'available', image: '/assets/exploring-data-visually.png' },
      { title: 'Core ML', state: 'locked', image: '/assets/scientific-thinking.png' },
      { title: 'ML Career Capstone', state: 'locked', image: '/assets/exploring-data-visually.png', capstone: true },
    ],
  },
]

const currentPath = pathShelves[0]
const currentRegion = currentPath.cards.find((card) => card.state === 'current')

const detailLevels = [
  {
    level: 'Level 1',
    title: 'Taking the First Steps',
    lessons: [
      { title: 'Writing Programs', image: '/assets/thinking-in-code.png', state: 'current' },
      { title: 'Sequencing Commands', image: '/assets/programming-with-variables.png', state: 'available' },
      { title: 'Using Variables', image: '/assets/programming-with-variables.png', state: 'available' },
    ],
  },
  {
    level: 'Level 2',
    title: 'Building Blocks',
    lessons: [
      { title: 'Making Decisions', image: '/assets/scientific-thinking.png', state: 'locked' },
      { title: 'Repeating Instructions', image: '/assets/thinking-in-code.png', state: 'locked' },
      { title: 'Working with Data', image: '/assets/exploring-data-visually.png', state: 'locked' },
    ],
  },
  {
    level: 'Level 3',
    title: 'Thinking in Systems',
    lessons: [
      { title: 'Designing Solutions', image: '/assets/scientific-thinking.png', state: 'locked' },
      { title: 'Testing Your Ideas', image: '/assets/probability-and-chance.png', state: 'locked' },
      { title: 'A Complete Program', image: '/assets/thinking-in-code.png', state: 'locked' },
    ],
  },
  {
    level: 'Level 4',
    title: 'Functions',
    lessons: [
      { title: 'Reusable Steps', image: '/assets/programming-with-variables.png', state: 'locked' },
      { title: 'Building Blocks', image: '/assets/scientific-thinking.png', state: 'locked' },
      { title: 'Function Challenge', image: '/assets/thinking-in-code.png', state: 'locked' },
    ],
  },
  {
    level: 'Level 5',
    title: 'Working with Data',
    lessons: [
      { title: 'Data Structures', image: '/assets/exploring-data-visually.png', state: 'locked' },
      { title: 'Patterns in Data', image: '/assets/probability-and-chance.png', state: 'locked' },
      { title: 'Data Practice', image: '/assets/scientific-thinking.png', state: 'locked' },
    ],
  },
  {
    level: 'Level 6',
    title: 'Algorithms',
    lessons: [
      { title: 'Step-by-Step Solutions', image: '/assets/thinking-in-code.png', state: 'locked' },
      { title: 'Finding Patterns', image: '/assets/programming-with-variables.png', state: 'locked' },
      { title: 'Algorithm Challenge', image: '/assets/scientific-thinking.png', state: 'locked' },
    ],
  },
  {
    level: 'Level 7',
    title: 'Debugging',
    lessons: [
      { title: 'Spotting Mistakes', image: '/assets/scientific-thinking.png', state: 'locked' },
      { title: 'Testing Ideas', image: '/assets/probability-and-chance.png', state: 'locked' },
      { title: 'Debugging Challenge', image: '/assets/thinking-in-code.png', state: 'locked' },
    ],
  },
  {
    level: 'Level 8',
    title: 'Exploring with Logic',
    lessons: [
      { title: 'Logical Conditions', image: '/assets/programming-with-variables.png', state: 'locked' },
      { title: 'Combining Ideas', image: '/assets/scientific-thinking.png', state: 'locked' },
      { title: 'Logic Challenge', image: '/assets/thinking-in-code.png', state: 'locked' },
    ],
  },
  {
    level: 'Level 9',
    title: 'Building Programs',
    lessons: [
      { title: 'Putting It Together', image: '/assets/thinking-in-code.png', state: 'locked' },
      { title: 'Project Foundations', image: '/assets/exploring-data-visually.png', state: 'locked' },
      { title: 'Final Program', image: '/assets/programming-with-variables.png', state: 'locked' },
    ],
  },
]

const explorePaths = [
  { type: 'career', category: 'Data & AI', family: 'ml', title: 'Machine Learning Engineer', meta: 'Beginner · 8 regions', reason: 'Prepare data, train models and deploy ML systems.', image: '/assets/scientific-thinking.png' },
  { type: 'career', category: 'Data & AI', family: 'data', title: 'Data Scientist', meta: 'Beginner · 7 regions', reason: 'Turn evidence into clear decisions with data.', image: '/assets/exploring-data-visually.png' },
  { type: 'career', category: 'Development', family: 'backend', title: 'Backend Developer', meta: 'Beginner · 8 regions', reason: 'Build reliable services and software systems.', image: '/assets/programming-with-variables.png' },
  { type: 'career', category: 'Cloud & Security', family: 'security', title: 'AI Engineer', meta: 'Intermediate · 7 regions', reason: 'Build intelligent products with modern AI tools.', image: '/assets/thinking-in-code.png' },
  { type: 'skill', category: 'Development', family: 'backend', title: 'Learn Python', meta: 'Beginner · 7 lessons', reason: 'Build useful programs with Python.', image: '/assets/programming-with-variables.png' },
  { type: 'skill', category: 'Data & AI', family: 'data', title: 'Learn SQL', meta: 'Beginner · 6 lessons', reason: 'Query data and turn questions into answers.', image: '/assets/exploring-data-visually.png' },
  { type: 'skill', category: 'Development', family: 'backend', title: 'Learn Git', meta: 'Beginner · 5 lessons', reason: 'Work confidently with versions and collaboration.', image: '/assets/scientific-thinking.png' },
  { type: 'skill', category: 'Development', family: 'backend', title: 'Learn Docker', meta: 'Beginner · 6 lessons', reason: 'Package and run projects anywhere.', image: '/assets/thinking-in-code.png' },
]

const categories = ['All', 'Development', 'Data & AI', 'Cloud & Security', 'Design & Product', 'Business & Marketing', 'Quality']

function CurrentPathCard({ onNotice, onOpenDetail }) {
  return (
    <section className="learning-overview" aria-labelledby="my-learning-title">
      <span className="paths-eyebrow">My learning</span>
      <h2 id="my-learning-title">Current path</h2>
      <article className="learning-current-card panel path-family-ml">
        <header className="learning-current-header">
          <div>
            <span className="learning-current-label">{currentPath.level}</span>
            <h3>{currentPath.title}</h3>
            <p>{currentPath.progress}</p>
          </div>
          <img src={currentPath.emblem} alt="" />
        </header>
        <div className="learning-current-region">
          <img src={currentRegion.image} alt="" />
          <div>
            <span>Current region</span>
            <h4>{currentRegion.title}</h4>
            <p>{currentRegion.progress} complete</p>
          </div>
          <button className="explore-path-action" onClick={onOpenDetail}>
            Continue <span aria-hidden="true">→</span>
          </button>
        </div>
      </article>
    </section>
  )
}

function ExplorePathCard({ path, onNotice }) {
  return (
    <article className={`explore-path-card panel path-family-${path.family}`}>
      <div className="explore-path-art">
        <img src={path.image} alt="" />
      </div>
      <div className="explore-path-copy">
        <span className="paths-eyebrow">{path.type === 'career' ? 'Career path' : 'Skill path'}</span>
        <h3>{path.title}</h3>
        <p className="explore-path-description">{path.reason}</p>
        <div className="explore-path-footer">
          <span className="explore-path-meta">{path.meta}</span>
          <button className="explore-path-action" onClick={() => onNotice(`${path.title} selected`)}>
            {path.type === 'career' ? 'View path' : 'View skill'} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </article>
  )
}

function LessonRow({ lesson, index, onStart, started }) {
  const isCurrent = lesson.state === 'current'
  const isLocked = lesson.state === 'locked'
  return (
    <article className={`path-detail-lesson path-detail-lesson-${lesson.state} path-detail-lesson-align-${index % 3}`}>
      <div className="path-detail-lesson-art">
        <img src="/assets/path-node.svg" alt="" />
      </div>
      <div className="path-detail-lesson-copy">
        <span className="path-detail-lesson-state">
          {isCurrent ? 'Current lesson' : isLocked ? 'Locked' : 'Available'}
        </span>
        <h3>{lesson.title}</h3>
        {isCurrent && <p>Practice the foundations with a short, focused lesson.</p>}
      </div>
      <span className="path-detail-lesson-marker" aria-hidden="true">
        {lesson.state === 'completed' ? '✓' : isLocked ? '□' : '○'}
      </span>
    </article>
  )
}

function LearningPathDetail({ onNotice, onBack }) {
  const [started, setStarted] = useState(false)
  return (
    <section className="path-detail" aria-labelledby="path-detail-title">
      <button className="path-detail-back" onClick={onBack}>← Back to My learning</button>
      <div className="path-detail-layout">
        <aside className="path-detail-summary panel">
          <div className="path-detail-summary-art">
            <img src="/assets/thinking-in-code.png" alt="Thinking in Code illustration" />
          </div>
          <span className="paths-eyebrow">Skill path</span>
          <h2 id="path-detail-title">Thinking in Code</h2>
          <p>Build solid foundations for computational problem solving.</p>
        </aside>

        <div className="path-detail-track">
          {detailLevels.map((level) => (
            <section className="path-detail-level" key={level.level} aria-labelledby={`${level.level}-title`}>
              <header className="path-detail-level-header">
                <span>{level.level}</span>
                <h2 id={`${level.level}-title`}>{level.title}</h2>
              </header>
              <div className="path-detail-lessons">
                {level.lessons.map((lesson) => (
                  <LessonRow
                    key={lesson.title}
                    lesson={lesson}
                    index={level.lessons.indexOf(lesson)}
                    started={started}
                    onStart={() => {
                      setStarted(true)
                      onNotice(`${lesson.title} started`)
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
          <section className="path-detail-current-panel" aria-labelledby="current-lesson-title">
            <h2 id="current-lesson-title">Writing Programs</h2>
            <button className="path-detail-cta" onClick={() => {
              setStarted(true)
              onNotice('Writing Programs started')
            }}>
              {started ? 'Continue' : 'Start'} <span aria-hidden="true">→</span>
            </button>
          </section>
        </div>
      </div>
    </section>
  )
}

export default function PathsView({ onNotice }) {
  const [tab, setTab] = useState('learning')
  const [view, setView] = useState('overview')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')


  const matchesPath = (path) => {
    const query = search.trim().toLowerCase()
    const matchesCategory = category === 'All' || path.category === category
    const matchesSearch = !query || `${path.title} ${path.category} ${path.reason}`.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  }

  const careerPaths = explorePaths.filter((path) => path.type === 'career' && matchesPath(path))
  const skillPaths = explorePaths.filter((path) => path.type === 'skill' && matchesPath(path))
  const recommendedPaths = explorePaths.filter((path) => path.type === 'career').slice(0, 3)

  if (view === 'detail') {
    return <LearningPathDetail onNotice={onNotice} onBack={() => setView('overview')} />
  }

  return (
    <section className="paths-view" aria-label="Learning paths">
      <header className="paths-page-header">
        <span className="paths-eyebrow">Learning</span>
        <h1>Learning Paths</h1>
        <p>Step-by-step paths to mastery</p>
        <div className="paths-tabs" role="tablist" aria-label="Path views">
          <button className={tab === 'learning' ? 'paths-tab active' : 'paths-tab'} onClick={() => setTab('learning')} role="tab" aria-selected={tab === 'learning'}>My learning</button>
          <button className={tab === 'explore' ? 'paths-tab active' : 'paths-tab'} onClick={() => setTab('explore')} role="tab" aria-selected={tab === 'explore'}>Explore</button>
        </div>
      </header>

      {tab === 'learning' ? (
        <div className="paths-learning">
          <CurrentPathCard onNotice={onNotice} onOpenDetail={() => setView('detail')} />
        </div>
      ) : (
        <div className="paths-explore">
          <section className="paths-discovery-controls" aria-label="Find a path">
            <div className="paths-search-field">
              <label htmlFor="path-search">Explore paths</label>
              <input id="path-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search career paths or skills..." />
            </div>
            <div className="paths-category-filters" aria-label="Path categories">
              {categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
          </section>

          <section className="paths-section" aria-labelledby="recommended-title">
            <div className="paths-section-heading">
              <div><span className="paths-eyebrow">Recommended for you</span><h2 id="recommended-title">Paths that fit your direction</h2></div>
            </div>
            <div className="illustrated-path-grid">
              {recommendedPaths.map((path) => <ExplorePathCard key={path.title} path={path} onNotice={onNotice} />)}
            </div>
          </section>

          <section className="paths-section" aria-labelledby="career-title">
            <div className="paths-section-heading"><div><span className="paths-eyebrow">Explore</span><h2 id="career-title">Career Paths</h2></div><span className="paths-result-count">{careerPaths.length} paths</span></div>
            <div className="illustrated-path-grid">
              {careerPaths.map((path) => <ExplorePathCard key={path.title} path={path} onNotice={onNotice} />)}
              {careerPaths.length === 0 && <p className="paths-empty">No career paths match that search yet.</p>}
            </div>
          </section>

          <section className="paths-section" aria-labelledby="skill-title">
            <div className="paths-section-heading"><div><span className="paths-eyebrow">Explore</span><h2 id="skill-title">Skill Paths</h2></div><span className="paths-result-count">{skillPaths.length} paths</span></div>
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
