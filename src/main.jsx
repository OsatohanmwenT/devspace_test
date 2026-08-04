import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import PathsView from './components/paths'
import LeaderboardView from './components/leaderboard'
import PracticeView from './components/practice'
import { PracticeSession } from './components/practice/PracticeSession'
import LessonView from './components/lesson/LessonView'
import './styles.css'
import './tailwind.css'
import { ActionButton } from './components/ui/ActionButton'
import { Badge } from './components/ui/Badge'
import { BoltIcon, GemIcon } from './components/ui/icons'
import { StreakPopover } from './components/header/StreakPopover'
import { XpPopover } from './components/header/XpPopover'
import { currentPath, detailLevels } from './data/paths'
import { loadProgress, saveProgress } from './data/progress'
import { getLeague } from './data/leagues'
import { resolveWeek } from './lib/leagueSim'
import { formatTimeRemaining, getTimeRemaining, getWeekIndex, now } from './lib/week'
import { TierMedal } from './components/leaderboard/TierMedal'

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
  const [openPractice, setOpenPractice] = useState(null)
  const [activePopover, setActivePopover] = useState(null)
  const [progress, setProgress] = useState(loadProgress)
  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)
  const streakButtonRef = useRef(null)
  const xpButtonRef = useRef(null)
  const popoverRef = useRef(null)

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

  useEffect(() => {
    if (!activePopover) return undefined

    const triggerRef = activePopover === 'streak' ? streakButtonRef : xpButtonRef

    const handlePointerDown = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target) && !triggerRef.current?.contains(event.target)) {
        setActivePopover(null)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActivePopover(null)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activePopover])

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2200)
  }

  // Settle any finished week before the leaderboard renders, so promotion and
  // demotion have already been applied by first paint.
  useEffect(() => {
    setProgress((current) => {
      const result = resolveWeek(current, now())
      if (!result) return current
      const next = {
        ...current,
        weekIndex: getWeekIndex(now()),
        weeklyXp: 0,
        leagueIndex: result.nextLeagueIndex,
        lastLeagueResult: result,
      }
      saveProgress(next)
      return next
    })
  }, [])

  const recordActivity = (xpGain) => {
    setProgress((current) => {
      const today = new Date().toDateString()
      const next = {
        ...current,
        xp: current.xp + xpGain,
        weeklyXp: current.weeklyXp + xpGain,
        streakDays: current.lastActiveDate === today ? current.streakDays : current.streakDays + 1,
        lastActiveDate: today,
      }
      saveProgress(next)
      return next
    })
  }

  const recordPracticeCompletion = (sessionId, correctCount, total) => {
    setProgress((current) => {
      const today = new Date().toDateString()
      // Only the first check of a session earns XP; retries still update the score.
      const isFirstAttempt = !current.completedSessions?.[sessionId]
      const next = {
        ...current,
        xp: current.xp + (isFirstAttempt ? 10 : 0),
        weeklyXp: current.weeklyXp + (isFirstAttempt ? 10 : 0),
        streakDays: current.lastActiveDate === today ? current.streakDays : current.streakDays + 1,
        lastActiveDate: today,
        completedSessions: {
          ...current.completedSessions,
          [sessionId]: { correctCount, total, completedAt: today },
        },
      }
      saveProgress(next)
      return next
    })
  }

  const dismissLeagueResult = () => {
    setProgress((current) => {
      const next = { ...current, lastLeagueResult: null }
      saveProgress(next)
      return next
    })
  }

  const startMission = () => {
    const wasStarted = started
    setStarted(true)
    setOpenLesson(nextLesson?.id ?? true)
    if (!wasStarted) recordActivity(10)
    showNotice(wasStarted ? 'Mission ready to continue' : 'Mission started')
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    showNotice(`${nextTheme === 'light' ? 'Light' : 'Dark'} mode enabled`)
  }

  const { xp, weeklyXp, streakDays, leagueIndex, lastLeagueResult, completedSessions } = progress
  const currentLeague = getLeague(leagueIndex)
  const xpGoal = 175

  const nextLesson = detailLevels.flatMap((level) => level.lessons).find((lesson) => lesson.state === 'current')
  const currentStepIndex = currentPath.cards.findIndex((card) => card.state === 'current')
  const currentRegionCard = currentPath.cards[currentStepIndex] ?? currentPath.cards[0]
  const completedRegions = currentPath.cards.filter((card) => card.state === 'completed').length
  const missionProgress = Math.round((completedRegions / currentPath.cards.length) * 100)

  return (
    <div className="min-h-screen bg-[#121214] font-['DM_Sans',Arial,sans-serif] [[data-theme=light]_&]:bg-[#fafaf8]">
      <header className="relative flex items-center w-full h-16 px-[max(22px,calc((100vw-1160px)/2))] max-[680px]:px-[18px] border-b border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-transparent">
        <button
          className="flex items-center p-0 border-0 bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72]"
          onClick={() => setActive('Home')}
          aria-label="Devspace home"
        >
          <img className="block w-[129px] h-[19px] [[data-theme=light]_&]:brightness-0" src="/assets/logo.svg" alt="Devspace" />
        </button>

        <nav className="flex gap-6 ml-12 mr-auto max-[680px]:hidden" aria-label="Primary navigation">
          {['Home', 'Paths', 'Leaderboard', 'Practice'].map((item) => {
            const isActive = active === item
            return (
              <button
                key={item}
                className={
                  isActive
                    ? "relative h-16 px-0.5 border-0 bg-transparent text-sm font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#6f66ec] focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72]"
                    : "relative h-16 px-0.5 border-0 bg-transparent text-sm font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-[#202020] after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72]"
                }
                onClick={() => setActive(item)}
              >
                {item}
              </button>
            )
          })}
        </nav>

        <div className="flex gap-2 ml-3">
          <div className="relative">
            <button
              ref={streakButtonRef}
              type="button"
              className={`inline-flex items-center gap-[5px] h-[34px] border rounded-full bg-[#262626] [[data-theme=light]_&]:bg-white px-3 text-[13px] font-medium cursor-pointer font-[inherit] hover:border-[#9a9a9d] [[data-theme=light]_&]:hover:border-[#686968] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72] ${activePopover === 'streak' ? 'border-[#6f66ec] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]' : 'border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'}`}
              onClick={() => setActivePopover((current) => (current === 'streak' ? null : 'streak'))}
              aria-haspopup="dialog"
              aria-expanded={activePopover === 'streak'}
            >
              <BoltIcon className="w-3.5 h-3.5 text-yellow-300!" />
              <span aria-hidden="true">{streakDays}</span>
              <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">{streakDays === 1 ? '1 day streak' : `${streakDays} day streak`}</span>
            </button>
            {activePopover === 'streak' && (
              <div ref={popoverRef}>
                <StreakPopover currentStreak={streakDays} bestStreak={streakDays} />
              </div>
            )}
          </div>

          <div className="relative">
            <button
              ref={xpButtonRef}
              type="button"
              className={`inline-flex items-center gap-[5px] h-[34px] border rounded-full bg-[#262626] [[data-theme=light]_&]:bg-white px-3 text-[13px] font-medium cursor-pointer font-[inherit] hover:border-[#9a9a9d] [[data-theme=light]_&]:hover:border-[#686968] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72] ${activePopover === 'xp' ? 'border-[#6f66ec] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]' : 'border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'}`}
              onClick={() => setActivePopover((current) => (current === 'xp' ? null : 'xp'))}
              aria-haspopup="dialog"
              aria-expanded={activePopover === 'xp'}
            >
              <GemIcon className="w-3.5 h-3.5 text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]" />
              <span aria-hidden="true">{xp}</span>
              <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">{xp} XP</span>
            </button>
            {activePopover === 'xp' && (
              <div ref={popoverRef}>
                <XpPopover earnedToday={xp} />
              </div>
            )}
          </div>
        </div>

        <button
          ref={menuButtonRef}
          className="min-w-11 min-h-11 max-[680px]:ml-auto p-2 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[21px] border-0 bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72]"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close account menu' : 'Open account menu'}
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        {menuOpen && (
          <div
            className="absolute z-[5] top-14 right-[max(22px,calc((100vw-1160px)/2))] max-[680px]:right-[18px] grid gap-[3px] min-w-[190px] p-2 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-white"
            ref={menuRef}
            role="menu"
          >
            <button className="border-0 rounded-lg bg-transparent p-2.5 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-left hover:bg-[#272634] [[data-theme=light]_&]:hover:bg-[#f1f0fd]" role="menuitem" onClick={() => showNotice('Settings are coming soon')}>Settings</button>
            <button className="border-0 rounded-lg bg-transparent p-2.5 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-left hover:bg-[#272634] [[data-theme=light]_&]:hover:bg-[#f1f0fd]" role="menuitem" onClick={() => showNotice('Signed in as learner')}>Account</button>
            <button className="border-0 rounded-lg bg-transparent p-2.5 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-left hover:bg-[#272634] [[data-theme=light]_&]:hover:bg-[#f1f0fd]" role="menuitem" onClick={toggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button>
          </div>
        )}
      </header>

      <main className={active === 'Paths' || active === 'Leaderboard' || active === 'Practice' ? 'w-[min(100%,1160px)] mx-auto pt-8 px-[22px] max-[900px]:px-[18px] pb-[72px] max-[680px]:pt-6 max-[680px]:px-[18px] max-[680px]:pb-14' : 'grid grid-cols-[300px_minmax(0,1fr)] max-[900px]:grid-cols-[260px_minmax(0,1fr)] gap-[22px] max-[900px]:gap-[18px] w-[min(100%,1160px)] mx-auto pt-6 px-[22px] max-[900px]:px-[18px] pb-[72px] max-[680px]:flex max-[680px]:flex-col max-[680px]:gap-7 max-[680px]:pt-6 max-[680px]:px-[18px] max-[680px]:pb-14'}>
        {active === 'Paths' ? <PathsView onNotice={showNotice} onOpenLesson={setOpenLesson} /> : active === 'Leaderboard' ? (
          <LeaderboardView
            weeklyXp={weeklyXp}
            xp={xp}
            leagueIndex={leagueIndex}
            lastLeagueResult={lastLeagueResult}
            onDismissResult={dismissLeagueResult}
            onStartPractice={() => setActive('Practice')}
          />
        ) : active === 'Practice' ? <PracticeView onStart={setOpenPractice} completedSessions={completedSessions} /> : (
          <>
        <aside className="flex flex-col gap-[18px] max-[680px]:order-2" aria-label="Learner support">
          <section className="border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-2xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-white p-[22px]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Space_Grotesk',Arial,sans-serif] text-[38px] font-medium">{streakDays}</span>
                <BoltIcon className="w-[34px] h-[34px] p-2 rounded-full bg-[#262626] [[data-theme=light]_&]:bg-white text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]" />
              </div>
              <button className="min-w-9 min-h-8 p-1 text-[#7d7d80] [[data-theme=light]_&]:text-[#737371] tracking-[2px] border-0 bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72]" onClick={() => showNotice(`${xp} of ${xpGoal} XP earned`)} aria-label="View streak details">•••</button>
            </div>
            <p className="mt-3.5 mb-4 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">Solve <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-medium">3 problems</strong> to start a streak</p>
            <div className="flex justify-between gap-2" role="img" aria-label="Weekly streak activity">
              {week.map((day, index) => {
                const isActive = index === 0
                return (
                  <div
                    className={
                      isActive
                        ? 'flex flex-1 flex-col items-center gap-[5px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
                        : 'flex flex-1 flex-col items-center gap-[5px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'
                    }
                    key={day}
                  >
                    <span
                      className={
                        isActive
                          ? 'grid place-items-center w-10 h-10 rounded-full border border-[#888df2] bg-[#1e193d] [[data-theme=light]_&]:bg-[#c8c3e7] text-[#c4d8f2]'
                          : 'grid place-items-center w-10 h-10 rounded-full border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'
                      }
                    >
                      <BoltIcon className="w-[18px] h-[18px]" />
                    </span>
                    <small>{day}</small>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl p-[22px] bg-[#211a2b] [[data-theme=light]_&]:bg-[#f6eef7] border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb]">
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="text-[#f0c964] text-[21px]" aria-hidden="true">✦</span>
              <div className="grid gap-1">
                <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-[15px] font-medium">Unlock all learning</strong>
                <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">Get smarter, faster with Premium.</span>
              </div>
            </div>
            <ActionButton variant="premium" className="w-full min-h-[52px] text-[15px] font-medium" onClick={() => showNotice('Premium trial selected')}>
              Explore Premium
            </ActionButton>
          </section>

          <section className="border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-2xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-white p-[22px] text-center">
            <div className="grid gap-0.5 mb-3.5 text-left">
              <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-[15px] font-semibold">{currentLeague.name}</strong>
              <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">{formatTimeRemaining(getTimeRemaining(now()))}</span>
            </div>
            <div className="flex w-full items-center justify-center py-8 bg-neutral-700/40 my-2 rounded-lg" aria-hidden="true">
              <TierMedal league={currentLeague} state="current" />
            </div>
            <p className="m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px] leading-[1.4]">
              {weeklyXp > 0 ? `${weeklyXp.toLocaleString()} px earned this week` : "Earn pixels to join this week's league"}
            </p>
            <ActionButton variant="neutral" className="w-full min-h-9 mt-3 px-3.5 text-xs font-medium" onClick={() => setActive('Leaderboard')}>
              View leaderboard
            </ActionButton>
          </section>

        </aside>

        <section className="min-w-0 max-[680px]:order-1">
          {/* <h1 className="m-0 mb-4 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Space_Grotesk',Arial,sans-serif] text-[30px] max-[680px]:text-[27px] font-medium tracking-[-.04em]">Your next mission</h1> */}

          <div className="relative w-full pt-2.5 pl-2.5 max-[680px]:pt-2 max-[680px]:pl-0">
            <article className="relative z-[1] flex w-full min-h-[530px] max-[680px]:min-h-0 flex-col items-center gap-[18px] p-7 max-[900px]:p-[22px] max-[680px]:pt-[22px] max-[680px]:px-[18px] max-[680px]:pb-5 overflow-hidden rounded-2xl text-center bg-[#1f1f1f]! [[data-theme=light]_&]:bg-white! border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb]">
              <div className="w-full pt-1 text-center">
                <Badge className="bg-neutral-700 text-neutral-100">{currentPath.level}</Badge>
                <h2 className="max-w-[520px] mx-auto mt-3.5 mb-1.5 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Space_Grotesk',Arial,sans-serif] text-[clamp(28px,4vw,42px)] max-[900px]:text-[clamp(30px,4.5vw,40px)] max-[680px]:text-[clamp(32px,10vw,42px)] font-medium leading-[1.04] tracking-[-.06em] [overflow-wrap:anywhere] text-balance">{currentPath.title}</h2>
                <p className="m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs max-[680px]:leading-[1.5] font-medium tracking-[.04em]">{currentRegionCard.title} · {missionProgress}% complete</p>
              </div>

              <div className="relative w-[220px] h-[220px] max-[900px]:w-[190px] max-[900px]:h-[190px] max-[680px]:w-[170px] max-[680px]:h-[170px] max-[680px]:mx-auto flex-none">
                <div className="relative grid place-items-center w-[220px] h-[220px] max-[900px]:w-[190px] max-[900px]:h-[190px] max-[680px]:w-[170px] max-[680px]:h-[170px] overflow-visible">
                  <div className="absolute z-0 right-[14%] bottom-[-2%] left-[14%] h-[28%] rounded-full bg-[#525252] blur-[18px] opacity-25" />
                  <img className="relative z-[1] block w-full h-full object-contain" src={currentPath.emblem} alt="A colorful symbolic illustration for the current path" />
                </div>
              </div>

              <div className="w-full mt-auto">
                <div className="flex items-center justify-center gap-1.5 mb-[9px]" role="img" aria-label={`Step ${currentStepIndex + 1} of ${currentPath.cards.length}`}>
                  {currentPath.cards.map((card, index) => (
                    <span className={`w-2 h-2 rounded-full ${index === currentStepIndex ? 'bg-[#d4d4d4]' : 'bg-[#404040] [[data-theme=light]_&]:bg-[#eeeeeb]'}`} key={card.id} />
                  ))}
                </div>
                <p className="max-w-full m-0 mb-[18px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs leading-[1.5] text-center"><strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-medium">Step {currentStepIndex + 1} of {currentPath.cards.length}</strong> · {nextLesson?.title}</p>
                <ActionButton variant="primary" className="w-full min-h-[52px] text-[15px] font-medium" onClick={startMission}>
                  {started ? 'Continue mission' : 'Start mission'} <span aria-hidden="true">→</span>
                </ActionButton>
              </div>
            </article>
          </div>
        </section>
          </>
        )}
      </main>

      {active === 'Home' && (
        <div className="fixed right-6 bottom-6 z-20 grid justify-items-end gap-3 max-[680px]:right-[18px] max-[680px]:bottom-[18px]">
          {devyOpen && (
            <section id="devy-hint" className="w-[min(320px,calc(100vw-36px))] rounded-2xl border border-[#404040] bg-[#1f1f1f] p-4 shadow-[0_12px_30px_rgba(0,0,0,.24)] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white" role="status" aria-label="Devy hint">
              <div className="flex items-start gap-3">
                <img className="size-12 flex-none object-contain" src="/assets/devy.svg" alt="" />
                <div>
                  <strong className="text-sm font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">Try this first</strong>
                  <p className="mt-1 text-xs leading-[1.45] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Start by listing three AI/ML roles that interest you. You can refine them as you learn.</p>
                </div>
              </div>
            </section>
          )}
          <button type="button" className="grid size-16 place-items-center rounded-full border border-[#525252] bg-[#303030] p-2 shadow-[0_4px_0_#171717] transition-[background,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#404040] active:translate-y-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 [[data-theme=light]_&]:border-[#b8b8b8] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_4px_0_#d4d4d4] [[data-theme=light]_&]:hover:bg-[#f5f5f4]" onClick={() => setDevyOpen((open) => !open)} aria-expanded={devyOpen} aria-controls="devy-hint" aria-label={devyOpen ? 'Close Devy hint' : 'Ask Devy'}>
            <img className="size-full object-contain" src="/assets/devy.svg" alt="" />
          </button>
        </div>
      )}

      {notice && <div className="fixed z-10 right-6 bottom-6 max-[680px]:right-[18px] max-[680px]:bottom-[18px] max-[680px]:left-[18px] max-[680px]:text-center px-4 py-3 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-[10px] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-[13px]" role="status">{notice}</div>}

      {openLesson && <LessonView key={String(openLesson)} lessonId={openLesson} navigationStyle="segments" onExit={() => setOpenLesson(null)} />}
      {openPractice && <PracticeSession sessionId={openPractice} onExit={() => setOpenPractice(null)} onComplete={recordPracticeCompletion} />}
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
