import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import PathsView from './components/PathsView'
import './styles.css'
import './tailwind.css'
import { ActionButton } from './components/ui/ActionButton'
import { Badge } from './components/ui/Badge'

const mission = {
  title: 'Build your AI/ML career map',
  meta: 'Region 0 · Mission 1 · About 15 min',
  step: 'Understand AI, ML and Data Science',
  image: '/assets/hero-illustration.svg',
}

const week = ['Th', 'F', 'S', 'Su', 'M']

function App() {
  const [active, setActive] = useState('Home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const [notice, setNotice] = useState('')
  const [devyOpen, setDevyOpen] = useState(false)
  const [theme, setTheme] = useState(() => window.localStorage.getItem('devspace-theme') === 'light' ? 'light' : 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('devspace-theme', theme)
  }, [theme])

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2200)
  }

  const startMission = () => {
    setStarted(true)
    showNotice(started ? 'Mission ready to continue' : 'Mission started')
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    showNotice(`${nextTheme === 'light' ? 'Light' : 'Dark'} mode enabled`)
  }

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

        <button
          className="menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open account menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        {menuOpen && (
          <div className="menu-popover">
            <button className="menu-action" onClick={() => showNotice('Settings are coming soon')}>Settings</button>
            <button className="menu-action" onClick={() => showNotice('Signed in as learner')}>Account</button>
            <button className="menu-action" onClick={toggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button>
          </div>
        )}
      </header>

      <main className={active === 'Paths' ? 'paths-page' : 'content'}>
        {active === 'Paths' ? <PathsView onNotice={showNotice} /> : (
          <>
        <aside className="support-rail" aria-label="Learner support">
          <section className="panel utility-card streak-card">
            <div className="streak-header">
              <div className="streak-summary">
                <span className="streak-number">0</span>
                <span className="streak-symbol" aria-hidden="true">◒</span>
              </div>
              <button className="utility-control" onClick={() => showNotice('Streak details')} aria-label="View streak details">•••</button>
            </div>
            <p>Solve <strong>3 problems</strong> to start a streak</p>
            <div className="week-row" aria-label="Weekly streak activity">
              {week.map((day, index) => (
                <div className={index === 0 ? 'day active-day' : 'day'} key={day}>
                  <span className="day-dot">{index === 0 ? '✓' : '·'}</span>
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
            <div className="league-title">
              <span className="league-icon" aria-hidden="true">
                <img src="/assets/leagues-locked.svg" alt="" />
              </span>
              <span className="card-label">UNLOCK LEAGUES</span>
            </div>
            <div className="league-progress"><span>0 of 175 XP</span><span>0%</span></div>
            <div className="progress-track"><span /></div>
          </section>

          <section className="panel devy-card" aria-labelledby="devy-title">
            <div className="devy-card-main">
              <div className="devy-copy">
                <span className="devy-label">DEVY</span>
                <h2 id="devy-title">Need a nudge?</h2>
                <p>Get one hint for your current mission.</p>
                <ActionButton
                  variant="neutral"
                  className="devy-button"
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

          <div className="mission-card-stack">
            <div className="mission-card-back" aria-hidden="true" />
            <article className="mission-card">
              <div className="mission-copy">
                <Badge>Current mission</Badge>
                <h2>{mission.title}</h2>
                <p className="mission-meta">{mission.meta}</p>
              </div>

              <div className="mission-object" aria-label="Mission illustration">
                <div className="object-tile">
                  <div className="object-glow" />
                  <img src={mission.image} alt="A colorful symbolic illustration for the current mission" />
                </div>
              </div>

              <div className="mission-bottom">
                <div className="progress-dots" aria-label="Step 1 of 5">
                  {Array.from({ length: 5 }, (_, index) => <span className={index === 0 ? 'progress-dot active' : 'progress-dot'} key={index} />)}
                </div>
                <p className="mission-step"><strong>Step 1 of 5</strong> · {mission.step}</p>
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
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
