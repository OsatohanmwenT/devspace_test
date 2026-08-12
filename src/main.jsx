import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import PathsView from './components/paths'
import LeaderboardView from './components/leaderboard'
import PracticeView from './components/practice'
import SettingsView from './components/settings'
import ProfileView from './components/profile'
import PlansView from './components/plans'
import { PracticeSession } from './components/practice/PracticeSession'
import LessonView from './components/lesson/LessonView'
import { LessonLoading } from './components/lesson/LessonLoading'
import './styles.css'
import './tailwind.css'
import { ActionButton } from './components/ui/ActionButton'
import { Badge } from './components/ui/Badge'
import { BoltIcon, GemIcon, SirenIcon } from './components/ui/icons'
import { StreakJourneyModal } from './components/header/StreakJourneyModal'
import { XpPopover } from './components/header/XpPopover'
import OnboardingView from './components/onboarding'
import { FirstLessonWelcome } from './components/onboarding/FirstLessonWelcome'
import { computeDailyGoal } from './lib/onboarding'
import { getPath } from './data/paths'
import { getLesson } from './components/lesson/lessonContent'
import { activatePremium, applyActivity, deactivatePremium, loadProgress, saveProgress } from './data/progress'
import { can, CAPABILITIES } from './lib/entitlements'
import { getLeague } from './data/leagues'
import { resolveWeek } from './lib/leagueSim'
import { formatTimeRemaining, getTimeRemaining, getWeekIndex, now } from './lib/week'
import { TierMedal } from './components/leaderboard/TierMedal'
import { derivePathProgress } from './lib/pathProgress'
import { getStreakWeek, getStreakMessage, isActiveToday, WEEK_LENGTH } from './lib/streak'
import { LESSON_XP } from './lib/lessonMeta'
import { practiceSessions } from './data/practice'
import { ShortSessionRow } from './components/home/ShortSessionRow'
import { InfoTooltip } from './components/ui/InfoTooltip'
import BuildView from './components/build'
import { Gear, Hammer, House, List, Moon, Path, Target, Trophy, UserCircle } from '@phosphor-icons/react'

// Practice awards a flat rate on first completion, mirroring LESSON_XP.
const PRACTICE_XP = 10

