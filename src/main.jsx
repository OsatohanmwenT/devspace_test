import { bind } from 'cuelume';
import { MotionConfig } from 'motion/react';
import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StreakJourneyModal } from './components/header/StreakJourneyModal';
import { XpPopover } from './components/header/XpPopover';
import HomeView from './components/home';
import { PageWipe } from './components/layout/PageWipe';
import LeaderboardView from './components/leaderboard';
import { LeagueQualifiedCelebration } from './components/leaderboard/LeagueQualifiedCelebration';
import { PayoutCenter } from './components/leaderboard/PayoutCenter';
import { getLesson } from './components/lesson/lessonContent';
import { LessonLoading } from './components/lesson/LessonLoading';
import LessonView from './components/lesson/LessonView';
import OnboardingView from './components/onboarding';
import { FirstLessonWelcome } from './components/onboarding/FirstLessonWelcome';
import PathsView from './components/paths';
import { RoadmapTransition } from './components/paths/RoadmapTransition';
import PlansView from './components/plans';
import PracticeView from './components/practice';
import { PracticeSession } from './components/practice/PracticeSession';
import ProfileView from './components/profile';
import SettingsView from './components/settings';
import { StreakMilestoneTransition } from './components/streak/StreakMilestoneTransition';
import { AnimatedBoltIcon, AnimatedGemIcon } from './components/ui/AnimatedIcons';
import { DevyDrawer } from './components/ui/DevyDrawer';
import { DevyLottie } from './components/ui/DevyLottie';
import { DevyRive } from './components/ui/DevyRive';
import { CompassIcon, DumbbellIcon, HomeIcon, PodiumIcon, SirenIcon } from './components/ui/icons';
import { getLeague } from './data/leagues';
import { buildCustomPathRecord, getPath } from './data/paths';
import { activatePremium, applyActivity, applyCoins, deactivatePremium, getDailyXp, getPracticeXpAward, loadProgress, markPageIntroductionSeen, saveCustomPath, saveProgress, switchPrimaryPath } from './data/progress';
import { getLessonCoinAward, getPracticeCoinAward } from './lib/coins';
import { advanceH2HWeek, chooseH2HOpponent as chooseH2HOpponentRecord } from './lib/h2h';
import { getStandings, resolveSeason } from './lib/leagueSim';
import { LESSON_XP } from './lib/lessonMeta';
import { computeDailyGoal } from './lib/onboarding';
import { deriveLessonCompletionTransition, derivePathProgress } from './lib/pathProgress';
import {
    createPrivateLeague as createPrivateLeagueRecord,
    joinPrivateLeagueByCode,
    leavePrivateLeague as leavePrivateLeagueRecord,
    regeneratePrivateLeagueCode as regeneratePrivateLeagueCodeRecord,
    removePrivateLeagueMember as removePrivateLeagueMemberRecord,
    renamePrivateLeague as renamePrivateLeagueRecord,
} from './lib/privateLeagues';
import { getRewardForRank, MIN_PAYOUT_THRESHOLD } from './lib/rewards';
import { formatTimeRemaining, getSeasonIndex, getTimeRemaining, now } from './lib/season';
import { getStreakMessage, getStreakWeek, highestNewMilestone, isActiveToday } from './lib/streak';
import { now as weekNow } from './lib/week';
import './styles.css';
import './tailwind.css';

