import { motion, MotionConfig } from 'motion/react';
import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StreakJourneyModal } from './components/header/StreakJourneyModal';
import { XpPopover } from './components/header/XpPopover';
import { ShortSessionRow } from './components/home/ShortSessionRow';
import LeaderboardView from './components/leaderboard';
import { LeagueQualifiedCelebration } from './components/leaderboard/LeagueQualifiedCelebration';
import { getLesson } from './components/lesson/lessonContent';
import { getConceptRecallQuestion } from './components/lesson/lessonFlow';
import { LessonLoading } from './components/lesson/LessonLoading';
import LessonView from './components/lesson/LessonView';
import { RecallCheckModal } from './components/lesson/RecallCheckModal';
import { AvatarPickerModal } from './components/profile/AvatarPickerModal';
import { ReviewReminderCard } from './components/home/ReviewReminderCard';
import { StreakMilestoneCelebration } from './components/header/StreakMilestoneCelebration';
import { SilverPassCelebration } from './components/leaderboard/SilverPassCelebration';
import { SeasonRecapView } from './components/leaderboard/SeasonRecapView';
import OnboardingView from './components/onboarding';
import { FirstLessonWelcome } from './components/onboarding/FirstLessonWelcome';
import PathsView from './components/paths';
import { RoadmapTransition } from './components/paths/RoadmapTransition';
import PlansView from './components/plans';
import PracticeView from './components/practice';
import { PracticeSession } from './components/practice/PracticeSession';
import ProfileView from './components/profile';
import RewardsView from './components/rewards/RewardsView';
import SettingsView from './components/settings';
import { ActionButton } from './components/ui/ActionButton';
import { AnimatedBoltIcon, AnimatedGemIcon } from './components/ui/AnimatedIcons';
import { Badge } from './components/ui/Badge';
import { DevyDrawer } from './components/ui/DevyDrawer';
import { DevyMood } from './components/ui/DevyMood';
import { BoltIcon, CoinIcon, SirenIcon } from './components/ui/icons';
import { InfoTooltip } from './components/ui/InfoTooltip';
import { getLeague } from './data/leagues';
import { buildCustomPathRecord, getPath } from './data/paths';
import { practiceSessions } from './data/practice';
import { activatePremium, addCoins, applyActivity, CONCEPT_COIN_AWARD, deactivatePremium, getDailyXp, getPracticeXpAward, LESSON_COIN_AWARD, loadProgress, markPageIntroductionSeen, PRACTICE_COIN_AWARD, recordConceptMastery, saveCustomPath, saveProgress, setAvatarChoice, setPayoutMethod, switchPrimaryPath } from './data/progress';
import { getStandings, getZoneSummary, resolveSeason, USER_ID } from './lib/leagueSim';
import { LESSON_XP } from './lib/lessonMeta';
import { sanitizeLeagueAccess } from './lib/leagueAccess';
import { buildSeasonRecap } from './lib/seasonRecap';
import { findDueConcepts, parseConceptKey } from './lib/mastery';
import { computeDailyGoal } from './lib/onboarding';
import { advancePayout, confirmDueRewards, createRewardEntry, requestPayout } from './lib/payouts';
import { deriveLessonCompletionTransition, derivePathProgress } from './lib/pathProgress';
import { findNewestMilestone, getStreakEra, getStreakMessage, getStreakWeek, isActiveToday, WEEK_LENGTH } from './lib/streak';
import { formatTimeRemaining, getSeasonIndex, getSeasonTimeRemaining, getWeekIndex, now } from './lib/week';
import './styles.css';
import './tailwind.css';

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
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [progress, setProgress] = useState(loadProgress)
  const [plansHighlight, setPlansHighlight] = useState(null)
  const [publicProfileView, setPublicProfileView] = useState(false)
  const [pathsInitialView, setPathsInitialView] = useState(null)
  const [customPathFullScreen, setCustomPathFullScreen] = useState(false)
  const [leagueCelebration, setLeagueCelebration] = useState(null)
  const [roadmapTransition, setRoadmapTransition] = useState(null)
  // Which concept's recall-check modal is open, if any — separate from
  // `dueReview` below, since the due concept can keep changing underneath an
  // already-open modal without closing it.
  const [reviewPrompt, setReviewPrompt] = useState(null)
  // The streak tier just crossed, if any — set by checkStreakMilestone right
  // after any applyActivity call, so the splash only ever fires once per
  // crossing rather than re-deriving "is this new" from render state.
  const [streakCelebration, setStreakCelebration] = useState(null)
  // The fullscreen "you earned a Silver League Pass" moment — set only the
  // one season a top-10 Bronze finish actually grants a fresh pass (see
  // resolveSeason's passJustGranted), never on a season that merely spends
  // one earned earlier.
  const [silverPassCelebration, setSilverPassCelebration] = useState(null)
  // Opened on demand from the "View season recap" link on the last result —
  // never auto-popped, so it never has to compete with the pass celebration
  // or the roadmap transition for the screen.
  const [seasonRecapOpen, setSeasonRecapOpen] = useState(false)
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

  // Settle any finished season before the leaderboard renders, so promotion,
  // demotion, and Silver+ access have already been applied by first paint. A
  // season that paid a reward opens a review entry here — the money doesn't
  // reach Reward Balance until confirmDueRewards below closes that review
  // out. `leagueIndex` here already reflects the access gate (lib/leagueAccess.js)
  // — a rank-earned promotion into a Pro-gated league without access lands
  // back in Bronze, with the achievement itself kept in `highestQualifiedLeagueIndex`.
  useEffect(() => {
    setProgress((current) => {
      const result = resolveSeason(current, now())
      if (!result) return current
      const next = {
        ...current,
        seasonIndex: getSeasonIndex(now()),
        seasonDevyCoins: 0,
        leagueIndex: result.nextLeagueIndex,
        lastLeagueResult: result,
        rewardHistory: [...(current.rewardHistory ?? []), createRewardEntry(result, now())],
        leaguePasses: result.leaguePasses,
        highestQualifiedLeagueIndex: result.highestQualifiedLeagueIndex,
        leagueAccessGrantedForSeason: result.leagueAccessGrantedForSeason,
      }
      if (result.passJustGranted) {
        setSilverPassCelebration({ rank: result.rank, usedImmediately: result.accessVia === 'pass' })
      }
      saveProgress(next)
      return next
    })
  }, [])

  // Self-heals a `leagueIndex` that doesn't match a grant recorded for the
  // season in progress — catches a tampered or stale value the gate above
  // never actually produced, without disturbing a learner mid-season just
  // because Pro happened to lapse after they legitimately entered (see
  // sanitizeLeagueAccess). Runs once per load, not continuously — a
  // continuous check would eject that mid-season learner immediately instead
  // of letting them finish the season they're already in.
  useEffect(() => {
    setProgress((current) => {
      const next = sanitizeLeagueAccess(current, getSeasonIndex(now()))
      if (next === current) return current
      saveProgress(next)
      return next
    })
  }, [])

  // Confirms any reward whose review window has closed and advances any
  // payout in flight — both run off elapsed time, the same way resolveSeason
  // settles a season without ever having "waited" for it in real time. Ticks
  // on the same interval the leaderboard's own clock uses, so the two never
  // visibly disagree about what time it is.
  useEffect(() => {
    const settle = () => {
      setProgress((current) => {
        const next = advancePayout(confirmDueRewards(current, now()), now())
        if (next === current) return current
        saveProgress(next)
        return next
      })
    }
    settle()
    const id = window.setInterval(settle, 60 * 1000)
    return () => window.clearInterval(id)
  }, [])

  // Fires the one-time streak splash the moment a tier is crossed — called
  // from inside each setProgress updater right after applyActivity, the same
  // place setLeagueCelebration/setRoadmapTransition already fire their own
  // one-time screens from.
  const checkStreakMilestone = (previous, next) => {
    const milestone = findNewestMilestone(previous.earnedStreakMilestones, next.earnedStreakMilestones)
    if (milestone) setStreakCelebration({ streakDays: next.streakDays, milestone })
  }

  const recordActivity = (xpGain) => {
    setProgress((current) => {
      const next = applyActivity(current, xpGain)
      checkStreakMilestone(current, next)
      saveProgress(next)
      return next
    })
  }

  const recordPracticeCompletion = (sessionId, correctCount, total) => {
    setProgress((current) => {
      const today = new Date().toDateString()
      // The award rule lives in data/progress so the results screen can state
      // the same number this banks — completedAt is overwritten every time, so
      // a same-day retry can never be double-counted.
      const isFirstCompletion = !current.completedSessions?.[sessionId]
      const withActivity = applyActivity(current, getPracticeXpAward(current, sessionId, today), today)
      const withCoins = isFirstCompletion ? addCoins(withActivity, PRACTICE_COIN_AWARD) : withActivity
      const next = {
        ...withCoins,
        completedSessions: {
          ...current.completedSessions,
          [sessionId]: { correctCount, total, completedAt: today },
        },
      }
      checkStreakMilestone(current, next)
      saveProgress(next)
      return next
    })
  }

  const recordLessonCompletion = (completedLessonId) => {
    setProgress((current) => {
      const today = new Date().toDateString()
      // First completion earns XP; replays still update the record.
      const isFirstCompletion = !current.completedLessons?.[completedLessonId]
      const withActivity = applyActivity(current, isFirstCompletion ? LESSON_XP : 0, today)
      const withCoins = isFirstCompletion ? addCoins(withActivity, LESSON_COIN_AWARD) : withActivity
      const next = {
        ...withCoins,
        completedLessons: { ...current.completedLessons, [completedLessonId]: { completedAt: today } },
      }
      checkStreakMilestone(current, next)

      // A region's `state` only flips to 'completed' once every lesson in it
      // has — comparing before/after catches exactly the completion that
      // crosses that line, region-by-region rather than lesson-by-lesson.
      // Only checked on a genuine first completion, so replaying an already
      // finished lesson can't re-trigger the transition screen.
      const transition = isFirstCompletion
        ? deriveLessonCompletionTransition(currentPath, current.completedLessons, next.completedLessons)
        : null
      if (transition) setRoadmapTransition(transition)

      // Any Devy Coins put a learner on the board (LeaderboardView gates on
      // `seasonDevyCoins > 0`), and a first lesson completion already awards
      // some — so the crossing itself usually happens before the lesson is
      // done. Rather than fire mid-lesson, the celebration waits for the end
      // of the lesson: the first completion that finds the learner already on
      // the board, once ever. A roadmap transition takes the screen first
      // when both happen on the same completion — the league celebration
      // queues and fires only once that transition closes, rather than
      // stacking on top of it.
      const isOnBoard = next.seasonDevyCoins > 0
      const alreadyCelebrated = Boolean(current.seenPageIntroductions?.['league-qualified'])
      if (isOnBoard && !alreadyCelebrated) {
        const celebration = { leagueIndex: next.leagueIndex, seasonDevyCoins: next.seasonDevyCoins }
        if (transition) pendingLeagueCelebrationRef.current = celebration
        else setLeagueCelebration(celebration)
        const seen = markPageIntroductionSeen(next, 'league-qualified')
        saveProgress(seen)
        return seen
      }
      saveProgress(next)
      return next
    })
    showNotice(`Lesson complete · +${LESSON_XP} XP`)
  }

  // The hidden counterpart to recordLessonCompletion — a single question's
  // outcome feeds the learning-evidence signal in lib/mastery.js. Deliberately
  // untangled from applyActivity: mastery never touches XP or streak. Coins
  // are the one visible reward tied to this moment, for a clean answer only —
  // a retry-then-correct still resolves the question but earns nothing extra.
  const recordQuestionOutcome = (lessonId, conceptId, outcome) => {
    setProgress((current) => {
      const withMastery = recordConceptMastery(current, lessonId, conceptId, outcome)
      const next = outcome.firstTryCorrect ? addCoins(withMastery, CONCEPT_COIN_AWARD) : withMastery
      saveProgress(next)
      return next
    })
  }

  const handleSetPayoutMethod = (method) => {
    setProgress((current) => {
      const next = setPayoutMethod(current, method)
      saveProgress(next)
      return next
    })
  }

  const handleRequestPayout = () => {
    setProgress((current) => {
      const next = requestPayout(current, now())
      saveProgress(next)
      return next
    })
  }

  // The celebration sits on top of the finished lesson, so continuing has to
  // close the lesson too — otherwise dismissing it drops back into the lesson
  // the learner had already completed.
  const dismissLeagueCelebration = () => {
    setLeagueCelebration(null)
    setOpenLesson(null)
    setActive('Leaderboard')
  }

  // Closes the lesson underneath the transition and hands off to any league
  // celebration that queued while it was on screen, so a qualifying moment
  // is never silently dropped — it just waits its turn.
  const dismissRoadmapTransition = () => {
    setRoadmapTransition(null)
    setOpenLesson(null)
    if (pendingLeagueCelebrationRef.current) {
      setLeagueCelebration(pendingLeagueCelebrationRef.current)
      pendingLeagueCelebrationRef.current = null
    }
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
    setActive('Paths')
  }

  const exploreRoadmapsFromTransition = () => {
    dismissRoadmapTransition()
    setPathsInitialView(null)
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
  const saveProfileFields = (fields) => {
    setProgress((current) => {
      const next = { ...current, profile: { ...current.profile, ...fields } }
      saveProgress(next)
      return next
    })
    showNotice('Profile updated')
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
    setProgress((current) => {
      const next = { ...current, profile: nextProfile }
      if (!current.seenPageIntroductions?.['avatar-picker']) {
        setShowAvatarPicker(true)
        const seen = markPageIntroductionSeen(next, 'avatar-picker')
        saveProgress(seen)
        return seen
      }
      saveProgress(next)
      return next
    })
    setShowFirstLessonWelcome(true)
  }

  // Covers all three lesson-exit paths (finish, leave, cancel) since
  // LessonView funnels every one of them through this single onExit call.
  // Gated the same way as the league-qualified celebration above: fires once
  // ever, whichever of onboarding-complete or this fires first.
  const handleLessonExit = () => {
    setOpenLesson(null)
    setProgress((current) => {
      if (current.seenPageIntroductions?.['avatar-picker']) return current
      setShowAvatarPicker(true)
      const seen = markPageIntroductionSeen(current, 'avatar-picker')
      saveProgress(seen)
      return seen
    })
  }

  const saveAvatarChoice = ({ avatarStyle, avatarSeed, name }) => {
    setProgress((current) => {
      const next = setAvatarChoice(current, { avatarStyle, avatarSeed, ...(name ? { name } : {}) })
      saveProgress(next)
      return next
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
    if (!wasStarted) recordActivity(10)
    showNotice(wasStarted ? 'Mission ready to continue' : 'Mission started')
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    showNotice(`${nextTheme === 'light' ? 'Light' : 'Dark'} mode enabled`)
  }

  const { xp, seasonDevyCoins, streakDays, leagueIndex, lastLeagueResult, completedSessions, completedLessons, lastActiveDate, longestStreak, streakRestoreCredits, streakActivityDates, earnedStreakMilestones, lastStreakProtection, profile, customPaths, pathHistory, seenPageIntroductions, masteryByConcept, devyCoins } = progress

  // Captures the rank a learner had the first moment they had any coins on
  // the board this season — the "before" half of the season recap's
  // rank-change card. Set once per season and never overwritten, so a busy
  // first day doesn't keep moving the starting line.
  //
  // Guarded entirely on `current` inside the updater, not on the closed-over
  // `seasonDevyCoins` — this effect and the season-resolution one above both
  // run in the same commit on mount, in declaration order. If resolution runs
  // first and resets the season, this effect's *closure* still sees the old
  // season's now-stale coin total, but its updater sees the fresh
  // post-resolution state — reading `current.seasonDevyCoins` for the guard
  // is what stops it from stamping a bogus day-one snapshot onto the season
  // that just started, overwriting the real one for the season that just ended.
  useEffect(() => {
    setProgress((current) => {
      if (current.seasonDevyCoins <= 0) return current
      if (current.seasonStartRank?.seasonIndex === current.seasonIndex) return current
      const standings = getStandings(current.seasonIndex, current.leagueIndex, current.seasonDevyCoins, now())
      const rank = getZoneSummary(standings, current.leagueIndex).user.rank
      const next = { ...current, seasonStartRank: { seasonIndex: current.seasonIndex, rank } }
      saveProgress(next)
      return next
    })
  }, [seasonDevyCoins, leagueIndex])

  // Onboarding picks the path; before that, the default shelf is the spine.
  // A learner-generated custom path takes priority when it's the primary one.
  const currentPath = customPaths?.[profile?.pathId] ?? getPath(profile?.pathId)

  // Gated by an explicit env flag (see .env.development) rather than the
  // implicit import.meta.env.DEV, so it can be turned off without a code
  // change. Stays a compile-time constant Vite dead-code-eliminates wherever
  // the flag isn't 'true' — a production `vite build` never reads
  // .env.development either way, so this is out of shipped builds regardless.
  const testHooksEnabled = import.meta.env.VITE_ENABLE_TEST_HOOKS === 'true'

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
  const streakEra = getStreakEra(streakDays)
  const streakMessage = getStreakMessage(streakDays, activeToday)
  const homeStandings = useMemo(() => {
    const standings = getStandings(getSeasonIndex(now()), leagueIndex, seasonDevyCoins, now())
    const leaders = standings.slice(0, 3)
    const learner = standings.find((entry) => entry.id === USER_ID)
    return leaders.some((entry) => entry.id === USER_ID) ? leaders : [...leaders, learner]
  }, [leagueIndex, seasonDevyCoins])

  // Built once per result rather than on every render — a season only ever
  // resolves once, so this only recomputes when there's actually a new one.
  const seasonRecap = useMemo(
    () => (lastLeagueResult ? buildSeasonRecap(lastLeagueResult, { masteryByConcept, seasonStartRank: progress.seasonStartRank }) : null),
    [lastLeagueResult, masteryByConcept, progress.seasonStartRank],
  )

  // The single most-overdue concept, if any — resolved down to an actual
  // question so a stale key (content since renamed or removed) fails closed
  // instead of surfacing a broken review card.
  const dueReview = useMemo(() => {
    const [first] = findDueConcepts(masteryByConcept, new Date().toDateString())
    if (!first) return null
    const { lessonId, conceptId } = parseConceptKey(first.conceptKey)
    const lesson = getLesson(lessonId)
    const concept = lesson?.concepts?.find((candidate) => candidate.id === conceptId)
    if (!concept) return null
    const question = getConceptRecallQuestion(lesson, conceptId)
    if (!question) return null
    return { lessonId, conceptId, conceptTitle: concept.title, question }
  }, [masteryByConcept])

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

  // Unfinished sessions prioritizing the learner's active path topic and tools
  const homePracticeSessions = useMemo(() => {
    const activeTools = (currentPath?.tools ?? []).map((t) => t.toLowerCase())
    const pathTitle = (currentPath?.title ?? '').toLowerCase()

    const isRecommended = (session) => {
      const topicLower = session.topic.toLowerCase()
      return activeTools.some((tool) => tool.includes(topicLower) || topicLower.includes(tool))
        || pathTitle.includes(topicLower)
        || (topicLower === 'python' && pathTitle.includes('learning'))
        || (topicLower === 'data' && pathTitle.includes('data'))
    }

    const scored = practiceSessions.map((session) => {
      const recommended = isRecommended(session)
      const completed = Boolean(completedSessions[session.id])
      return {
        ...session,
        isRecommended: recommended,
        score: (recommended ? 2 : 0) + (completed ? 0 : 1),
      }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, 2)
  }, [completedSessions, currentPath])
  // Reflects what the learner actually onboarded as, rather than ML for everyone.
  const homeHint = nextLesson
    ? `Next up on ${currentPath.title} is ${nextLesson.title}. ${seasonDevyCoins > 0 ? 'You’ve already earned Devy Coins this season — keep the streak going.' : 'A single lesson is enough to join this season’s league.'}`
    : `You’re set up on ${currentPath.title}. Open Paths to pick where to go next.`

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
  }

  if (!profile) return <OnboardingView onComplete={completeOnboarding} />
  if (showFirstLessonWelcome) return <FirstLessonWelcome path={currentPath} lesson={nextLesson} onBegin={startMission} />
  if (loadingLesson) return <LessonLoading title={getLesson(loadingLesson)?.title ?? nextLesson?.title ?? 'Your lesson'} />

  return (
    <div className="min-h-screen bg-[#121214] font-rubik [[data-theme=light]_&]:bg-[#fafaf8]">
      {active !== 'Plans' && !openLesson && !openPractice && !customPathFullScreen && (
      <header className="sticky top-0 z-30 flex items-center w-full h-16 px-[max(22px,calc((100vw-1160px)/2))] max-[680px]:px-[18px] border-b border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] bg-[#121214]/95 [[data-theme=light]_&]:bg-white/95 backdrop-blur-md">
        <button
          className="flex items-center p-0 border-0 bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72]"
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
                    ? "relative h-16 px-0.5 border-0 bg-transparent text-sm font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#6699ec] focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72]"
                    : "relative h-16 px-0.5 border-0 bg-transparent text-sm font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-700 after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72]"
                }
                onClick={() => { setActive(item); setPathsInitialView(null) }}
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
              className={`relative inline-flex h-[34px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] ${streakAtRisk ? 'border-red-400/80 bg-red-500/10 text-red-200 hover:bg-red-500/15 [[data-theme=light]_&]:border-red-400 [[data-theme=light]_&]:bg-red-50 [[data-theme=light]_&]:text-red-700 [[data-theme=light]_&]:hover:bg-red-100' : 'border-[#404040] bg-[#262626] text-[#f4f4f2] hover:border-[#9a9a9d] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:border-[#686968]'}`}
              onClick={() => {
                setActivePopover(null)
                setStreakJourneyOpen(true)
              }}
              aria-haspopup="dialog"
              aria-expanded={streakJourneyOpen}
              aria-controls="streak-journey-dialog"
              aria-label={streakAtRisk ? `Open streak journey. ${streakDays} day streak. Activity required today.` : activeToday ? `Open streak journey. ${streakDays} day streak. Today complete.` : 'Open streak journey and start your streak.'}
            >
              {streakAtRisk ? <SirenIcon className="size-4" /> : <AnimatedBoltIcon className="size-4 text-[#f5a623]" />}
              <span aria-hidden="true">{streakDays}</span>
              {streakAtRisk && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#121214] bg-red-400 motion-safe:animate-pulse [[data-theme=light]_&]:border-white" aria-hidden="true" />}
            </button>
          </div>

          <div className="relative">
            <button
              ref={xpButtonRef}
              type="button"
              className={`inline-flex items-center gap-[5px] h-[34px] border rounded-full px-3 text-[13px] font-semibold cursor-pointer font-[inherit] transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] ${activePopover === 'xp' ? 'border-[#6699ec] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800' : 'border-[#404040] text-[#9a9a9d] hover:border-[#9a9a9d] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:border-[#686968]'} bg-[#262626] [[data-theme=light]_&]:bg-white`}
              onClick={() => setActivePopover((current) => (current === 'xp' ? null : 'xp'))}
              aria-haspopup="dialog"
              aria-expanded={activePopover === 'xp'}
            >
              <AnimatedGemIcon className="w-3.5 h-3.5 text-[#8b7cf6] [[data-theme=light]_&]:text-[#6699ec]" />
              {/* Keying on the value itself remounts the span on every gain,
                  so the pop replays each time rather than only on first mount. */}
              <motion.span
                key={xp}
                aria-hidden="true"
                initial={{ scale: 1.35 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {xp}
              </motion.span>
              <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">{xp} XP</span>
            </button>
            {activePopover === 'xp' && (
              <div ref={popoverRef}>
                <XpPopover earnedToday={getDailyXp(progress)} xpGoal={xpGoal} />
              </div>
            )}
          </div>

          <div
            className="inline-flex items-center gap-[5px] h-[34px] border rounded-full px-3 text-[13px] font-semibold border-[#404040] bg-[#262626] text-[#f0c964] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-[#a6790f]"
            aria-label={`${devyCoins} Devy Coins`}
          >
            <CoinIcon className="w-3.5 h-3.5" />
            <motion.span key={devyCoins} aria-hidden="true" initial={{ scale: 1.35 }} animate={{ scale: 1 }} transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}>
              {devyCoins}
            </motion.span>
          </div>
        </div>

        <button
          ref={menuButtonRef}
          className="min-w-11 min-h-11 max-[680px]:ml-auto p-2 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[21px] border-0 bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72]"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close account menu' : 'Open account menu'}
          aria-expanded={menuOpen}
        >
          ☰
        </button>

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

      <main className={active === 'Plans' ? 'min-h-screen' : ['Paths', 'Leaderboard', 'Practice', 'Settings', 'Profile'].includes(active) ? 'w-[min(100%,1160px)] mx-auto pt-8 px-[22px] max-[900px]:px-[18px] pb-[72px] max-[680px]:pt-6 max-[680px]:px-[18px] max-[680px]:pb-14' : 'grid grid-cols-[360px_minmax(0,1fr)] max-[900px]:grid-cols-[300px_minmax(0,1fr)] gap-[22px] max-[900px]:gap-[18px] w-[min(100%,1160px)] mx-auto pt-10 px-[22px] max-[900px]:px-[18px] pb-[72px] max-[680px]:flex max-[680px]:flex-col max-[680px]:gap-7 max-[680px]:pt-6 max-[680px]:px-[18px] max-[680px]:pb-14'}>
        {active === 'Paths' ? (
          <PathsView
            currentLearnerPath={currentPath}
            completedLessons={completedLessons}
            onOpenLesson={launchLesson}
            onChooseFramework={chooseFrontendFramework}
            initialView={pathsInitialView}
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
            onUpdateDailyMinutes={(minutes) => saveProfileFields({ dailyMinutes: minutes })}
          />
        ) : active === 'Profile' ? (
          <ProfileView
            profile={profile}
            progress={progress}
            currentPath={currentPath}
            pathProgress={derived}
            onSaveProfile={saveProfileFields}
            onStartLearning={() => { setActive('Paths'); setPathsInitialView(null) }}
            isLoading={profileLoading}
            isPublicView={publicProfileView}
            onTogglePublicView={setPublicProfileView}
            onChangeAvatar={() => setShowAvatarPicker(true)}
          />
        ) : active === 'Plans' ? (
          <PlansView progress={progress} onActivate={startPremium} onCancel={endPremium} highlightPerk={plansHighlight} onBack={() => setActive('Home')} />
        ) : active === 'Leaderboard' ? (
          <LeaderboardView
            seasonDevyCoins={seasonDevyCoins}
            lifetimeCoins={devyCoins}
            leagueIndex={leagueIndex}
            lastLeagueResult={lastLeagueResult}
            progress={progress}
            onDismissResult={dismissLeagueResult}
            onStartPractice={() => setActive('Practice')}
            onOpenPlans={openPlans}
            onViewOwnProfile={() => { setPublicProfileView(false); setActive('Profile') }}
            onViewRecap={() => setSeasonRecapOpen(true)}
            hasSeenIntroduction={Boolean(seenPageIntroductions?.leaderboard)}
            onDismissIntroduction={() => dismissPageIntroduction('leaderboard')}
          />
        ) : active === 'Practice' ? (
          <PracticeView
            onStart={setOpenPractice}
            completedSessions={completedSessions}
            currentPath={currentPath}
          />
        ) : active === 'Rewards' ? (
          <RewardsView
            progress={progress}
            leagueIndex={leagueIndex}
            seasonDevyCoins={seasonDevyCoins}
            onSetPayoutMethod={handleSetPayoutMethod}
            onRequestPayout={handleRequestPayout}
          />
        ) : (
          <>
        <aside className="flex flex-col gap-[18px] max-[680px]:order-2" aria-label="Learner support">
          <section className="border border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] rounded-3xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:shadow-none p-[22px]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rethink-sans text-[38px] font-medium">{streakDays}</span>
                <BoltIcon className={`w-[34px] h-[34px] p-2 rounded-full text-white ${streakEra.bgClass} ${streakEra.glowClass}`} />
                {streakDays > 0 && (
                  <span className={`text-[11px] font-bold uppercase tracking-[.06em] ${streakEra.accentClass}`}>{streakEra.label}</span>
                )}
              </div>
              <button className="min-w-9 min-h-8 p-1 text-[#7d7d80] [[data-theme=light]_&]:text-[#737371] tracking-[2px] border-0 bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72]" onClick={() => showNotice(`${xp} of ${xpGoal} XP earned`)} aria-label="View streak details">•••</button>
            </div>
            {/* Was the fixed string "Solve 3 problems to start a streak", which
                contradicted the streak count rendered directly above it. */}
            {/* Devy shows up here only when the streak is actually at risk.
                Making it the one thing on the card that changes is what turns
                a line of grey text into something the eye catches. */}
            <div className="mt-3.5 mb-4 flex items-center gap-3">
              {streakAtRisk && <DevyMood mood="annoyed" className="size-[52px] flex-none max-[900px]:size-11" />}
              <p className="m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">
                {streakMessage.emphasis && <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-medium">{streakMessage.emphasis} </strong>}
                {streakMessage.text}
              </p>
            </div>
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
                      ? 'home-streak-day grid place-items-center w-full max-w-10 aspect-square rounded-full border border-[#f5a623] bg-[#f5a623] text-white shadow-[0_0_0_3px_rgba(245,166,35,0.18)]'
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

          {/* Reinforcement is core-loop, the upsell below isn't — it goes
              first when a review is actually due. */}
          {dueReview && (
            <ReviewReminderCard
              conceptTitle={dueReview.conceptTitle}
              onReview={() => setReviewPrompt({ lessonId: dueReview.lessonId, conceptId: dueReview.conceptId })}
            />
          )}

          <section className="overflow-hidden rounded-3xl p-[22px] bg-[#211a2b] [[data-theme=light]_&]:bg-[#f5edf4] border border-[#404040] [[data-theme=light]_&]:border-[#eadfea] [[data-theme=light]_&]:shadow-none">
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="text-[#f0c964] text-[21px]" aria-hidden="true">✦</span>
              <div className="grid gap-1">
                <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-[15px] font-medium">Unlock all learning</strong>
                <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">Get smarter, faster with Premium.</span>
              </div>
            </div>
            <ActionButton variant="premium" className="w-full min-h-[52px] text-[15px] font-medium" onClick={() => openPlans()}>
              Explore Premium
            </ActionButton>
          </section>

          <section className="border border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] rounded-3xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:shadow-none p-[22px]">
            <div className="flex items-start justify-between gap-2 mb-3.5 text-left">
              <div className="grid gap-0.5">
                <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-[15px] font-semibold">{currentLeague.name}</strong>
              <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">{formatTimeRemaining(getSeasonTimeRemaining(now()))}</span>
              </div>
              <InfoTooltip label="How leagues work" align="end">
                Earn Devy Coins this season to move up the leaderboard. Final standings update when the season ends.
              </InfoTooltip>
            </div>
            <button type="button" className="grid w-full gap-2 rounded-2xl border border-[#404040] bg-[#171717] p-3.5 text-left transition-colors hover:border-[#5a5a60] hover:bg-[#1c1c1e] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-[#f5f5f4] [[data-theme=light]_&]:hover:border-[#d4d4d4]" onClick={() => setActive('Leaderboard')} aria-label="Open leaderboard">
              <span className="flex items-center justify-between px-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
                <span>Standings</span>
                <span>Coins</span>
              </span>
              {homeStandings.map((entry) => (
                <span key={entry.id} className={`grid min-h-8 grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-2 py-2 text-[13px] ${entry.id === USER_ID ? 'bg-[#2a293c] text-[#f4f4f2] [[data-theme=light]_&]:bg-[#e9f2ff] [[data-theme=light]_&]:text-neutral-800' : ''}`}>
                  <span className="text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">{entry.rank}</span>
                  <span className="truncate font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{entry.id === USER_ID ? 'You' : entry.name}</span>
                  <strong className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] tabular-nums">{entry.score.toLocaleString()}</strong>
                </span>
              ))}
            </button>
          </section>

        </aside>

        <section className="min-w-0 max-[680px]:order-1">
          <h1 className="m-0 mb-4 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rubik text-[30px] max-[680px]:text-[27px] font-semibold">Your next mission</h1>

          <div className="relative w-full pt-2.5 pl-2.5 max-[680px]:pt-2 max-[680px]:pl-0">
            <article className="relative z-[1] flex w-full min-h-[530px] max-[680px]:min-h-0 flex-col items-center gap-[18px] p-7 max-[900px]:p-[22px] max-[680px]:pt-[22px] max-[680px]:px-[18px] max-[680px]:pb-5 overflow-hidden rounded-3xl text-center bg-[#1f1f1f]! [[data-theme=light]_&]:bg-[#f4f7fc]! border border-[#404040] [[data-theme=light]_&]:border-[#e3e9f2] [[data-theme=light]_&]:shadow-none">
              <div className="w-full pt-1 text-center">
                <Badge className="bg-neutral-700 text-neutral-100">{currentPath.level}</Badge>
                <h2 className="max-w-[520px] mx-auto mt-3.5 mb-1.5 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rubik text-3xl sm:text-3xl lg:text-4xl font-medium leading-[1.04] [overflow-wrap:anywhere] text-balance">{currentPath.title}</h2>
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
                    <span className={`home-progress-dot w-2 h-2 rounded-full ${index === currentStepIndex ? 'bg-[#d4d4d4]' : 'bg-[#404040] [[data-theme=light]_&]:bg-[#eeeeeb]'}`} key={region.id} />
                  ))}
                </div>
                {/* The dots count regions, so the label says so — "Step N of 6"
                    followed by a lesson title read as though the lesson were the step. */}
                <p className="max-w-full m-0 mb-[18px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs leading-[1.5] text-center"><strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-medium">Region {currentStepIndex + 1} of {derived.regionsTotal}</strong> · {nextLesson?.title}</p>
                <ActionButton variant="primary" className="cta-idle w-full min-h-[52px] text-[15px] font-medium" onClick={startMission}>
                  {started ? 'Continue mission' : 'Start mission'} <span className="cta-idle-arrow" aria-hidden="true">→</span>
                </ActionButton>
              </div>
            </article>
          </div>

          <section className="mt-8" aria-labelledby="also-learning-title">
            <p id="also-learning-title" className="m-0 text-[11px] font-semibold tracking-[0.1em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">ALSO LEARNING</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {otherPaths.map((path) => (
                <button key={path.id} type="button" className="home-path-pill min-h-11 rounded-full border border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-4 text-sm text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800" onClick={() => resumePath(path.id)}>
                  Resume {path.title}
                </button>
              ))}
              <button type="button" className="home-path-pill min-h-11 rounded-full border border-transparent bg-[#1c2a4d] [[data-theme=light]_&]:bg-[#f0f5fd] px-4 text-sm font-medium text-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb] hover:bg-[#213762] [[data-theme=light]_&]:hover:bg-[#e2edfc]" onClick={() => { setPathsInitialView('custom'); setActive('Paths') }}>
                <span aria-hidden="true">＋</span> Create another
              </button>
            </div>
          </section>

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

      {!openLesson && active !== 'Plans' && !customPathFullScreen && (
        <div className="fixed right-6 bottom-6 z-20 grid justify-items-end gap-3 max-[680px]:right-[18px] max-[680px]:bottom-[18px]">
          <button type="button" className="grid size-16 place-items-center rounded-full border border-[#525252] bg-[#303030] p-2 shadow-[0_4px_0_#171717] transition-[background,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#404040] active:translate-y-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 [[data-theme=light]_&]:border-[#b8b8b8] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_4px_0_#d4d4d4] [[data-theme=light]_&]:hover:bg-[#f5f5f4]" onClick={() => setDevyOpen(true)} aria-expanded={devyOpen} aria-controls="devy-drawer" aria-label="Ask Devy">
            <img className="size-full object-contain" src="/assets/devy.svg" alt="" />
          </button>
        </div>
      )}

      {devyOpen && <>
        <button type="button" className="fixed inset-0 z-40 cursor-default bg-black/30" onClick={() => setDevyOpen(false)} aria-label="Close Devy" />
        <DevyDrawer page={active} pathTitle={currentPath.title} nextLesson={nextLesson?.title} onClose={() => setDevyOpen(false)} />
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

      {openLesson && <LessonView key={String(openLesson)} lessonId={openLesson} navigationStyle="segments" onExit={handleLessonExit} onComplete={recordLessonCompletion} onQuestionOutcome={recordQuestionOutcome} profile={profile} xp={xp} />}
      {/* Rendered after LessonView so it lands on top of the lesson the learner
          just finished, rather than behind it. */}
      {leagueCelebration && (
        <LeagueQualifiedCelebration
          leagueIndex={leagueCelebration.leagueIndex}
          seasonDevyCoins={leagueCelebration.seasonDevyCoins}
          onClose={dismissLeagueCelebration}
        />
      )}
      {streakCelebration && (
        <StreakMilestoneCelebration
          streakDays={streakCelebration.streakDays}
          milestone={streakCelebration.milestone}
          onClose={() => setStreakCelebration(null)}
        />
      )}
      {silverPassCelebration && (
        <SilverPassCelebration
          rank={silverPassCelebration.rank}
          usedImmediately={silverPassCelebration.usedImmediately}
          onClose={() => setSilverPassCelebration(null)}
        />
      )}
      {seasonRecapOpen && seasonRecap && (
        <SeasonRecapView recap={seasonRecap} onClose={() => setSeasonRecapOpen(false)} />
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
      {openPractice && <PracticeSession sessionId={openPractice} completion={completedSessions[openPractice]} xpAward={getPracticeXpAward(progress, openPractice)} onExit={() => setOpenPractice(null)} onComplete={recordPracticeCompletion} />}
      {reviewPrompt && dueReview && (
        <RecallCheckModal
          conceptTitle={dueReview.conceptTitle}
          question={dueReview.question}
          onOutcome={(outcome) => recordQuestionOutcome(reviewPrompt.lessonId, reviewPrompt.conceptId, outcome)}
          onClose={() => setReviewPrompt(null)}
        />
      )}
      {showAvatarPicker && (
        <AvatarPickerModal
          initialName={profile?.name}
          initialAvatarStyle={profile?.avatarStyle}
          initialAvatarSeed={profile?.avatarSeed}
          seedFallback={profile?.name}
          onSave={saveAvatarChoice}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
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