const PRIMARY_DESTINATIONS = [
  { label: 'Home', icon: House },
  { label: 'Paths', icon: Path },
  { label: 'Practice', icon: Target },
  { label: 'Build', icon: Hammer },
]

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
  const [loadingLesson, setLoadingLesson] = useState(null)
  const [showFirstLessonWelcome, setShowFirstLessonWelcome] = useState(false)
  const [openPractice, setOpenPractice] = useState(null)
  const [activePopover, setActivePopover] = useState(null)
  const [streakJourneyOpen, setStreakJourneyOpen] = useState(false)
  const [progress, setProgress] = useState(loadProgress)
  const [plansHighlight, setPlansHighlight] = useState(null)
  // Progress lives in localStorage and resolves instantly, but the profile is
  // the one page whose data would come from a server in a real deployment.
  // Standing the fetch up now means the skeleton is a real state the page
  // passes through, rather than a component nothing ever renders.
  const [profileLoading, setProfileLoading] = useState(false)
  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)
  const streakButtonRef = useRef(null)
  const xpButtonRef = useRef(null)
  const popoverRef = useRef(null)
  const lessonLaunchTimerRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('devspace-theme', theme)
  }, [theme])

  useEffect(() => () => {
    if (lessonLaunchTimerRef.current) window.clearTimeout(lessonLaunchTimerRef.current)
  }, [])

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

    const triggerRef = xpButtonRef

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

  // Opening the profile stands the record up from storage. The delay is short
  // enough not to be in the way and long enough that the skeleton is seen —
  // cleared on unmount so navigating away mid-load cannot set state late.
  useEffect(() => {
    if (active !== 'Profile') return undefined

    setProfileLoading(true)
    const timer = window.setTimeout(() => setProfileLoading(false), 650)
    return () => {
      window.clearTimeout(timer)
      setProfileLoading(false)
    }
  }, [active])

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
      const next = applyActivity(current, xpGain)
      saveProgress(next)
      return next
    })
  }

  const recordPracticeCompletion = (sessionId, correctCount, total) => {
    setProgress((current) => {
      const today = new Date().toDateString()
      const priorCompletion = current.completedSessions?.[sessionId]
      // Free learners only earn XP the first time. Premium also earns it on a
      // replay, but only once per day — completedAt is overwritten every time,
      // so a same-day retry can never be double-counted.
      const isFirstAttempt = !priorCompletion
      const isFreshPremiumReplay = Boolean(priorCompletion) && priorCompletion.completedAt !== today
        && can(current, CAPABILITIES.REPLAY_XP)
      const earnsXp = isFirstAttempt || isFreshPremiumReplay

      const next = {
        ...applyActivity(current, earnsXp ? PRACTICE_XP : 0, today),
        completedSessions: {
          ...current.completedSessions,
          [sessionId]: { correctCount, total, completedAt: today },
        },
      }
      saveProgress(next)
      return next
    })
  }

  const recordLessonCompletion = (completedLessonId) => {
    setProgress((current) => {
      const today = new Date().toDateString()
      // First completion earns XP; replays still update the record.
      const isFirstCompletion = !current.completedLessons?.[completedLessonId]
      const next = {
        ...applyActivity(current, isFirstCompletion ? LESSON_XP : 0, today),
        completedLessons: { ...current.completedLessons, [completedLessonId]: { completedAt: today } },
      }
      saveProgress(next)
      return next
    })
    showNotice(`Lesson complete · +${LESSON_XP} XP`)
  }

  const dismissLeagueResult = () => {
    setProgress((current) => {
      const next = { ...current, lastLeagueResult: null }
      saveProgress(next)
      return next
    })
  }

  const startPremium = (planId) => {
    setProgress((current) => {
      const next = activatePremium(current, planId)
      saveProgress(next)
      return next
    })
    showNotice('Premium active')
  }

  const endPremium = () => {
    setProgress((current) => {
      const next = deactivatePremium(current)
      saveProgress(next)
      return next
    })
    showNotice('Premium turned off')
  }

  const openPlans = (perkId = null) => {
    setPlansHighlight(perkId)
    setActive('Plans')
  }

  // The learner's own words and links, layered onto the onboarding-derived
  // profile — everything else on the CV comes from real progress records,
  // but name, headline, bio, links, and works are theirs to say.
  const saveProfileFields = (fields) => {
    setProgress((current) => {
      const next = { ...current, profile: { ...current.profile, ...fields } }
      saveProgress(next)
      return next
    })
    showNotice('Profile updated')
  }

  const completeOnboarding = (nextProfile) => {
    setProgress((current) => {
      const next = { ...current, profile: nextProfile }
      saveProgress(next)
      return next
    })
    setShowFirstLessonWelcome(true)
  }

  const launchLesson = (lessonId) => {
    if (loadingLesson || lessonLaunchTimerRef.current) return

    setLoadingLesson(lessonId)
    lessonLaunchTimerRef.current = window.setTimeout(() => {
      setOpenLesson(lessonId)
      setLoadingLesson(null)
      lessonLaunchTimerRef.current = null
    }, 3000)
  }

  const startMission = () => {
    const wasStarted = started
    setStarted(true)
    setShowFirstLessonWelcome(false)
    launchLesson(nextLesson?.id ?? true)
    if (!wasStarted) recordActivity(10)
    showNotice(wasStarted ? 'Mission ready to continue' : 'Mission started')
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    showNotice(`${nextTheme === 'light' ? 'Light' : 'Dark'} mode enabled`)
  }

  const { xp, weeklyXp, streakDays, leagueIndex, lastLeagueResult, completedSessions, completedLessons, lastActiveDate, longestStreak, streakRestoreCredits, streakActivityDates, earnedStreakMilestones, lastStreakProtection, profile } = progress
  // Onboarding picks the path; before that, the default shelf is the spine.
  const currentPath = getPath(profile?.pathId)
  const currentLeague = getLeague(leagueIndex)
  const xpGoal = computeDailyGoal(profile?.dailyMinutes)

  // Percentages and the "next up" pointer come from what the learner has
  // actually completed, rather than the authored literals in data/paths.js
  // which never moved.
  const derived = useMemo(() => derivePathProgress(currentPath, completedLessons), [currentPath, completedLessons])
  const nextLesson = derived.currentLesson
  const currentStepIndex = derived.currentRegionIndex
  const currentRegionCard = derived.currentRegion ?? derived.regions[0]
  const streakWeek = getStreakWeek(streakDays, lastActiveDate)
  const activeToday = isActiveToday(lastActiveDate)
  const streakAtRisk = streakDays > 0 && !activeToday
  const streakMessage = getStreakMessage(streakDays, activeToday)

  // Two or three unfinished sessions for the row under the mission card.
  const homePracticeSessions = useMemo(() => {
    const unfinished = practiceSessions.filter((session) => !completedSessions[session.id])
    return (unfinished.length > 0 ? unfinished : practiceSessions).slice(0, 3)
  }, [completedSessions])
  // Reflects what the learner actually onboarded as, rather than ML for everyone.
  const homeHint = nextLesson
    ? `Next up on ${currentPath.title} is ${nextLesson.title}. ${weeklyXp > 0 ? 'You’ve already earned XP this week — keep the streak going.' : 'A single lesson is enough to join this week’s league.'}`
    : `You’re set up on ${currentPath.title}. Open Paths to pick where to go next.`

  if (!profile) return <OnboardingView onComplete={completeOnboarding} />
  if (showFirstLessonWelcome) return <FirstLessonWelcome path={currentPath} lesson={nextLesson} onBegin={startMission} />
  if (loadingLesson) return <LessonLoading title={getLesson(loadingLesson)?.title ?? nextLesson?.title ?? 'Your lesson'} />

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      {active !== 'Plans' && !openLesson && (
      <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-[var(--border-hairline)] bg-[var(--surface-canvas)]/95 px-[max(var(--space-6),calc((100vw-1160px)/2))] backdrop-blur-md max-[680px]:px-4">
        <button
          className="flex min-h-11 items-center rounded-[var(--radius-control)] border-0 bg-transparent p-0"
          onClick={() => setActive('Home')}
          aria-label="Devspace home"
        >
          <img className="block w-[129px] h-[19px] [[data-theme=light]_&]:brightness-0" src="/assets/logo.svg" alt="Devspace" />
        </button>

        <nav className="ml-12 mr-auto flex items-center gap-2 max-[680px]:hidden" aria-label="Primary navigation">
          {PRIMARY_DESTINATIONS.map(({ label, icon: Icon }) => {
            const isActive = active === label
            return (
              <button
                key={label}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${isActive ? 'border-[var(--brand-cta)] bg-[var(--brand-cta)] text-[var(--text-inverse)]' : 'border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]'}`}
                onClick={() => setActive(label)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={19} weight="regular" aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="flex gap-2 ml-3">
          <div className="relative">
            <button
              ref={streakButtonRef}
              type="button"
              className={`relative inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-[var(--type-label)] font-semibold transition-colors ${streakAtRisk ? 'border-[var(--accent-error)] bg-[var(--surface-error-tint)] text-[var(--accent-error)]' : 'border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-primary)] hover:border-[var(--border-interactive)]'}`}
              onClick={() => {
                setActivePopover(null)
                setStreakJourneyOpen(true)
              }}
              aria-haspopup="dialog"
              aria-expanded={streakJourneyOpen}
              aria-controls="streak-journey-dialog"
              aria-label={streakAtRisk ? `Open streak journey. ${streakDays} day streak. Activity required today.` : activeToday ? `Open streak journey. ${streakDays} day streak. Today complete.` : 'Open streak journey and start your streak.'}
            >
              {streakAtRisk ? <SirenIcon className="size-4" /> : <BoltIcon className="size-4" />}
              <span aria-hidden="true">{streakDays}</span>
              {streakAtRisk && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[var(--surface-canvas)] bg-[var(--accent-error)] motion-safe:animate-pulse" aria-hidden="true" />}
            </button>
          </div>

          <div className="relative">
            <button
              ref={xpButtonRef}
              type="button"
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border bg-[var(--surface-default)] px-3 text-[var(--type-label)] font-semibold transition-colors ${activePopover === 'xp' ? 'border-[var(--brand-cta)] text-[var(--text-primary)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-interactive)] hover:text-[var(--text-primary)]'}`}
              onClick={() => setActivePopover((current) => (current === 'xp' ? null : 'xp'))}
              aria-haspopup="dialog"
              aria-expanded={activePopover === 'xp'}
            >
              <GemIcon className="size-4 text-[var(--brand-on-dark)] [[data-theme=light]_&]:text-[var(--brand-base)]" />
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
          className="ml-2 grid size-11 place-items-center rounded-[var(--radius-control)] border-0 bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] max-[680px]:ml-auto"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close account menu' : 'Open account menu'}
          aria-expanded={menuOpen}
        >
          <List size={24} weight="regular" aria-hidden="true" />
        </button>

        {menuOpen && (
          <div
            className="absolute right-[max(var(--space-6),calc((100vw-1160px)/2))] top-14 z-[5] grid min-w-56 gap-1 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--surface-overlay)] p-2 shadow-[var(--shadow-overlay)] max-[680px]:right-4"
            ref={menuRef}
            role="menu"
          >
            <button className="inline-flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] border-0 bg-transparent px-3 text-start text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]" role="menuitem" onClick={() => { setActive('Profile'); setMenuOpen(false) }}><UserCircle size={20} aria-hidden="true" />Profile</button>
            <button className="inline-flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] border-0 bg-transparent px-3 text-start text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]" role="menuitem" onClick={() => { setActive('Leaderboard'); setMenuOpen(false) }}><Trophy size={20} aria-hidden="true" />Leaderboard</button>
            <button className="inline-flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] border-0 bg-transparent px-3 text-start text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]" role="menuitem" onClick={() => { setActive('Settings'); setMenuOpen(false) }}><Gear size={20} aria-hidden="true" />Settings</button>
            <button className="inline-flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] border-0 bg-transparent px-3 text-start text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]" role="menuitem" onClick={toggleTheme}><Moon size={20} aria-hidden="true" />Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button>
          </div>
        )}
      </header>
      )}

      {active !== 'Plans' && !openLesson && (
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[var(--border-hairline)] bg-[var(--surface-overlay)] px-2 pb-[max(var(--space-2),env(safe-area-inset-bottom))] pt-2 shadow-[var(--shadow-overlay)] min-[681px]:hidden" aria-label="Mobile primary navigation">
          {PRIMARY_DESTINATIONS.map(({ label, icon: Icon }) => {
            const isActive = active === label
            return (
              <button
                key={label}
                type="button"
                className={`grid min-h-14 place-items-center gap-1 rounded-[var(--radius-control)] border-0 px-2 py-1 text-[var(--type-micro)] font-medium ${isActive ? 'bg-[var(--surface-brand-tint)] text-[var(--brand-on-dark)] [[data-theme=light]_&]:text-[var(--brand-base)]' : 'bg-transparent text-[var(--text-secondary)]'}`}
                onClick={() => setActive(label)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={22} weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>
      )}

      <main id="main-content" className={active === 'Plans' ? 'min-h-screen' : active === 'Home' ? 'page-container grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-[900px]:grid-cols-[minmax(0,1fr)_280px] max-[680px]:flex max-[680px]:flex-col' : 'page-container'}>
        {active === 'Paths' ? <PathsView currentLearnerPath={currentPath} completedLessons={completedLessons} onOpenLesson={launchLesson} /> : active === 'Settings' ? (
          <SettingsView theme={theme} onToggleTheme={toggleTheme} onNotice={showNotice} email="devspaceglobal@gmail.com" progress={progress} onOpenPlans={openPlans} />
        ) : active === 'Profile' ? (
          <ProfileView
            profile={profile}
            progress={progress}
            currentPath={currentPath}
            pathProgress={derived}
            onSaveProfile={saveProfileFields}
            onStartLearning={() => setActive('Paths')}
            isLoading={profileLoading}
          />
        ) : active === 'Plans' ? (
          <PlansView progress={progress} onActivate={startPremium} onCancel={endPremium} highlightPerk={plansHighlight} onBack={() => setActive('Home')} />
        ) : active === 'Build' ? (
          <BuildView onStartLearning={() => setActive('Paths')} />
        ) : active === 'Leaderboard' ? (
          <LeaderboardView
            weeklyXp={weeklyXp}
            xp={xp}
            leagueIndex={leagueIndex}
            lastLeagueResult={lastLeagueResult}
            progress={progress}
            onDismissResult={dismissLeagueResult}
            onStartPractice={() => setActive('Practice')}
            onOpenPlans={openPlans}
          />
        ) : active === 'Practice' ? <PracticeView onStart={setOpenPractice} completedSessions={completedSessions} /> : (
          <>
        <aside className="order-2" aria-label="Learner support">
          <div className="surface-card overflow-hidden">
          <section className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-[var(--font-display)] text-[var(--type-display)] font-medium text-[var(--text-primary)]">{streakDays}</span>
                <BoltIcon className="size-9 rounded-full bg-[var(--surface-progress-tint)] p-2 text-[var(--accent-progress)]" />
              </div>
              <button className="min-w-9 min-h-8 p-1 text-[var(--text-muted)] [[data-theme=light]_&]:text-[var(--text-secondary)] tracking-[2px] border-0 bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--border-focus)] [[data-theme=light]_&]:focus-visible:outline-[var(--brand-base)]" onClick={() => showNotice(`${xp} of ${xpGoal} XP earned`)} aria-label="View streak details">•••</button>
            </div>
            {/* Was the fixed string "Solve 3 problems to start a streak", which
                contradicted the streak count rendered directly above it. */}
            <p className="meta-copy mb-4 mt-3">
              {streakMessage.emphasis && <strong className="font-medium text-[var(--text-primary)]">{streakMessage.emphasis} </strong>}
              {streakMessage.text}
            </p>
            {/* Seven fixed 40px circles overflow the 300px sidebar, so they size
                themselves from the space available and cap at the original 40px. */}
            <div className="flex justify-between gap-1.5" role="img" aria-label={`Activity for the last ${WEEK_LENGTH} days: ${streakWeek.filter((day) => day.isActive).length} active`}>
              {streakWeek.map(({ key, label, isActive }) => (
                <div
                  className={
                    isActive
                      ? 'flex flex-1 min-w-0 flex-col items-center gap-[5px] font-medium text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]'
                      : 'flex flex-1 min-w-0 flex-col items-center gap-[5px] text-[var(--text-muted)] [[data-theme=light]_&]:text-[var(--text-secondary)]'
                  }
                  key={key}
                >
                  <span
                    className={
                      isActive
                        ? 'grid place-items-center w-full max-w-10 aspect-square rounded-full border border-[var(--accent-progress)] bg-[var(--accent-progress)] text-[var(--surface-canvas)]'
                        : 'grid place-items-center w-full max-w-10 aspect-square rounded-full border border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-hairline)] bg-[var(--surface-default)] [[data-theme=light]_&]:bg-white text-[var(--text-muted)] [[data-theme=light]_&]:text-[var(--text-secondary)]'
                    }
                  >
                    <BoltIcon className="w-[18px] h-[18px]" />
                  </span>
                  <small>{label}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-[var(--border-hairline)] p-6 text-center">
            <div className="flex items-start justify-between gap-2 mb-3.5 text-left">
              <div className="grid gap-0.5">
                <strong className="text-base font-semibold text-[var(--text-primary)]">{currentLeague.name}</strong>
              <span className="meta-copy">{formatTimeRemaining(getTimeRemaining(now()))}</span>
              </div>
              <InfoTooltip label="How leagues work" align="end">
                Earn XP this week to move up the leaderboard. Final standings update when the week ends.
              </InfoTooltip>
            </div>
            <div
              className="my-2 flex w-full items-center justify-center rounded-[var(--radius-control)] bg-[var(--surface-progress-tint)] py-8"
              aria-hidden="true"
            >
              <TierMedal league={currentLeague} state="current" size={64} />
            </div>
            <p className="meta-copy m-0">
              {weeklyXp > 0 ? `${weeklyXp.toLocaleString()} XP earned this week` : "Earn XP to join this week's league"}
            </p>
          </section>
          </div>

        </aside>

        <section className="order-1 min-w-0">
          <h1 className="page-title mb-6">Your next mission</h1>

          <div className="relative w-full pt-2.5 pl-2.5 max-[680px]:pt-2 max-[680px]:pl-0">
            <article className="surface-card relative z-[1] flex min-h-[530px] w-full flex-col items-center gap-6 overflow-hidden p-8 text-center max-[680px]:min-h-0 max-[680px]:p-6">
              <div className="w-full pt-1 text-center">
                <Badge tone="brand">{currentPath.level}</Badge>
                <h2 className="mx-auto mb-2 mt-4 max-w-[520px] text-balance font-[var(--font-display)] text-[clamp(31px,4vw,39px)] font-medium leading-[var(--leading-display)] text-[var(--text-primary)] [overflow-wrap:anywhere]">{currentPath.title}</h2>
                <p className="meta-copy m-0 font-medium">{currentRegionCard.title} · {currentRegionCard.percent}% complete</p>
              </div>

              <div className="relative w-[220px] h-[220px] max-[900px]:w-[190px] max-[900px]:h-[190px] max-[680px]:w-[170px] max-[680px]:h-[170px] max-[680px]:mx-auto flex-none">
                <div className="relative grid place-items-center w-[220px] h-[220px] max-[900px]:w-[190px] max-[900px]:h-[190px] max-[680px]:w-[170px] max-[680px]:h-[170px] overflow-visible">
                  <div className="absolute z-0 right-[14%] bottom-[-2%] left-[14%] h-[28%] rounded-full bg-[var(--border-interactive)] blur-[18px] opacity-25" />
                  <img className="relative z-[1] block w-full h-full object-contain" src={currentPath.emblem} alt="A colorful symbolic illustration for the current path" />
                </div>
              </div>

              <div className="w-full mt-auto">
                <div className="flex items-center justify-center gap-1.5 mb-[9px]" role="img" aria-label={`Region ${currentStepIndex + 1} of ${derived.regionsTotal}`}>
                  {derived.regions.map((region, index) => (
                    <span className={`w-2 h-2 rounded-full ${index === currentStepIndex ? 'bg-[var(--brand-on-dark)] [[data-theme=light]_&]:bg-[var(--brand-base)]' : 'bg-[var(--border-default)]'}`} key={region.id} />
                  ))}
                </div>
                {/* The dots count regions, so the label says so — "Step N of 6"
                    followed by a lesson title read as though the lesson were the step. */}
                <p className="max-w-full m-0 mb-[18px] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)] text-xs leading-[1.5] text-center"><strong className="text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] font-medium">Region {currentStepIndex + 1} of {derived.regionsTotal}</strong> · {nextLesson?.title}</p>
                <ActionButton variant="primary" className="w-full text-base" onClick={startMission}>
                  {started ? 'Continue mission' : 'Start mission'} <span aria-hidden="true">→</span>
                </ActionButton>
              </div>
            </article>
          </div>

          <ShortSessionRow
            sessions={homePracticeSessions}
            completedSessions={completedSessions}
            onStartPractice={setOpenPractice}
            onSeeAll={() => setActive('Practice')}
          />
        </section>
          </>
        )}
      </main>

      {active === 'Home' && (
        <div className="fixed bottom-6 right-6 z-20 grid justify-items-end gap-3 max-[680px]:bottom-[calc(84px+env(safe-area-inset-bottom))] max-[680px]:right-4">
          {devyOpen && (
            <section id="devy-hint" className="surface-card w-[min(320px,calc(100vw-32px))] p-4" role="status" aria-label="Devy hint">
              <div className="flex items-start gap-3">
                <img className="size-12 flex-none object-contain" src="/assets/devy.svg" alt="" />
                <div>
                  <strong className="text-sm font-semibold text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">Try this first</strong>
                  <p className="mt-1 text-xs leading-[1.45] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">{homeHint}</p>
                </div>
              </div>
            </section>
          )}
          <button type="button" className="grid size-16 place-items-center rounded-full border border-[var(--border-default)] bg-[var(--surface-default)] p-2 shadow-[var(--shadow-raised)] transition-transform hover:-translate-y-0.5 active:translate-y-0" onClick={() => setDevyOpen((open) => !open)} aria-expanded={devyOpen} aria-controls="devy-hint" aria-label={devyOpen ? 'Close Devy hint' : 'Ask Devy'}>
            <img className="size-full object-contain" src="/assets/devy.svg" alt="" />
          </button>
        </div>
      )}

      {streakJourneyOpen && (
        <StreakJourneyModal
          currentStreak={streakDays}
          longestStreak={longestStreak}
          activeDates={streakActivityDates}
          restoresLeft={streakRestoreCredits}
          earnedMilestones={earnedStreakMilestones}
          lastActiveDate={lastActiveDate}
          isActiveToday={activeToday}
          lastProtection={lastStreakProtection}
          onClose={() => {
            setStreakJourneyOpen(false)
            streakButtonRef.current?.focus()
          }}
        />
      )}

      {notice && <div className="fixed bottom-6 right-6 z-40 rounded-[var(--radius-control)] border border-[var(--border-default)] bg-[var(--surface-overlay)] px-4 py-3 text-[var(--type-label)] text-[var(--text-primary)] shadow-[var(--shadow-overlay)] max-[680px]:inset-x-4 max-[680px]:bottom-[calc(84px+env(safe-area-inset-bottom))] max-[680px]:text-center" role="status">{notice}</div>}

      {openLesson && <LessonView key={String(openLesson)} lessonId={openLesson} navigationStyle="segments" onExit={() => setOpenLesson(null)} onComplete={recordLessonCompletion} profile={profile} />}
      {openPractice && <PracticeSession sessionId={openPractice} completion={completedSessions[openPractice]} onExit={() => setOpenPractice(null)} onComplete={recordPracticeCompletion} />}
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