// Temporary debug view for judging the new .riv entrance clips — visit
// ?preview=devy-riv&clip=<name>. Logs every play/pause/stop event so a
// one-shot entrance that already finished before the first screenshot is
// distinguishable from one that never played at all, and a Replay button
// re-fires both state machines on demand instead of needing a reload.
function RiveEntranceDebug({ clip }) {
  const [key, setKey] = useState(0)

  return (
    <div className="grid min-h-screen place-items-center gap-6 bg-[#121214]">
      <div className="h-[500px] w-[500px] border border-[#404040]">
        <DevyRive key={key} clip={clip} className="h-full w-full" ariaLabel={clip} />
      </div>
      <button type="button" className="rounded-lg bg-[#2563eb] px-4 py-2 text-white" onClick={() => setKey((k) => k + 1)}>Replay</button>
    </div>
  )
}

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
  const [publicProfileView, setPublicProfileView] = useState(false)
  const [pathsInitialView, setPathsInitialView] = useState(null)
  const [pathsInitialSelectedId, setPathsInitialSelectedId] = useState(null)
  const [customPathFullScreen, setCustomPathFullScreen] = useState(false)
  const [leagueCelebration, setLeagueCelebration] = useState(null)
  const [roadmapTransition, setRoadmapTransition] = useState(null)
  const [streakMilestone, setStreakMilestone] = useState(null)
  const [pageTransition, setPageTransition] = useState(null)
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
  // A league celebration that qualifies while a roadmap transition is on
  // screen waits here rather than firing underneath it.
  const pendingLeagueCelebrationRef = useRef(null)
  // A streak milestone is the lowest-priority of the three full-screen
  // moments — a frequent small win should never cut in front of a rarer,
  // bigger one — so it waits here behind whichever of the other two is on
  // screen, and is only promoted once both are clear.
  const pendingStreakMilestoneRef = useRef(null)

  const runPageTransition = (onCovered) => {
    if (pageTransition) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onCovered()
      return
    }
    setPageTransition({ onCovered })
  }

  useEffect(() => {
    bind()
  }, [])

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

  // Settle any finished season before the leaderboard renders, so promotion
  // and demotion have already been applied by first paint. A finished
  // season's rank is also what the reward center's confirmed balance is
  // built from — see lib/rewards.js.
  useEffect(() => {
    setProgress((current) => {
      const result = resolveSeason(current, now())
      if (!result) return current
      const rewardAmount = getRewardForRank(getLeague(current.leagueIndex).id, result.rank)
      const next = {
        ...current,
        seasonIndex: getSeasonIndex(now()),
        seasonCoins: 0,
        leagueIndex: result.nextLeagueIndex,
        highestLeagueIndex: Math.max(current.highestLeagueIndex ?? 0, result.nextLeagueIndex),
        lastLeagueResult: result,
        silverPassSeasonIndex: result.silverPassSeasonIndex ?? current.silverPassSeasonIndex,
        rewardBalance: current.rewardBalance + rewardAmount,
        lifetimeRewards: current.lifetimeRewards + rewardAmount,
        seasonRewardHistory: rewardAmount > 0
          ? [{ seasonIndex: result.seasonIndex, leagueId: getLeague(current.leagueIndex).id, rank: result.rank, amount: rewardAmount }, ...current.seasonRewardHistory].slice(0, 10)
          : current.seasonRewardHistory,
      }
      saveProgress(next)
      return next
    })
  }, [])

  // Settle any finished H2H week the same way — a no-op until the stored
  // window is actually over (see lib/h2h.js). Kept separate from the season
  // effect since the two run on entirely different clocks (calendar week vs
  // 28-day season).
  useEffect(() => {
    setProgress((current) => {
      const { h2h, resolved } = advanceH2HWeek(current.h2h, current.seasonCoins, weekNow())
      if (!resolved && h2h === current.h2h) return current
      const next = { ...current, h2h }
      saveProgress(next)
      return next
    })
  }, [])

  const recordPracticeCompletion = (sessionId, correctCount, total) => {
    setProgress((current) => {
      const today = new Date().toDateString()
      // The XP award rule lives in data/progress so the results screen can
      // state the same number this banks — completedAt is overwritten every
      // time, so a same-day retry can never be double-counted. The coin award
      // (lib/coins) is computed against the same completedSessions record but
      // has no Premium replay exception — a repeat is worth 0 coins to anyone.
      const withXp = applyActivity(current, getPracticeXpAward(current, sessionId, today), today)
      const newStreakMilestone = highestNewMilestone(current.earnedStreakMilestones, withXp.earnedStreakMilestones)
      const next = {
        ...applyCoins(withXp, getPracticeCoinAward(current, sessionId)),
        completedSessions: {
          ...current.completedSessions,
          [sessionId]: { correctCount, total, completedAt: today },
        },
      }
      // Practice has no other full-screen moment competing for the screen,
      // so a milestone earned here can always show right away.
      if (newStreakMilestone) setStreakMilestone(newStreakMilestone)
      saveProgress(next)
      return next
    })
  }

  const recordLessonCompletion = (completedLessonId, meta) => {
    // Earn It First: opening Devy before a first attempt on any question
    // forfeits this completion's reward, same as a repeat completion already
    // does — the lesson still counts toward progression, it just pays 0.
    const assisted = Boolean(meta?.assisted)
    setProgress((current) => {
      const today = new Date().toDateString()
      // First completion earns XP and coins; replays and assisted runs still
      // update the record but earn neither.
      const isFirstCompletion = !current.completedLessons?.[completedLessonId]
      const withXp = applyActivity(current, isFirstCompletion && !assisted ? LESSON_XP : 0, today)
      const next = {
        ...applyCoins(withXp, getLessonCoinAward(current, completedLessonId, assisted)),
        completedLessons: { ...current.completedLessons, [completedLessonId]: { completedAt: today } },
      }

      // A region's `state` only flips to 'completed' once every lesson in it
      // has — comparing before/after catches exactly the completion that
      // crosses that line, region-by-region rather than lesson-by-lesson.
      // Only checked on a genuine first completion, so replaying an already
      // finished lesson can't re-trigger the transition screen.
      const transition = isFirstCompletion
        ? deriveLessonCompletionTransition(currentPath, current.completedLessons, next.completedLessons)
        : null
      if (transition) setRoadmapTransition(transition)

      // Computed unconditionally (not gated on isFirstCompletion) — applyActivity
      // runs on every completion, including replays, and a streak tier can be
      // crossed by a replay on a new day just as well as a first completion.
      const newStreakMilestone = highestNewMilestone(current.earnedStreakMilestones, next.earnedStreakMilestones)

      // Earning your first coin puts a learner on the board (LeaderboardView
      // gates on `seasonCoins > 0`) — starting a mission doesn't count, only
      // a verified first completion does, per the anti-farming rule. Rather
      // than fire mid-lesson, the celebration waits for the end of the
      // lesson: the first completion that finds the learner already on the
      // board, once ever. A roadmap transition takes the screen first when
      // both happen on the same completion — the league celebration queues
      // and fires only once that transition closes, rather than stacking on
      // top of it. A streak milestone is lower priority than both, so it
      // queues behind whichever of the two claims the screen this time.
      const isOnBoard = next.seasonCoins > 0
      const alreadyCelebrated = Boolean(current.seenPageIntroductions?.['league-qualified'])
      if (isOnBoard && !alreadyCelebrated) {
        const celebration = { leagueIndex: next.leagueIndex, seasonCoins: next.seasonCoins }
        if (transition) pendingLeagueCelebrationRef.current = celebration
        else setLeagueCelebration(celebration)
        if (newStreakMilestone) pendingStreakMilestoneRef.current = newStreakMilestone
        const seen = markPageIntroductionSeen(next, 'league-qualified')
        saveProgress(seen)
        return seen
      }
      if (newStreakMilestone) {
        if (transition) pendingStreakMilestoneRef.current = newStreakMilestone
        else setStreakMilestone(newStreakMilestone)
      }
      saveProgress(next)
      return next
    })
    showNotice(assisted ? 'Lesson complete · no XP (Devy helped on a question)' : `Lesson complete · +${LESSON_XP} XP`)
  }

  // The celebration sits on top of the finished lesson, so continuing has to
  // close the lesson too — otherwise dismissing it drops back into the lesson
  // the learner had already completed.
  const dismissLeagueCelebration = () => {
    setLeagueCelebration(null)
    setOpenLesson(null)
    setActive('Leaderboard')
    // A streak milestone that queued behind this celebration (whether it
    // fired directly or was itself promoted from behind a roadmap
    // transition) is released once this closes.
    if (pendingStreakMilestoneRef.current) {
      setStreakMilestone(pendingStreakMilestoneRef.current)
      pendingStreakMilestoneRef.current = null
    }
  }

  // Closes the lesson underneath the transition and hands off to any league
  // celebration that queued while it was on screen, so a qualifying moment
  // is never silently dropped — it just waits its turn. A streak milestone
  // queued behind this transition is released only if there is no league
  // celebration ahead of it too — that still has to go first.
  const dismissRoadmapTransition = () => {
    setRoadmapTransition(null)
    setOpenLesson(null)
    if (pendingLeagueCelebrationRef.current) {
      setLeagueCelebration(pendingLeagueCelebrationRef.current)
      pendingLeagueCelebrationRef.current = null
    } else if (pendingStreakMilestoneRef.current) {
      setStreakMilestone(pendingStreakMilestoneRef.current)
      pendingStreakMilestoneRef.current = null
    }
  }

  const dismissStreakMilestone = () => {
    setStreakMilestone(null)
    setOpenLesson(null)
  }

  const viewJourneyFromMilestone = () => {
    dismissStreakMilestone()
    setStreakJourneyOpen(true)
  }

  const startNextRegionLesson = (lessonId) => {
    if (loadingLesson || lessonLaunchTimerRef.current) return
    dismissRoadmapTransition()
    launchLesson(lessonId)
  }

  // Lands back on the path detail screen (not wherever the lesson happened to
  // be launched from) so the newly-unlocked region — or, on a finished path,
  // the roadmap being reviewed — is what the learner sees next.
  const viewRoadmapFromTransition = () => {
    dismissRoadmapTransition()
    setPathsInitialView('detail')
    setPathsInitialSelectedId(null)
    setActive('Paths')
  }

  const exploreRoadmapsFromTransition = () => {
    dismissRoadmapTransition()
    setPathsInitialView(null)
    setPathsInitialSelectedId(null)
    setActive('Paths')
  }

  // Home's Continue Learning course switcher jumps straight to that path's
  // own roadmap when it isn't the primary one — the one thing "quickly
  // switch what I'm continuing" needs — rather than dropping the learner on
  // the generic explore grid to find it themselves.
  const openPathFromHome = (pathId) => {
    setPathsInitialSelectedId(pathId)
    setPathsInitialView('detail')
    setActive('Paths')
  }

  const dismissLeagueResult = () => {
    setProgress((current) => {
      const next = { ...current, lastLeagueResult: null }
      saveProgress(next)
      return next
    })
  }

  const dismissPageIntroduction = (introductionId) => {
    setProgress((current) => {
      const next = markPageIntroductionSeen(current, introductionId)
      saveProgress(next)
      return next
    })
  }

  const createPrivateLeague = (name, emoji) => {
    setProgress((current) => {
      const next = createPrivateLeagueRecord(current, name, emoji)
      saveProgress(next)
      return next
    })
    showNotice('League created')
  }

  const removePrivateLeagueMember = (leagueId, rivalId) => {
    setProgress((current) => {
      const next = removePrivateLeagueMemberRecord(current, leagueId, rivalId)
      saveProgress(next)
      return next
    })
  }

  const renamePrivateLeague = (leagueId, name) => {
    setProgress((current) => {
      const next = renamePrivateLeagueRecord(current, leagueId, name)
      saveProgress(next)
      return next
    })
  }

  const regeneratePrivateLeagueCode = (leagueId) => {
    setProgress((current) => {
      const next = regeneratePrivateLeagueCodeRecord(current, leagueId)
      saveProgress(next)
      return next
    })
    showNotice('Invite code regenerated — the old code no longer works')
  }

  const chooseH2HOpponent = (opponentId) => {
    setProgress((current) => {
      const next = { ...current, h2h: chooseH2HOpponentRecord(current.h2h, opponentId) }
      saveProgress(next)
      return next
    })
  }

  const joinPrivateLeague = (code) => {
    setProgress((current) => {
      const next = joinPrivateLeagueByCode(current, code)
      saveProgress(next)
      return next
    })
    showNotice('Joined league')
  }

  const leavePrivateLeague = (leagueId) => {
    setProgress((current) => {
      const next = leavePrivateLeagueRecord(current, leagueId)
      saveProgress(next)
      return next
    })
    showNotice('Left league')
  }

  // No billing behind this either — same demo-action shape as
  // activatePremium. Moves the whole confirmed balance into history rather
  // than a partial withdrawal, since there's no real payout rail to size a
  // partial request against.
  const requestPayout = () => {
    setProgress((current) => {
      if (current.rewardBalance < MIN_PAYOUT_THRESHOLD) return current
      const entry = { id: `payout-${Date.now()}`, amount: current.rewardBalance, requestedAt: Date.now(), paidAt: Date.now() }
      const next = { ...current, rewardBalance: 0, payoutHistory: [entry, ...current.payoutHistory].slice(0, 20) }
      saveProgress(next)
      return next
    })
    showNotice('Payout sent')
  }

  const savePayoutProfile = (fields) => {
    setProgress((current) => {
      const next = { ...current, payoutProfile: { ...current.payoutProfile, ...fields } }
      saveProgress(next)
      return next
    })
    showNotice('Payout details saved')
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

  // Promotes a freshly generated route to the primary path — it becomes
  // `profile.pathId`, so Home's mission card, Paths and Profile all pick it
  // up the same way they already do for any career path. Whatever was
  // primary before is paused, not lost (see switchPrimaryPath).
  const createCustomPath = (route) => {
    const record = buildCustomPathRecord(route)
    setProgress((current) => {
      const next = switchPrimaryPath(saveCustomPath(current, record), record.id)
      saveProgress(next)
      return next
    })
    launchLesson(record.cards[0]?.lessons[0]?.id)
    showNotice(`${record.title} is ready to start`)
  }

  // Resumes a paused path (authored or custom) as primary.
  const resumePath = (pathId) => {
    const targetPath = customPaths?.[pathId] ?? getPath(pathId, customPaths)
    setProgress((current) => {
      const next = switchPrimaryPath(current, pathId)
      saveProgress(next)
      return next
    })
    setActive('Home')
    showNotice(`Switched active mission to ${targetPath?.title ?? 'new path'}`)
  }

  // The learner's own words and links, layered onto the onboarding-derived
  // profile — everything else on the CV comes from real progress records,
  // but name, headline, bio, links, and works are theirs to say.
  //
  // A profile photo rides along as a data URL inside this same localStorage
  // blob (no backend to upload to — see lib/imageUpload.js), which can
  // legitimately blow the browser's storage quota even after the picker
  // downscales it. saveProgress reports that failure rather than pretending
  // it worked, so the notice here can tell the truth instead of lying about
  // a save that silently didn't happen.
  const saveProfileFields = (fields) => {
    let saved = true
    setProgress((current) => {
      const next = { ...current, profile: { ...current.profile, ...fields } }
      saved = saveProgress(next)
      return next
    })
    showNotice(saved ? 'Profile updated' : "Couldn't save — try a smaller photo")
  }

  const chooseFrontendFramework = (stack) => {
    setProgress((current) => {
      const next = { ...current, profile: { ...current.profile, stack, frameworkDecision: 'complete' } }
      saveProgress(next)
      return next
    })
    showNotice(`${stack === 'vue' ? 'Vue' : stack === 'angular' ? 'Angular' : 'React'} is now your frontend focus`)
  }

  const completeOnboarding = (nextProfile) => {
    runPageTransition(() => {
      setProgress((current) => {
        const next = { ...current, profile: nextProfile }
        saveProgress(next)
        return next
      })
      setShowFirstLessonWelcome(true)
    })
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
    showNotice(wasStarted ? 'Mission ready to continue' : 'Mission started')
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    showNotice(`${nextTheme === 'light' ? 'Light' : 'Dark'} mode enabled`)
  }

  const { xp, seasonCoins, streakDays, leagueIndex, lastLeagueResult, completedSessions, completedLessons, lastActiveDate, longestStreak, streakRestoreCredits, streakActivityDates, earnedStreakMilestones, lastStreakProtection, profile, customPaths, pathHistory, seenPageIntroductions } = progress
  // Onboarding picks the path; before that, the default shelf is the spine.
  // A learner-generated custom path takes priority when it's the primary one.
  const currentPath = customPaths?.[profile?.pathId] ?? getPath(profile?.pathId)

  // Gated by an explicit env flag (see .env.development) rather than the
  // implicit import.meta.env.DEV, so it can be turned off without a code
  // change. Stays a compile-time constant Vite dead-code-eliminates wherever
  // the flag isn't 'true' — a production `vite build` never reads
  // .env.development either way, so this is out of shipped builds regardless.
  const testHooksEnabled = import.meta.env.VITE_ENABLE_TEST_HOOKS === 'true'

  // Same condition the header itself already gates on — the tab bar is that
  // header's mobile nav, so it disappears everywhere the header does (a full
  // path/practice session, Plans) rather than floating over a focused screen.
  const showChrome = active !== 'Plans' && !openLesson && !openPractice && !customPathFullScreen

  const currentLeague = getLeague(leagueIndex)
  const leagueStandings = getStandings(getSeasonIndex(now()), leagueIndex, seasonCoins, now())
  const leagueRank = leagueStandings.find((entry) => entry.isCurrentUser)?.rank
  const leagueRankDelta = leagueStandings.find((entry) => entry.isCurrentUser)?.delta
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
  // Paths the learner paused to focus on the current primary one — offered
  // back on Home so switching is a click, not a rebuild. If history is empty,
  // surface popular alternative catalog paths.
  const otherPaths = useMemo(() => {
    const historical = (pathHistory ?? [])
      .filter((id) => id !== profile?.pathId)
      .slice(0, 2)
      .map((id) => customPaths?.[id] ?? getPath(id, customPaths))
      .filter(Boolean)

    if (historical.length > 0) return historical

    const fallbacks = ['fullstack-developer', 'frontend-developer', 'machine-learning', 'backend-developer']
      .filter((id) => id !== profile?.pathId)
      .slice(0, 2)
    return fallbacks.map((id) => getPath(id, customPaths)).filter(Boolean)
  }, [pathHistory, customPaths, profile?.pathId])

  // Home's Continue Learning card folds course-switching into itself — a
  // dropdown over this list — rather than a separate Paths card, so juggling
  // a few concurrent courses is a click on the card you're already looking
  // at instead of a trip through the Paths tab.
  const courseOptions = useMemo(() => {
    const toOption = (path, isPrimary) => {
      const info = derivePathProgress(path, completedLessons)
      const regionLessons = info.currentRegion?.lessons ?? []
      const currentIndexInRegion = regionLessons.findIndex((lesson) => lesson.id === info.currentLesson?.id)
      return {
        id: path.id,
        title: path.title,
        // The region/chapter name — the actual heading Home's Continue
        // Learning card leads with, distinct from the path title shown in
        // the course switcher pill.
        regionTitle: info.currentRegion?.title ?? null,
        percent: info.percent,
        nextLessonTitle: info.currentLesson?.title ?? null,
        // The lesson after the one already in progress — distinct from
        // nextLessonTitle, which is the in-progress lesson itself.
        upNextTitle: currentIndexInRegion !== -1 ? regionLessons[currentIndexInRegion + 1]?.title ?? null : null,
        regionPercent: info.currentRegion?.percent ?? 0,
        regionIndex: info.currentRegion?.index ?? 0,
        regionsTotal: info.regionsTotal ?? 0,
        regionLessonsCompleted: info.currentRegion?.lessonsCompleted ?? 0,
        regionLessonsTotal: info.currentRegion?.lessonsTotal ?? 0,
        // The same topic illustration the region already uses on the Paths
        // roadmap — real art tied to what's actually being learned, not a
        // generic icon repeated on every card.
        regionImage: info.currentRegion?.image ?? path.emblem ?? null,
        isPrimary,
      }
    }
    // A custom path becomes switchable the moment it exists, even if it was
    // just built via chat and never made primary — otherPaths alone (paused
    // *former* primaries, or catalog suggestions) wouldn't surface it.
    const ownCustomPaths = Object.values(customPaths).filter((path) => path.id !== profile?.pathId && !otherPaths.some((other) => other.id === path.id))
    return [
      toOption(currentPath, true),
      ...otherPaths.map((path) => toOption(path, false)),
      ...ownCustomPaths.map((path) => toOption(path, false)),
    ]
  }, [currentPath, otherPaths, customPaths, profile?.pathId, completedLessons])

  // Home's Leaderboard card reveals the standings immediately around the
  // learner's own row — one above, one below — rather than the whole league,
  // since that's the only slice that answers "who am I actually racing".
  const leagueNeighbors = useMemo(() => {
    const userIndex = leagueStandings.findIndex((entry) => entry.isCurrentUser)
    if (userIndex === -1) return []
    return leagueStandings.slice(Math.max(0, userIndex - 1), userIndex + 2)
  }, [leagueStandings])
  // The Home card shows a short, scannable four-person window around the
  // learner instead of mimicking a full leaderboard.
  const leagueNeighborsWide = useMemo(() => {
    const userIndex = leagueStandings.findIndex((entry) => entry.isCurrentUser)
    if (userIndex === -1) return []
    return leagueStandings.slice(Math.max(0, userIndex - 2), userIndex + 2)
  }, [leagueStandings])
  const userStandingIndex = leagueStandings.findIndex((entry) => entry.isCurrentUser)
  const coinsToNextRank = userStandingIndex > 0
    ? leagueStandings[userStandingIndex - 1].score - leagueStandings[userStandingIndex].score
    : 0

  // The Leaderboard card's "what's actually at stake" line — promotion is a
  // real mechanic (see data/leagues.js promotePercent), so this is the
  // learner's real distance from it rather than an invented reward.
  const promoteCount = Math.max(1, Math.round(leagueStandings.length * currentLeague.promotePercent))
  const inPromotionZone = currentLeague.promotePercent > 0 && userStandingIndex !== -1 && userStandingIndex < promoteCount
  const coinsToPromotion = currentLeague.promotePercent > 0 && !inPromotionZone && userStandingIndex > 0
    ? leagueStandings[promoteCount - 1].score - leagueStandings[userStandingIndex].score
    : 0
  const seasonTimeLeft = formatTimeRemaining(getTimeRemaining(now()))

  // Reflects what the learner actually onboarded as, rather than ML for everyone.
  const homeHint = nextLesson
    ? `Next up on ${currentPath.title} is ${nextLesson.title}. ${seasonCoins > 0 ? 'You’re already on the board this season — keep the streak going.' : 'A single lesson is enough to join this season’s league.'}`
    : `You’re set up on ${currentPath.title}. Open Paths to pick where to go next.`

  // Home's "What's New" card rotates through whichever single real signal
  // matters most right now, in priority order, rather than trying to show
  // everything — a finished path outranks a streak nudge, which outranks a
  // routine checkpoint reminder.
  const dynamicUpdate = derived.isComplete
    ? { kind: 'path-complete', title: `You've finished ${currentPath.title}`, body: otherPaths[0] ? `Recommended next: ${otherPaths[0].title}` : 'Explore Paths to pick what\'s next.', cta: 'See what’s next' }
    : streakAtRisk
      ? { kind: 'streak-risk', title: `${streakDays}-day streak`, body: 'One more lesson today keeps it alive.', cta: 'Keep it going' }
      : derived.nextCheckpoint && derived.nextCheckpoint.lessonsUntil <= 2
        ? { kind: 'checkpoint', title: 'Checkpoint coming up', body: derived.nextCheckpoint.lesson.title, cta: 'Continue lesson' }
        : streakDays > 0
          ? { kind: 'streak', title: `${streakDays}-day streak`, body: 'Keep it going with today’s lesson.', cta: 'Continue lesson' }
          : { kind: 'welcome', title: 'Welcome back', body: homeHint, cta: 'Explore Paths' }

  // A direct preview instead of driving real completion state to reach these
  // screens — that approach kept breaking on real data's own edge cases (an
  // authored path's first region seed-completed regardless of what's in
  // completedLessons, a "completed last lesson" replay silently no-opping).
  // This sidesteps all of that: it renders the real RoadmapTransition with a
  // hand-built transition object, nothing else in the app touched. Visit
  // ?preview=region-complete or ?preview=roadmap-complete.
  if (testHooksEnabled) {
    const previewParam = new URLSearchParams(window.location.search).get('preview')
    if (previewParam === 'region-complete' || previewParam === 'roadmap-complete') {
      const previewPath = getPath('machine-learning')
      const previewRegions = derivePathProgress(previewPath, {}).regions
      const previewTransition = previewParam === 'roadmap-complete'
        ? {
            type: 'roadmap-complete',
            pathId: previewPath.id,
            pathTitle: previewPath.title,
            completedRegion: previewRegions.at(-1),
            regionsCompleted: previewRegions.length,
            regionsTotal: previewRegions.length,
            lessonsCompleted: previewRegions.reduce((sum, region) => sum + region.lessonsTotal, 0),
            lessonsTotal: previewRegions.reduce((sum, region) => sum + region.lessonsTotal, 0),
          }
        : {
            type: 'next-region',
            pathId: previewPath.id,
            pathTitle: previewPath.title,
            completedRegion: previewRegions[1],
            nextRegion: previewRegions[2],
            firstLesson: previewRegions[2].lessons[0],
            launchable: true,
          }
      return (
        <RoadmapTransition
          transition={previewTransition}
          onStartLesson={() => {}}
          onViewRoadmap={() => { window.location.search = '' }}
          onExploreRoadmaps={() => { window.location.search = '' }}
          onReviewRoadmap={() => { window.location.search = '' }}
        />
      )
    }
    // Temporary side-by-side viewer for the new native .riv exports, so they
    // can be judged in-browser before wiring any of them into real UI. Visit
    // ?preview=devy-riv. Remove once the five clips have a permanent home.
    if (previewParam === 'devy-riv') {
      const clips = ['walk', 'launchpad-intro', 'rope-into', 'side-pop-out-intro', 'up-down-pop-out']
      const solo = new URLSearchParams(window.location.search).get('clip')
      if (solo) {
        return <RiveEntranceDebug clip={solo} />
      }
      return (
        <div className="grid min-h-screen grid-cols-3 gap-8 bg-[#121214] p-10">
          {clips.map((clip) => (
            <div key={clip} className="grid justify-items-center gap-2 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-6">
              <p className="m-0 text-sm font-medium text-[#f4f4f2]">{clip}</p>
              <DevyRive clip={clip} className="h-40 w-40" ariaLabel={clip} />
            </div>
          ))}
        </div>
      )
    }
  }

  if (!profile) return <><OnboardingView onComplete={completeOnboarding} />{pageTransition && <PageWipe onCovered={pageTransition.onCovered} onDone={() => setPageTransition(null)} />}</>
  if (showFirstLessonWelcome) return <><FirstLessonWelcome path={currentPath} lesson={nextLesson} onBegin={startMission} />{pageTransition && <PageWipe onCovered={pageTransition.onCovered} onDone={() => setPageTransition(null)} />}</>
  if (loadingLesson) return <><LessonLoading title={getLesson(loadingLesson)?.title ?? nextLesson?.title ?? 'Your lesson'} />{pageTransition && <PageWipe onCovered={pageTransition.onCovered} onDone={() => setPageTransition(null)} />}</>

  return (
    <div className="min-h-screen bg-[#121214] font-rubik [[data-theme=light]_&]:bg-[#fafaf8]">
      {showChrome && (
      <header className="sticky top-0 z-30 flex items-center w-full h-16 px-[max(22px,calc((100vw-1160px)/2))] max-[680px]:px-4 border-b border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] bg-[#121214]/95 [[data-theme=light]_&]:bg-white/95 backdrop-blur-md">
        {/* Devspace logo */}
        <button
          data-cuelume-press="pulse"
          data-cuelume-release="release"
          className="flex items-center p-0 border-0 bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72]"
          onClick={() => setActive('Home')}
          aria-label="Devspace home"
        >
          <img className="hidden w-[129px] h-[19px] min-[681px]:block [[data-theme=light]_&]:brightness-0" src="/assets/logo.svg" alt="Devspace" />
          <span className="block h-5 w-[33px] overflow-hidden min-[681px]:hidden mr-6 min-[420px]:mr-8 min-[540px]:mr-10">
            <img className="h-5 w-[135px] max-w-none [[data-theme=light]_&]:brightness-0" src="/assets/logo.svg" alt="Devspace" />
          </span>
        </button>

        {/* Mobile navigation tabs with active underline indicator */}
        <nav className="flex items-center gap-1 sm:gap-1.5 min-[681px]:hidden" aria-label="Mobile navigation">
          {[
            {
              id: 'Home',
              label: 'Home',
              Icon: HomeIcon,
              activeColor: 'text-[#6699ec] [[data-theme=light]_&]:text-[#2563eb]',
              barColor: 'bg-[#6699ec] [[data-theme=light]_&]:bg-[#2563eb]',
            },
            {
              id: 'Paths',
              label: 'Paths',
              Icon: CompassIcon,
              activeColor: 'text-[#04adc0] [[data-theme=light]_&]:text-[#028492]',
              barColor: 'bg-[#04adc0] [[data-theme=light]_&]:bg-[#028492]',
            },
            {
              id: 'Leaderboard',
              label: 'Ranks',
              Icon: PodiumIcon,
              activeColor: 'text-[#e0507a] [[data-theme=light]_&]:text-[#c22d56]',
              barColor: 'bg-[#e0507a] [[data-theme=light]_&]:bg-[#c22d56]',
            },
            {
              id: 'Practice',
              label: 'Practice',
              Icon: DumbbellIcon,
              activeColor: 'text-[#f5a623] [[data-theme=light]_&]:text-[#d97706]',
              barColor: 'bg-[#f5a623] [[data-theme=light]_&]:bg-[#d97706]',
            },
          ].map(({ id, label, Icon, activeColor, barColor }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                type="button"
                data-cuelume-toggle
                className={`relative flex h-16 items-center px-1.5 min-[380px]:px-2.5 border-0 bg-transparent transition-colors focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] ${
                  isActive
                    ? activeColor
                    : 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-800'
                }`}
                onClick={() => { setActive(id); setPathsInitialView(null); setPathsInitialSelectedId(null) }}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="size-[22px] max-[360px]:size-5" />
                {isActive && (
                  <span
                    className={`absolute inset-x-1 bottom-0 h-[3px] rounded-full ${barColor}`}
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Desktop text navigation */}
        <nav className="hidden min-[681px]:flex gap-6 ml-12 mr-auto" aria-label="Primary navigation">
          {['Home', 'Paths', 'Leaderboard', 'Practice'].map((item) => {
            const isActive = active === item
            return (
              <button
                key={item}
                data-cuelume-hover="tick"
                data-cuelume-toggle
                className={
                  isActive
                    ? "relative h-16 px-0.5 border-0 bg-transparent text-sm font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#6699ec] focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72]"
                    : "relative h-16 px-0.5 border-0 bg-transparent text-sm font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-700 after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72]"
                }
                onClick={() => { setActive(item); setPathsInitialView(null); setPathsInitialSelectedId(null) }}
              >
                {item}
              </button>
            )
          })}
        </nav>

        {/* Stats on the right — hidden on mobile, where the same numbers
            show at the top of the page's own content instead (Home). */}
        <div className="flex items-center gap-3.5 sm:gap-3 ml-auto">
          <div className="relative max-[680px]:hidden">
            <button
              ref={streakButtonRef}
              type="button"
              className={`relative inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer font-[inherit] transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] max-[680px]:h-auto max-[680px]:!bg-transparent max-[680px]:!border-0 max-[680px]:px-1 max-[680px]:text-[14px] max-[680px]:font-bold min-[681px]:h-[34px] min-[681px]:rounded-full min-[681px]:border min-[681px]:px-3 min-[681px]:text-[13px] min-[681px]:font-semibold ${
                streakAtRisk
                  ? 'max-[680px]:text-red-500 [[data-theme=light]_&]:max-[680px]:text-red-600 min-[681px]:border-red-400/80 min-[681px]:bg-red-500/10 min-[681px]:text-red-200 min-[681px]:hover:bg-red-500/15 [[data-theme=light]_&]:min-[681px]:border-red-400 [[data-theme=light]_&]:min-[681px]:bg-red-50 [[data-theme=light]_&]:min-[681px]:text-red-700 [[data-theme=light]_&]:min-[681px]:hover:bg-red-100'
                  : 'max-[680px]:text-[#f4f4f2] [[data-theme=light]_&]:max-[680px]:text-neutral-900 min-[681px]:border-[#404040] min-[681px]:bg-[#262626] min-[681px]:text-[#f4f4f2] min-[681px]:hover:border-[#9a9a9d] [[data-theme=light]_&]:min-[681px]:border-[#eeeeeb] [[data-theme=light]_&]:min-[681px]:bg-white [[data-theme=light]_&]:min-[681px]:text-neutral-800 [[data-theme=light]_&]:min-[681px]:hover:border-[#686968]'
              }`}
              onClick={() => {
                setActivePopover(null)
                setStreakJourneyOpen(true)
              }}
              aria-haspopup="dialog"
              aria-expanded={streakJourneyOpen}
              aria-controls="streak-journey-dialog"
              aria-label={streakAtRisk ? `Open streak journey. ${streakDays} day streak. Activity required today.` : activeToday ? `Open streak journey. ${streakDays} day streak. Today complete.` : 'Open streak journey and start your streak.'}
            >
              {streakAtRisk ? <SirenIcon className="size-4 max-[680px]:size-[18px]" /> : <AnimatedBoltIcon className="size-4 max-[680px]:size-[18px] text-[#f5a623]" />}
              <span aria-hidden="true">{streakDays}</span>
              {streakAtRisk && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#121214] bg-red-400 motion-safe:animate-pulse [[data-theme=light]_&]:border-white" aria-hidden="true" />}
            </button>
          </div>

          <div className="relative max-[680px]:hidden">
            <button
              ref={xpButtonRef}
              type="button"
              className={`inline-flex items-center gap-1 sm:gap-[5px] cursor-pointer font-[inherit] transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] max-[680px]:h-auto max-[680px]:!bg-transparent max-[680px]:!border-0 max-[680px]:px-1 max-[680px]:text-[14px] max-[680px]:font-bold min-[681px]:h-[34px] min-[681px]:border min-[681px]:rounded-full min-[681px]:px-3 min-[681px]:text-[13px] min-[681px]:font-semibold min-[681px]:bg-[#262626] [[data-theme=light]_&]:min-[681px]:bg-white ${
                activePopover === 'xp'
                  ? 'max-[680px]:text-[#6699ec] min-[681px]:border-[#6699ec] min-[681px]:text-[#f4f4f2] [[data-theme=light]_&]:min-[681px]:text-neutral-800'
                  : 'max-[680px]:text-[#f4f4f2] [[data-theme=light]_&]:max-[680px]:text-neutral-900 min-[681px]:border-[#404040] min-[681px]:text-[#9a9a9d] min-[681px]:hover:border-[#9a9a9d] [[data-theme=light]_&]:min-[681px]:border-[#eeeeeb] [[data-theme=light]_&]:min-[681px]:text-[#686968] [[data-theme=light]_&]:min-[681px]:hover:border-[#686968]'
              }`}
              onClick={() => setActivePopover((current) => (current === 'xp' ? null : 'xp'))}
              aria-haspopup="dialog"
              aria-expanded={activePopover === 'xp'}
            >
              <AnimatedGemIcon className="w-3.5 h-3.5 max-[680px]:w-4 max-[680px]:h-4 text-[#8b7cf6] [[data-theme=light]_&]:text-[#6699ec]" />
              <span aria-hidden="true">{xp}</span>
              <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">{xp} XP</span>
            </button>
            {activePopover === 'xp' && (
              <div ref={popoverRef}>
                <XpPopover earnedToday={getDailyXp(progress)} xpGoal={xpGoal} />
              </div>
            )}
          </div>

          <button
            ref={menuButtonRef}
            data-cuelume-toggle
            className="min-w-9 min-h-9 sm:min-w-11 sm:min-h-11 p-1 sm:p-2 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[20px] sm:text-[21px] border-0 bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72]"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close account menu' : 'Open account menu'}
            aria-expanded={menuOpen}
          >
            ☰
          </button>
        </div>

        {menuOpen && (
          <div
            className="account-menu absolute z-[5] top-14 right-[max(22px,calc((100vw-1160px)/2))] max-[680px]:right-[18px] grid min-w-[216px] gap-0.5 p-2 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-[14px] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white shadow-[0_18px_44px_rgba(0,0,0,.42)] [[data-theme=light]_&]:shadow-[0_18px_44px_rgba(20,20,20,.14)]"
            ref={menuRef}
            role="menu"
          >
            <button className="flex min-h-11 items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:bg-[#262b34] [[data-theme=light]_&]:hover:bg-[#f0f5fd]" role="menuitem" onClick={() => { setActive('Profile'); setPublicProfileView(false); setMenuOpen(false) }}><span className="grid size-5 place-items-center text-[17px]" aria-hidden="true">♙</span>Profile</button>
            <button className="flex min-h-11 items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:bg-[#262b34] [[data-theme=light]_&]:hover:bg-[#f0f5fd]" role="menuitem" onClick={() => { setActive('Profile'); setPublicProfileView(true); setMenuOpen(false) }}><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" /></svg>Public profile</button>
            <button className="flex min-h-11 items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:bg-[#262b34] [[data-theme=light]_&]:hover:bg-[#f0f5fd]" role="menuitem" onClick={() => { openPlans(); setMenuOpen(false) }}><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6.5 6.5 9 9M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>Devspace Pro</button>
            <div className="my-1 border-t border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb]" role="separator" />
            <button className="flex min-h-11 items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:bg-[#262b34] [[data-theme=light]_&]:hover:bg-[#f0f5fd]" role="menuitem" onClick={() => { setActive('Settings'); setMenuOpen(false) }}><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M12 3v2M12 19v2M21 12h-2M5 12H3M18.4 5.6 17 7M7 17l-1.4 1.4M18.4 18.4 17 17M7 7 5.6 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>Settings</button>
            <button className="flex min-h-11 items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:bg-[#262b34] [[data-theme=light]_&]:hover:bg-[#f0f5fd]" role="menuitem" onClick={() => { toggleTheme(); setMenuOpen(false) }}><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
            <button className="flex min-h-11 items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:bg-[#262b34] [[data-theme=light]_&]:hover:bg-[#f0f5fd]" role="menuitem" onClick={() => { showNotice('Support is coming soon'); setMenuOpen(false) }}><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" /><path d="M9.8 9a2.3 2.3 0 1 1 3.9 1.7c-.9.8-1.7 1.2-1.7 2.5M12 16.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>Help / Report a problem</button>
            <div className="my-1 border-t border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb]" role="separator" />
            <button className="flex min-h-11 items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:bg-[#262b34] [[data-theme=light]_&]:hover:bg-[#f0f5fd]" role="menuitem" onClick={() => { showNotice('Signed out'); setMenuOpen(false) }}><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 5H5v14h5M14 8l4 4-4 4M9 12h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>Sign out</button>
          </div>
        )}
      </header>
      )}
      <main className={active === 'Plans' ? 'min-h-screen' : active === 'Home' ? '' : 'w-[min(100%,1160px)] mx-auto pt-8 px-[22px] max-[900px]:px-[18px] pb-[72px] max-[680px]:pt-6 max-[680px]:px-[18px] max-[680px]:pb-10'}>
        {active === 'Paths' ? (
          <PathsView
            currentLearnerPath={currentPath}
            completedLessons={completedLessons}
            onOpenLesson={launchLesson}
            onChooseFramework={chooseFrontendFramework}
            initialView={pathsInitialView}
            initialSelectedPathId={pathsInitialSelectedId}
            customPaths={customPaths}
            primaryPathId={profile?.pathId}
            profile={profile}
            onCreateCustomPath={createCustomPath}
            onSwitchPrimaryPath={resumePath}
            hasSeenCustomPathIntroduction={Boolean(seenPageIntroductions?.['custom-path'])}
            onDismissCustomPathIntroduction={() => dismissPageIntroduction('custom-path')}
            onFullScreenChange={setCustomPathFullScreen}
          />
        ) : active === 'Settings' ? (
          <SettingsView
            theme={theme}
            onToggleTheme={toggleTheme}
            onNotice={showNotice}
            email="devspaceglobal@gmail.com"
            progress={progress}
            onOpenPlans={openPlans}
            onOpenPayouts={() => setActive('Payouts')}
            onOpenProfile={() => setActive('Profile')}
            onUpdateDailyMinutes={(minutes) => saveProfileFields({ dailyMinutes: minutes })}
          />
        ) : active === 'Payouts' ? (
          <PayoutCenter
            rewardBalance={progress.rewardBalance}
            lifetimeRewards={progress.lifetimeRewards}
            seasonRewardHistory={progress.seasonRewardHistory}
            payoutHistory={progress.payoutHistory}
            payoutProfile={progress.payoutProfile}
            onBack={() => setActive('Settings')}
            onRequestPayout={requestPayout}
            onSavePayoutProfile={savePayoutProfile}
          />
        ) : active === 'Profile' ? (
          <ProfileView
            profile={profile}
            progress={progress}
            currentPath={currentPath}
            pathProgress={derived}
            onSaveProfile={saveProfileFields}
            onStartLearning={() => { setActive('Paths'); setPathsInitialView(null); setPathsInitialSelectedId(null) }}
            isLoading={profileLoading}
            isPublicView={publicProfileView}
            onTogglePublicView={setPublicProfileView}
          />
        ) : active === 'Plans' ? (
          <PlansView progress={progress} onActivate={startPremium} onCancel={endPremium} highlightPerk={plansHighlight} onBack={() => setActive('Home')} />
        ) : active === 'Leaderboard' ? (
          <LeaderboardView
            seasonCoins={seasonCoins}
            xp={xp}
            leagueIndex={leagueIndex}
            lastLeagueResult={lastLeagueResult}
            progress={progress}
            onDismissResult={dismissLeagueResult}
            onStartPractice={() => setActive('Practice')}
            onOpenPlans={openPlans}
            hasSeenIntroduction={Boolean(seenPageIntroductions?.leaderboard)}
            onDismissIntroduction={() => dismissPageIntroduction('leaderboard')}
            onDismissSubIntroduction={dismissPageIntroduction}
            onCreatePrivateLeague={createPrivateLeague}
            onJoinPrivateLeague={joinPrivateLeague}
            onLeavePrivateLeague={leavePrivateLeague}
            onRemovePrivateLeagueMember={removePrivateLeagueMember}
            onRenamePrivateLeague={renamePrivateLeague}
            onRegeneratePrivateLeagueCode={regeneratePrivateLeagueCode}
            onChooseH2HOpponent={chooseH2HOpponent}
          />
        ) : active === 'Practice' ? (
          <PracticeView
            onStart={setOpenPractice}
            completedSessions={completedSessions}
            currentPath={currentPath}
          />
        ) : (
          <HomeView
            onStartMission={startMission}
            onOpenCareerPath={() => setActive('Paths')}
            onOpenDevyPro={openPlans}
            onOpenLeaderboard={() => setActive('Leaderboard')}
            onOpenPlans={openPlans}
            onSeeAllPractice={() => setActive('Practice')}
            onOpenDevy={(prompt) => setDevyOpen(prompt || true)}
            onOpenPath={openPathFromHome}
            onStartPractice={setOpenPractice}
            onOpenProfile={() => setActive('Profile')}
            profile={profile}
            longestStreak={longestStreak}
            completedSessions={completedSessions}
            lessonDoneToday={Object.values(completedLessons).some((entry) => entry?.completedAt === new Date().toDateString())}
            currentPath={currentPath}
            courseOptions={courseOptions}
            completedLessonsCount={Object.keys(completedLessons).length}
            pathTools={currentPath.tools ?? []}
            leagueName={currentLeague.name}
            leagueColor={currentLeague.color}
            leagueRank={leagueRank}
            leagueRankDelta={leagueRankDelta}
            leagueNeighbors={leagueNeighbors}
            leagueNeighborsWide={leagueNeighborsWide}
            coinsToNextRank={coinsToNextRank}
            coinsToPromotion={coinsToPromotion}
            inPromotionZone={inPromotionZone}
            canPromote={currentLeague.promotePercent > 0}
            promoteCount={promoteCount}
            streakDays={streakDays}
            xp={xp}
            dailyXp={getDailyXp(progress)}
            xpGoal={xpGoal}
            seasonTimeLeft={seasonTimeLeft}
            seasonCoins={seasonCoins}
            dynamicUpdate={dynamicUpdate}
          />
        )}
      </main>

      {!openLesson && active !== 'Plans' && active !== 'Home' && !customPathFullScreen && (
        <div className="fixed right-6 bottom-6 z-20 grid justify-items-end gap-3 max-[900px]:right-[18px] max-[900px]:bottom-[18px]">
          <button type="button" className="grid size-16 place-items-center rounded-full border border-[#525252] bg-[#303030] p-2 shadow-[0_4px_0_#171717] transition-[background,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#404040] active:translate-y-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 [[data-theme=light]_&]:border-[#b8b8b8] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_4px_0_#d4d4d4] [[data-theme=light]_&]:hover:bg-[#f5f5f4]" onClick={() => setDevyOpen(true)} aria-expanded={Boolean(devyOpen)} aria-controls="devy-drawer" aria-label="Ask Devy">
            <DevyLottie clip="thinking" className="size-full" />
          </button>
        </div>
      )}

      {devyOpen && <>
        <button type="button" className="fixed inset-0 z-40 cursor-default bg-black/30" onClick={() => setDevyOpen(false)} aria-label="Close Devy" />
        <DevyDrawer page={active} pathTitle={currentPath.title} nextLesson={nextLesson?.title} initialPrompt={typeof devyOpen === 'string' ? devyOpen : undefined} onClose={() => setDevyOpen(false)} />
      </>}

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

      {notice && <div className="fixed z-10 right-6 bottom-6 max-[680px]:right-[18px] max-[680px]:bottom-[18px] max-[680px]:left-[18px] max-[680px]:text-center px-4 py-3 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-[10px] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-[13px]" role="status">{notice}</div>}

      {openLesson && <LessonView key={String(openLesson)} lessonId={openLesson} navigationStyle="segments" onExit={() => setOpenLesson(null)} onComplete={recordLessonCompletion} profile={profile} xp={xp} />}
      {/* Rendered after LessonView so it lands on top of the lesson the learner
          just finished, rather than behind it. */}
      {leagueCelebration && (
        <LeagueQualifiedCelebration
          leagueIndex={leagueCelebration.leagueIndex}
          seasonCoins={leagueCelebration.seasonCoins}
          onClose={dismissLeagueCelebration}
        />
      )}
      {roadmapTransition && (
        <RoadmapTransition
          transition={roadmapTransition}
          onStartLesson={startNextRegionLesson}
          onViewRoadmap={viewRoadmapFromTransition}
          onExploreRoadmaps={exploreRoadmapsFromTransition}
          onReviewRoadmap={viewRoadmapFromTransition}
        />
      )}
      {streakMilestone && (
        <StreakMilestoneTransition
          milestone={streakMilestone}
          onContinue={dismissStreakMilestone}
          onViewJourney={viewJourneyFromMilestone}
        />
      )}
      {openPractice && <PracticeSession sessionId={openPractice} completion={completedSessions[openPractice]} xpAward={getPracticeXpAward(progress, openPractice)} onExit={() => setOpenPractice(null)} onComplete={recordPracticeCompletion} />}
      {pageTransition && <PageWipe onCovered={pageTransition.onCovered} onDone={() => setPageTransition(null)} />}
    </div>
  )
}

// Every CSS animation in styles.css sits behind a prefers-reduced-motion
// guard; motion's JS-driven ones need telling separately, so the setting is
// honoured the same way whichever way an animation happens to be built.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
