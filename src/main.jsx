import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import PathsView from './components/paths'
import LessonView from './components/lesson/LessonView'
import './styles.css'
import './tailwind.css'
import { ActionButton } from './components/ui/ActionButton'
import { Badge } from './components/ui/Badge'
import { BoltIcon, GemIcon } from './components/ui/icons'
import { currentPath, detailLevels } from './data/paths'

const week = ['Th', 'F', 'S', 'Su', 'M']

function getInitialTheme() {
  const stored = window.localStorage.getItem('devspace-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function App() {
  const [active, setActive] = useState('Home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const [notice, setNotice] = useState('')
  const [devyOpen, setDevyOpen] = useState(false)
  const [theme, setTheme] = useState(getInitialTheme)
  const [openLesson, setOpenLesson] = useState(null)
  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('devspace-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!menuOpen) return undefined

    const closeMenu = () => {
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !menuButtonRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2200)
  }

  const startMission = () => {
    const wasStarted = started
    setStarted(true)
    showNotice(wasStarted ? 'Mission ready to continue' : 'Mission started')
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    showNotice(`${nextTheme === 'light' ? 'Light' : 'Dark'} mode enabled`)
  }

  const streakDays = started ? 1 : 0
  const xp = started ? 10 : 0
  const xpGoal = 175

  const nextLesson = detailLevels.flatMap((level) => level.lessons).find((lesson) => lesson.state === 'current')
  const currentStepIndex = currentPath.cards.findIndex((card) => card.state === 'current')
  const currentRegionCard = currentPath.cards[currentStepIndex] ?? currentPath.cards[0]
  const completedRegions = currentPath.cards.filter((card) => card.state === 'completed').length
  const missionProgress = Math.round((completedRegions / currentPath.cards.length) * 100)

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setActive('Home')} aria-label="Devspace home">
          <img src="/assets/logo.svg" alt="Devspace" />
        </button>

        <nav className="top-nav" aria-label="Primary navigation">
          {['Home', 'Paths'].map((item) => (
            <button
              key={item}
              className={active === item ? 'nav-item active' : 'nav-item'}
              onClick={() => setActive(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="header-chips">
          <span className="header-chip">
            <BoltIcon className="header-chip-icon text-green-300!" />
            <span aria-hidden="true">{streakDays}</span>
            <span className="visually-hidden">{streakDays === 1 ? '1 day streak' : `${streakDays} day streak`}</span>
          </span>
          <span className="header-chip">
            <GemIcon className="header-chip-icon" />
            <span aria-hidden="true">{xp}</span>
            <span className="visually-hidden">{xp} XP</span>
          </span>
        </div>

        <button
          ref={menuButtonRef}
          className="menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close account menu' : 'Open account menu'}
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        {menuOpen && (
          <div className="menu-popover" ref={menuRef} role="menu">
            <button className="menu-action" role="menuitem" onClick={() => showNotice('Settings are coming soon')}>Settings</button>
            <button className="menu-action" role="menuitem" onClick={() => showNotice('Signed in as learner')}>Account</button>
            <button className="menu-action" role="menuitem" onClick={toggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button>
          </div>
        )}
      </header>

      <main className={active === 'Paths' ? 'paths-page' : 'content'}>
        {active === 'Paths' ? <PathsView onNotice={showNotice} onOpenLesson={setOpenLesson} /> : (
          <>
        <aside className="support-rail" aria-label="Learner support">
          <section className="panel utility-card streak-card">
            <div className="streak-header">
              <div className="streak-summary">
                <span className="streak-number">{streakDays}</span>
                <BoltIcon className="streak-symbol" />
              </div>
              <button className="utility-control" onClick={() => showNotice(`${xp} of ${xpGoal} XP earned`)} aria-label="View streak details">•••</button>
            </div>
            <p>Solve <strong>3 problems</strong> to start a streak</p>
            <div className="week-row" role="img" aria-label="Weekly streak activity">
              {week.map((day, index) => (
                <div className={index === 0 ? 'day active-day' : 'day'} key={day}>
                  <span className="day-dot"><BoltIcon className="day-dot-icon" /></span>
                  <small>{day}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="panel premium-card">
            <div className="premium-heading">
              <span className="premium-graphic" aria-hidden="true">✦</span>
              <div>
                <strong>Unlock all learning</strong>
                <span>Get smarter, faster with Premium.</span>
              </div>
            </div>
            <ActionButton variant="premium" className="premium-button" onClick={() => showNotice('Premium trial selected')}>
              Explore Premium
            </ActionButton>
          </section>

          <section className="panel league-card">
            <div className="league-heading">
              <strong>Bronze league</strong>
              <span>3 days left to join</span>
            </div>
            <div className="flex w-full items-center justify-center py-8 bg-neutral-700/40 my-2 rounded-lg" aria-hidden="true">
              <img src="/assets/leagues-locked.svg" alt="" />
            </div>
            <p className="league-caption">Earn pixels to join this week's league</p>
          </section>

          <section className="panel devy-card" aria-labelledby="devy-title">
            <div className="devy-card-main">
              <div className="devy-copy">
                <span className="devy-label">DEVY</span>
                <h2 id="devy-title">Need a nudge?</h2>
                <p>Get one hint for your current mission.</p>
                <ActionButton
                  variant="neutral"
                  className="devy-button border! border-neutral-400"
                  onClick={() => setDevyOpen((open) => !open)}
                  aria-expanded={devyOpen}
                  aria-controls="devy-hint"
                >
                  {devyOpen ? 'Hide hint' : 'Ask Devy'}
                </ActionButton>
              </div>
              <img className="devy-image" src="/assets/devy.svg" alt="" />
            </div>

            {devyOpen && (
              <div className="devy-hint" id="devy-hint" role="status">
                <div>
                  <strong>Try this first</strong>
                  <p>Start by listing three AI/ML roles that interest you. You can refine them as you learn.</p>
                </div>
                <button className="devy-dismiss" onClick={() => setDevyOpen(false)}>Got it</button>
              </div>
            )}
          </section>

        </aside>

        <section className="mission-section">
          <h1>Your next mission</h1>

          <div className="mission-card-stack ">
            {/* <div className="mission-card-back" aria-hidden="true" /> */}
            <article className="mission-card bg-[#1C1C21]! border border-[#3C3D3F]">
              <div className="mission-copy">
                <Badge>{currentPath.level}</Badge>
                <h2>{currentPath.title}</h2>
                <p className="mission-meta">{currentRegionCard.title} · {missionProgress}% complete</p>
              </div>

              <div className="mission-object">
                <div className="object-tile">
                  <div className="object-glow" />
                  <img src={currentPath.emblem} alt="A colorful symbolic illustration for the current path" />
                </div>
              </div>

              <div className="mission-bottom">
                <div className="progress-dots" role="img" aria-label={`Step ${currentStepIndex + 1} of ${currentPath.cards.length}`}>
                  {currentPath.cards.map((card, index) => <span className={index === currentStepIndex ? 'progress-dot active' : 'progress-dot'} key={card.id} />)}
                </div>
                <p className="mission-step"><strong>Step {currentStepIndex + 1} of {currentPath.cards.length}</strong> · {nextLesson?.title}</p>
                <ActionButton variant="primary" className="mission-button" onClick={startMission}>
                  {started ? 'Continue mission' : 'Start mission'} <span aria-hidden="true">→</span>
                </ActionButton>
              </div>
            </article>
          </div>
        </section>
          </>
        )}
      </main>

      {notice && <div className="toast" role="status">{notice}</div>}

      {openLesson && <LessonView navigationStyle="segments" onExit={() => setOpenLesson(null)} />}
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
