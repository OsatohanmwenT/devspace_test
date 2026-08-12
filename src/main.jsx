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

// Practice awards a flat rate on first completion, mirroring LESSON_XP.
const PRACTICE_XP = 10

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
    <div className="min-h-screen bg-[#121214] font-['DM_Sans',Arial,sans-serif] [[data-theme=light]_&]:bg-[#fafaf8]">
      {active !== 'Plans' && !openLesson && (
      <header className="sticky top-0 z-30 flex items-center w-full h-16 px-[max(22px,calc((100vw-1160px)/2))] max-[680px]:px-[18px] border-b border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-[#121214]/95 [[data-theme=light]_&]:bg-white/95 backdrop-blur-md">
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
              className={`relative inline-flex h-[34px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72] ${streakAtRisk ? 'border-red-400/80 bg-red-500/10 text-red-200 hover:bg-red-500/15 [[data-theme=light]_&]:border-red-400 [[data-theme=light]_&]:bg-red-50 [[data-theme=light]_&]:text-red-700 [[data-theme=light]_&]:hover:bg-red-100' : 'border-[#404040] bg-[#262626] text-[#f4f4f2] hover:border-[#9a9a9d] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-[#202020] [[data-theme=light]_&]:hover:border-[#686968]'}`}
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
              {streakAtRisk && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#121214] bg-red-400 motion-safe:animate-pulse [[data-theme=light]_&]:border-white" aria-hidden="true" />}
            </button>
          </div>

          <div className="relative">
            <button
              ref={xpButtonRef}
              type="button"
              className={`inline-flex items-center gap-[5px] h-[34px] border rounded-full px-3 text-[13px] font-semibold cursor-pointer font-[inherit] transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72] ${activePopover === 'xp' ? 'border-[#6f66ec] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]' : 'border-[#404040] text-[#9a9a9d] hover:border-[#9a9a9d] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:border-[#686968]'} bg-[#262626] [[data-theme=light]_&]:bg-white`}
              onClick={() => setActivePopover((current) => (current === 'xp' ? null : 'xp'))}
              aria-haspopup="dialog"
              aria-expanded={activePopover === 'xp'}
            >
              <GemIcon className="w-3.5 h-3.5 text-[#8b7cf6] [[data-theme=light]_&]:text-[#6f66ec]" />
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
            <button className="border-0 rounded-lg bg-transparent p-2.5 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-left hover:bg-[#272634] [[data-theme=light]_&]:hover:bg-[#f1f0fd]" role="menuitem" onClick={() => { setActive('Profile'); setMenuOpen(false) }}>Profile</button>
            <button className="border-0 rounded-lg bg-transparent p-2.5 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-left hover:bg-[#272634] [[data-theme=light]_&]:hover:bg-[#f1f0fd]" role="menuitem" onClick={() => { setActive('Settings'); setMenuOpen(false) }}>Settings</button>
            <button className="border-0 rounded-lg bg-transparent p-2.5 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-left hover:bg-[#272634] [[data-theme=light]_&]:hover:bg-[#f1f0fd]" role="menuitem" onClick={toggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button>
          </div>
        )}
      </header>
      )}

      <main className={active === 'Plans' ? 'min-h-screen' : ['Paths', 'Leaderboard', 'Practice', 'Settings', 'Profile'].includes(active) ? 'w-[min(100%,1160px)] mx-auto pt-8 px-[22px] max-[900px]:px-[18px] pb-[72px] max-[680px]:pt-6 max-[680px]:px-[18px] max-[680px]:pb-14' : 'grid grid-cols-[360px_minmax(0,1fr)] max-[900px]:grid-cols-[300px_minmax(0,1fr)] gap-[22px] max-[900px]:gap-[18px] w-[min(100%,1160px)] mx-auto pt-10 px-[22px] max-[900px]:px-[18px] pb-[72px] max-[680px]:flex max-[680px]:flex-col max-[680px]:gap-7 max-[680px]:pt-6 max-[680px]:px-[18px] max-[680px]:pb-14'}>
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
        <aside className="flex flex-col gap-[18px] max-[680px]:order-2" aria-label="Learner support">
          <section className="border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-2xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_2px_6px_rgba(20,20,20,0.06)] p-[22px]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Rethink_Sans',Arial,sans-serif] text-[38px] font-medium">{streakDays}</span>
                <BoltIcon className="w-[34px] h-[34px] p-2 rounded-full bg-[#f5a623] text-white shadow-[0_0_0_3px_rgba(245,166,35,0.18)]" />
              </div>
              <button className="min-w-9 min-h-8 p-1 text-[#7d7d80] [[data-theme=light]_&]:text-[#737371] tracking-[2px] border-0 bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72]" onClick={() => showNotice(`${xp} of ${xpGoal} XP earned`)} aria-label="View streak details">•••</button>
            </div>
            {/* Was the fixed string "Solve 3 problems to start a streak", which
                contradicted the streak count rendered directly above it. */}
            <p className="mt-3.5 mb-4 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">
              {streakMessage.emphasis && <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-medium">{streakMessage.emphasis} </strong>}
              {streakMessage.text}
            </p>
            {/* Seven fixed 40px circles overflow the 300px sidebar, so they size
                themselves from the space available and cap at the original 40px. */}
            <div className="flex justify-between gap-1.5" role="img" aria-label={`Activity for the last ${WEEK_LENGTH} days: ${streakWeek.filter((day) => day.isActive).length} active`}>
              {streakWeek.map(({ key, label, isActive }) => (
                <div
                  className={
                    isActive
                      ? 'flex flex-1 min-w-0 flex-col items-center gap-[5px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
                      : 'flex flex-1 min-w-0 flex-col items-center gap-[5px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'
                  }
                  key={key}
                >
                  <span
                    className={
                      isActive
                        ? 'grid place-items-center w-full max-w-10 aspect-square rounded-full border border-[#f5a623] bg-[#f5a623] text-white shadow-[0_0_0_3px_rgba(245,166,35,0.18)]'
                        : 'grid place-items-center w-full max-w-10 aspect-square rounded-full border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'
                    }
                  >
                    <BoltIcon className="w-[18px] h-[18px]" />
                  </span>
                  <small>{label}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl p-[22px] bg-[#211a2b] [[data-theme=light]_&]:bg-[#f6eef7] border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:shadow-[0_2px_6px_rgba(20,20,20,0.06)]">
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="text-[#f0c964] text-[21px]" aria-hidden="true">✦</span>
              <div className="grid gap-1">
                <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-[15px] font-medium">Unlock all learning</strong>
                <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">Get smarter, faster with Premium.</span>
              </div>
            </div>
            <ActionButton variant="premium" className="w-full min-h-[52px] text-[15px] font-medium" onClick={() => openPlans()}>
              Explore Premium
            </ActionButton>
          </section>

          <section className="border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-2xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_2px_6px_rgba(20,20,20,0.06)] p-[22px] text-center">
            <div className="flex items-start justify-between gap-2 mb-3.5 text-left">
              <div className="grid gap-0.5">
                <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-[15px] font-semibold">{currentLeague.name}</strong>
              <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">{formatTimeRemaining(getTimeRemaining(now()))}</span>
              </div>
              <InfoTooltip label="How leagues work" align="end">
                Earn XP this week to move up the leaderboard. Final standings update when the week ends.
              </InfoTooltip>
            </div>
            <div
              className="flex w-full items-center justify-center py-8 my-2 rounded-lg border border-[#404040] bg-[#171717] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-[#f5f5f4]"
              aria-hidden="true"
            >
              <TierMedal league={currentLeague} state="current" size={64} />
            </div>
            <p className="m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px] leading-[1.4]">
              {weeklyXp > 0 ? `${weeklyXp.toLocaleString()} XP earned this week` : "Earn XP to join this week's league"}
            </p>
          </section>

        </aside>

        <section className="min-w-0 max-[680px]:order-1">
          <h1 className="m-0 mb-4 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Rethink_Sans',Arial,sans-serif] text-[30px] max-[680px]:text-[27px] font-medium">Your next mission</h1>

          <div className="relative w-full pt-2.5 pl-2.5 max-[680px]:pt-2 max-[680px]:pl-0">
            <article className="relative z-[1] flex w-full min-h-[530px] max-[680px]:min-h-0 flex-col items-center gap-[18px] p-7 max-[900px]:p-[22px] max-[680px]:pt-[22px] max-[680px]:px-[18px] max-[680px]:pb-5 overflow-hidden rounded-2xl text-center bg-[#1f1f1f]! [[data-theme=light]_&]:bg-white! border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:shadow-[0_2px_6px_rgba(20,20,20,0.06)]">
              <div className="w-full pt-1 text-center">
                <Badge className="bg-neutral-700 text-neutral-100">{currentPath.level}</Badge>
                <h2 className="max-w-[520px] mx-auto mt-3.5 mb-1.5 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Rethink_Sans',Arial,sans-serif] text-[clamp(28px,4vw,42px)] max-[900px]:text-[clamp(30px,4.5vw,40px)] max-[680px]:text-[clamp(32px,10vw,42px)] font-medium leading-[1.04] [overflow-wrap:anywhere] text-balance">{currentPath.title}</h2>
                <p className="m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs max-[680px]:leading-[1.5] font-medium tracking-[.04em]">{currentRegionCard.title} · {currentRegionCard.percent}% complete</p>
              </div>

              <div className="relative w-[220px] h-[220px] max-[900px]:w-[190px] max-[900px]:h-[190px] max-[680px]:w-[170px] max-[680px]:h-[170px] max-[680px]:mx-auto flex-none">
                <div className="relative grid place-items-center w-[220px] h-[220px] max-[900px]:w-[190px] max-[900px]:h-[190px] max-[680px]:w-[170px] max-[680px]:h-[170px] overflow-visible">
                  <div className="absolute z-0 right-[14%] bottom-[-2%] left-[14%] h-[28%] rounded-full bg-[#525252] blur-[18px] opacity-25" />
                  <img className="relative z-[1] block w-full h-full object-contain" src={currentPath.emblem} alt="A colorful symbolic illustration for the current path" />
                </div>
              </div>

              <div className="w-full mt-auto">
                <div className="flex items-center justify-center gap-1.5 mb-[9px]" role="img" aria-label={`Region ${currentStepIndex + 1} of ${derived.regionsTotal}`}>
                  {derived.regions.map((region, index) => (
                    <span className={`w-2 h-2 rounded-full ${index === currentStepIndex ? 'bg-[#d4d4d4]' : 'bg-[#404040] [[data-theme=light]_&]:bg-[#eeeeeb]'}`} key={region.id} />
                  ))}
                </div>
                {/* The dots count regions, so the label says so — "Step N of 6"
                    followed by a lesson title read as though the lesson were the step. */}
                <p className="max-w-full m-0 mb-[18px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs leading-[1.5] text-center"><strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-medium">Region {currentStepIndex + 1} of {derived.regionsTotal}</strong> · {nextLesson?.title}</p>
                <ActionButton variant="primary" className="w-full min-h-[52px] text-[15px] font-medium" onClick={startMission}>
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
        <div className="fixed right-6 bottom-6 z-20 grid justify-items-end gap-3 max-[680px]:right-[18px] max-[680px]:bottom-[18px]">
          {devyOpen && (
            <section id="devy-hint" className="w-[min(320px,calc(100vw-36px))] rounded-2xl border border-[#404040] bg-[#1f1f1f] p-4 shadow-[0_12px_30px_rgba(0,0,0,.24)] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_2px_6px_rgba(20,20,20,0.06)]" role="status" aria-label="Devy hint">
              <div className="flex items-start gap-3">
                <img className="size-12 flex-none object-contain" src="/assets/devy.svg" alt="" />
                <div>
                  <strong className="text-sm font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">Try this first</strong>
                  <p className="mt-1 text-xs leading-[1.45] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{homeHint}</p>
                </div>
              </div>
            </section>
          )}
          <button type="button" className="grid size-16 place-items-center rounded-full border border-[#525252] bg-[#303030] p-2 shadow-[0_4px_0_#171717] transition-[background,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#404040] active:translate-y-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 [[data-theme=light]_&]:border-[#b8b8b8] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_4px_0_#d4d4d4] [[data-theme=light]_&]:hover:bg-[#f5f5f4]" onClick={() => setDevyOpen((open) => !open)} aria-expanded={devyOpen} aria-controls="devy-hint" aria-label={devyOpen ? 'Close Devy hint' : 'Ask Devy'}>
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

      {notice && <div className="fixed z-10 right-6 bottom-6 max-[680px]:right-[18px] max-[680px]:bottom-[18px] max-[680px]:left-[18px] max-[680px]:text-center px-4 py-3 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-[10px] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-[13px]" role="status">{notice}</div>}

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
