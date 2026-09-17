import { useRef, useState } from "react";
import { DevyLottie } from "../ui/DevyLottie";
import { ArrowLeftIcon, CrownIcon, PlayIcon, PodiumIcon, RocketIcon, RouteIcon, SparkleIcon, TrophyIcon } from "../ui/icons";
import { DevyPromptBand } from "./DevyPromptBand";

// Shared card shell. Border colour, glow and the accent wash all come from
// .home-map-card in styles.css, driven by the --card-accent each card sets.
const mapCard =
  "home-map-card absolute flex h-[290px] w-[400px] cursor-pointer flex-col items-start rounded-3xl border p-6 text-left text-[21px] font-medium focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 max-[900px]:static max-[900px]:size-auto max-[900px]:min-h-[250px]";

const mapCardSurface =
  "bg-[#1f1f1f] text-[#f4f4f2] hover:bg-[#252525] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-white";

const chipClass = "grid size-9 flex-none place-items-center rounded-xl";
// Four cards that each earn their spot, not five or six just because the
// product has that many features: continue (or switch) what's actually in
// progress, the competitive side of the product, proof of what's been
// built, and whatever single real update matters most right now. Paths,
// Custom Paths and Practice don't get permanent real estate — the course
// switcher below folds Paths/Custom Paths in, and Practice stays in the tab
// bar until it has a loop worth a card of its own.
const cardOrder = ["continueLearning", "leaderboard", "portfolio", "dynamic"];
const devyClips = {
  continueLearning: "thinking",
  leaderboard: "listening",
  portfolio: "walk",
  dynamic: "wave",
};
const cardAccents = {
  continueLearning: "59 130 246",
  leaderboard: "224 80 122",
  portfolio: "139 124 246",
  dynamic: "4 173 192",
};

// Small colored icon badge, top-left of each card — the same accent hues
// Badge.jsx's TONES already use, reused here instead of new colors.
function IconChip({ icon: Icon, tone }) {
  const tones = {
    teal: `${chipClass} bg-[#04adc0]/15 text-[#04adc0]`,
    pink: `${chipClass} bg-[#e0507a]/15 text-[#e0507a]`,
    violet: `${chipClass} bg-[#8b7cf6]/15 text-[#8b7cf6]`,
    blue: `${chipClass} bg-white/15 text-[#88bdf2] [[data-theme=light]_&]:bg-[#2563eb]/12 [[data-theme=light]_&]:text-[#2563eb]`,
  };

  return (
    <span className={tones[tone]}>
      <Icon className="w-[18px] h-[18px]" />
    </span>
  );
}

// The corner cue that only appears on hover — "there is more inside this" —
// so a side card visibly invites a click instead of just sitting there.
function ExpandCue() {
  return (
    <span className="home-map-card__expand" aria-hidden="true">
      <svg className="size-4" viewBox="0 0 24 24" fill="none">
        <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// One accent-colored progress bar — the side-state visual grammar for
// anything that's fundamentally "how far along", so it reads as a stat at
// a glance rather than needing the number read out first.
function GlyphBar({ percent }) {
  return (
    <span className="home-map-card__glyph">
      <span className="home-map-card__glyph-bar"><span style={{ width: `${percent}%` }} /></span>
    </span>
  );
}

// A small row of dots — the side-state visual grammar for anything that's
// fundamentally a *count* (projects built) rather than a single percentage.
function GlyphDots({ filled, total = 6 }) {
  return (
    <span className="home-map-card__glyph">
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className="home-map-card__glyph-dot" data-filled={index < filled} />
      ))}
    </span>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The course switcher living inside Continue Learning, instead of a
// separate Paths card — this is the whole answer to "I'm juggling a few
// courses at once and don't want to dig through Paths to swap between
// them." Only rendered once the card is front, so it never competes with
// the compact side teaser.
function CourseSwitcher({ options, selectedId, onSelect }) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.id === selectedId) ?? options[0]
  if (options.length <= 1) return <span className="home-map-card__course-pill">{selected.title}</span>

  return (
    <span className="home-map-card__course-switcher">
      <button
        type="button"
        className="home-map-card__course-pill home-map-card__course-pill--button"
        onClick={(event) => { event.stopPropagation(); setOpen((value) => !value) }}
        aria-expanded={open}
      >
        {selected.title}
        <ChevronIcon className="size-3.5" />
      </button>
      {open && (
        <span className="home-map-card__course-menu" role="menu">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitem"
              className="home-map-card__course-menu-row"
              aria-current={option.id === selected.id}
              onClick={(event) => { event.stopPropagation(); onSelect(option.id); setOpen(false) }}
            >
              <span>{option.title}</span>
              <span>{option.percent}%</span>
            </button>
          ))}
        </span>
      )}
    </span>
  )
}

export default function HomeView({
  onStartMission,
  onOpenCareerPath,
  onOpenDevyPro,
  onOpenLeaderboard,
  onSeeAllPractice,
  onOpenDevy,
  onOpenPath,
  courseOptions = [],
  currentRegionLessonsTotal = 0,
  completedLessonsCount = 0,
  pathTools = [],
  leagueName,
  leagueRank,
  leagueRankDelta,
  leagueNeighbors = [],
  coinsToNextRank = 0,
  coinsToPromotion = 0,
  inPromotionZone = false,
  canPromote = false,
  seasonTimeLeft,
  seasonCoins,
  dynamicUpdate,
}) {
  const [mapMode, setMapMode] = useState("map");
  const [activeCard, setActiveCard] = useState("continueLearning");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const wheelLocked = useRef(false);
  const activeIndex = cardOrder.indexOf(activeCard);

  const getCardSlot = (cardId) => {
    const offset = (cardOrder.indexOf(cardId) - activeIndex + cardOrder.length) % cardOrder.length;
    if (offset === 0) return "front";
    if (offset === 1) return "next";
    if (offset === cardOrder.length - 1) return "previous";
    if (offset === 2) return "far-next";
    return "far-previous";
  };
  const isFront = (cardId) => getCardSlot(cardId) === "front";

  // Below 680px, cards are a plain stacked list, not a carousel — tapping a
  // secondary card should go straight to its screen, not "select it" first
  // the way it does on desktop where bringing a card to front is itself part
  // of the carousel interaction.
  const openOrSelect = (cardId, onOpen) => {
    if (window.innerWidth > 680 && getCardSlot(cardId) !== 'front') {
      setMapMode('map')
      setActiveCard(cardId)
      return
    }
    onOpen()
  }

  const onCardKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    setMapMode("map");
    setActiveCard(cardOrder[(activeIndex + direction + cardOrder.length) % cardOrder.length]);
  };

  const changeCard = (direction) => {
    setMapMode("map");
    setActiveCard(cardOrder[(activeIndex + direction + cardOrder.length) % cardOrder.length]);
  };

  const onSceneWheel = (event) => {
    if (window.innerWidth <= 900 || wheelLocked.current || Math.abs(event.deltaY) < 12) return;
    event.preventDefault();
    wheelLocked.current = true;
    changeCard(event.deltaY > 0 ? 1 : -1);
    window.setTimeout(() => {
      wheelLocked.current = false;
    }, 430);
  };

  const primaryCourse = courseOptions[0]
  const selectedCourse = courseOptions.find((option) => option.id === selectedCourseId) ?? primaryCourse
  const continueSelectedCourse = () => {
    if (!selectedCourse) { onOpenCareerPath(); return }
    if (selectedCourse.isPrimary) { if (selectedCourse.nextLessonTitle) onStartMission(); else onOpenCareerPath(); return }
    onOpenPath(selectedCourse.id)
  }

  const rankTrend = leagueRankDelta == null
    ? "Just joined this league"
    : leagueRankDelta === 0
      ? "Holding steady"
      : `${leagueRankDelta > 0 ? "↑" : "↓"} ${Math.abs(leagueRankDelta)} today`
  const rankProximityPercent = seasonCoins + coinsToNextRank > 0
    ? Math.round((seasonCoins / (seasonCoins + coinsToNextRank)) * 100)
    : 100

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden px-[22px] py-5 max-[900px]:h-auto max-[900px]:overflow-visible max-[900px]:px-[18px] max-[900px]:pb-8 max-[680px]:min-h-[calc(100dvh-64px)] max-[680px]:h-auto max-[680px]:flex max-[680px]:flex-col max-[680px]:justify-center max-[680px]:px-[18px] max-[680px]:py-6">
      <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col justify-center max-[900px]:h-auto max-[680px]:my-auto max-[680px]:w-full max-[680px]:items-center">
        <section
          className="home-map-scene relative h-[540px] max-[900px]:grid max-[900px]:h-auto max-[900px]:grid-cols-2 max-[900px]:gap-4 max-[680px]:flex max-[680px]:flex-col max-[680px]:items-center max-[680px]:justify-center max-[680px]:w-full max-[680px]:gap-4"
          data-mode={mapMode}
          aria-label="Learning map"
          onWheel={onSceneWheel}
        >
          <span className="home-map-atmosphere" aria-hidden="true" />
          {/* Keep positioning on the wrapper so the compose transform never
              conflicts with the active Lottie clip. */}
          <div className="home-map-devy absolute left-1/2 top-[30px] -translate-x-1/2 max-[900px]:static max-[900px]:col-span-2 max-[900px]:justify-self-center max-[900px]:translate-x-0">
            <DevyLottie key={activeCard} clip={devyClips[activeCard]} className="size-36 max-[680px]:size-20" />
          </div>

          <div
            className={`${mapCard} home-map-card--continue-learning home-map-card--lesson ${mapCardSurface} max-[900px]:col-span-2 max-[680px]:min-h-[220px] max-[680px]:w-full max-[680px]:max-w-[480px] max-[680px]:mx-auto`}
            style={{ "--card-accent": cardAccents.continueLearning }}
            data-slot={getCardSlot("continueLearning")}
            tabIndex={0}
            role="group"
            aria-label="Continue learning"
            aria-current={isFront("continueLearning") ? "true" : undefined}
            onKeyDown={onCardKeyDown}
            onClick={() => openOrSelect("continueLearning", continueSelectedCourse)}
          >
            <div className="flex w-full items-start justify-between">
              <IconChip icon={PlayIcon} tone="blue" />
              {!isFront("continueLearning") && <ExpandCue />}
            </div>

            <span className="home-map-card__side">
              <GlyphBar percent={primaryCourse?.percent ?? 0} />
              <span className="home-map-card__side-value">{primaryCourse?.title ?? "Continue learning"}</span>
              <span className="home-map-card__side-label">{primaryCourse?.nextLessonTitle ?? "Path complete"}</span>
            </span>

            <span className="home-map-card__lesson-details">
              <span className="flex w-full items-center justify-between gap-2">
                <span className="home-map-card__title m-0 font-rubik text-[21px] font-medium leading-none">Continue learning</span>
                <CourseSwitcher options={courseOptions} selectedId={selectedCourse?.id} onSelect={setSelectedCourseId} />
              </span>
              <span className="home-map-card__roadmap" aria-hidden="true">
                {Array.from({ length: Math.min(currentRegionLessonsTotal, 5) || 1 }).map((_, index, nodes) => {
                  const completed = selectedCourse?.regionLessonsCompleted ?? 0
                  const state = index < completed ? "completed" : index === completed ? "current" : "upcoming"
                  return (
                    <span key={index} className="flex flex-1 items-center last:flex-none">
                      <span className="home-map-card__roadmap-node" data-state={state} />
                      {index < nodes.length - 1 && <span className="home-map-card__roadmap-connector" />}
                    </span>
                  )
                })}
              </span>
              <button
                type="button"
                className="home-map-card__primary-lesson w-full border-0 bg-transparent p-0 text-left"
                onClick={(event) => { event.stopPropagation(); openOrSelect("continueLearning", continueSelectedCourse) }}
              >
                <strong className={selectedCourse?.nextLessonTitle ? undefined : "home-map-card__lesson-complete"}>{selectedCourse?.nextLessonTitle ?? "Path complete"}</strong>
                <span>{selectedCourse?.title} · {selectedCourse?.regionLessonsCompleted ?? 0}/{selectedCourse?.regionLessonsTotal ?? 0} lessons</span>
                <span className="home-map-card__progress" aria-label={`${selectedCourse?.regionPercent ?? 0}% of this region complete`}>
                  <span style={{ width: `${selectedCourse?.regionPercent ?? 0}%` }} />
                </span>
              </button>
            </span>
          </div>

          <button
            type="button"
            onClick={() => openOrSelect("leaderboard", onOpenLeaderboard)}
            onKeyDown={onCardKeyDown}
            style={{ "--card-accent": cardAccents.leaderboard }}
            className={`${mapCard} home-map-card--leaderboard ${mapCardSurface}`}
            data-slot={getCardSlot("leaderboard")}
            tabIndex={0}
            aria-current={isFront("leaderboard") ? "true" : undefined}
          >
            <div className="flex w-full items-start justify-between">
              <IconChip icon={PodiumIcon} tone="pink" />
              {!isFront("leaderboard") && <ExpandCue />}
            </div>

            <span className="home-map-card__side">
              <GlyphBar percent={rankProximityPercent} />
              <span className="home-map-card__side-value">#{leagueRank ?? "—"}</span>
              <span className="home-map-card__side-label">{leagueName}</span>
              <span className="home-map-card__side-trend" data-direction={leagueRankDelta > 0 ? "up" : leagueRankDelta < 0 ? "down" : undefined}>{rankTrend}</span>
            </span>

            <span className="home-map-card__title">Leaderboard</span>
            <span className="home-map-card__details">
              <span>{leagueName} · #{leagueRank ?? "—"}</span>
              {leagueNeighbors.map((entry) => (
                <span key={entry.id} className="home-map-card__standings-row" data-self={entry.isCurrentUser}>
                  <span>#{entry.rank} {entry.name}</span>
                  <span>{entry.score}</span>
                </span>
              ))}
              <span className="home-map-card__standings-row">
                <span>{coinsToNextRank > 0 ? `${coinsToNextRank} coin${coinsToNextRank === 1 ? '' : 's'} to #${(leagueRank ?? 1) - 1}` : `${seasonCoins} coin${seasonCoins === 1 ? '' : 's'} this season`}</span>
                <span>{seasonTimeLeft}</span>
              </span>
              {canPromote && (
                <span className="home-map-card__promotion" data-active={inPromotionZone}>
                  <TrophyIcon className="size-4" />
                  {inPromotionZone ? "In the promotion zone — hold your spot" : `${coinsToPromotion} coin${coinsToPromotion === 1 ? '' : 's'} to the promotion zone`}
                </span>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => openOrSelect("portfolio", onOpenCareerPath)}
            onKeyDown={onCardKeyDown}
            style={{ "--card-accent": cardAccents.portfolio }}
            className={`${mapCard} home-map-card--portfolio ${mapCardSurface}`}
            data-slot={getCardSlot("portfolio")}
            tabIndex={0}
            aria-current={isFront("portfolio") ? "true" : undefined}
          >
            <div className="flex w-full items-start justify-between">
              <IconChip icon={RocketIcon} tone="violet" />
              {!isFront("portfolio") && <ExpandCue />}
            </div>

            <span className="home-map-card__side">
              <GlyphDots filled={completedLessonsCount % 6 || (completedLessonsCount > 0 ? 6 : 0)} />
              <span className="home-map-card__side-value">{completedLessonsCount}</span>
              <span className="home-map-card__side-label">{completedLessonsCount === 1 ? "lesson completed" : "lessons completed"}</span>
            </span>

            <span className="home-map-card__title">Your work</span>
            <span className="home-map-card__details">
              <span>{completedLessonsCount > 0 ? `${completedLessonsCount} lesson${completedLessonsCount === 1 ? '' : 's'} completed` : "Turn what you learn into real projects"}</span>
              {pathTools.length > 0 && <span>Skills so far: {pathTools.slice(0, 4).join(", ")}</span>}
              <span>Explore project ideas</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => openOrSelect("dynamic", onOpenDevy)}
            onKeyDown={onCardKeyDown}
            style={{ "--card-accent": cardAccents.dynamic }}
            className={`${mapCard} home-map-card--dynamic ${mapCardSurface}`}
            data-slot={getCardSlot("dynamic")}
            tabIndex={0}
            aria-current={isFront("dynamic") ? "true" : undefined}
          >
            <div className="flex w-full items-start justify-between">
              <IconChip icon={SparkleIcon} tone="teal" />
              {!isFront("dynamic") && <ExpandCue />}
            </div>

            <span className="home-map-card__side">
              <span className="home-map-card__side-value home-map-card__side-value--text">{dynamicUpdate?.title}</span>
              <span className="home-map-card__side-label">{dynamicUpdate?.body}</span>
            </span>

            <span className="home-map-card__title">What's new</span>
            <span className="home-map-card__details">
              <span>{dynamicUpdate?.title}</span>
              <span>{dynamicUpdate?.body}</span>
            </span>
          </button>

          <div className="home-map-carousel-arrows" aria-label="Change card">
            <button type="button" className="home-map-carousel-arrow" onClick={() => changeCard(-1)} aria-label="Show previous card">
              <ArrowLeftIcon className="size-5" />
            </button>
            <button type="button" className="home-map-carousel-arrow" onClick={() => changeCard(1)} aria-label="Show next card">
              <ArrowLeftIcon className="size-5 rotate-180" />
            </button>
          </div>

        </section>

        {/* Below 680px the floating "Ask Devy" button (rendered globally in
            main.jsx) takes over for this whole band — Devy Pro and Career
            Path stay reachable from the account menu and the Paths tab. */}
        <section
          className="home-quick-actions relative mx-auto mt-8 flex w-full max-w-[1040px] items-center justify-center py-6"
          aria-label="Quick actions"
        >
          <div className="home-quick-left absolute left-0 flex gap-3 max-[680px]:static max-[680px]:mr-3">
            <button
              type="button"
              onClick={onSeeAllPractice}
              className="relative grid size-11 place-items-center rounded-full border border-[#37373a] bg-[#1b1b1d] text-[#d6d6d8] hover:border-[#5a5a60] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-2 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
              aria-label="Practice"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="home-practice-dot absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#121214] bg-[#fb7185] [[data-theme=light]_&]:border-white" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onSeeAllPractice}
              className="grid size-11 place-items-center rounded-full border border-[#37373a] bg-[#1b1b1d] text-[#d6d6d8] hover:border-[#5a5a60] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-2 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
              aria-label="Daily task"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="15"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M8 3v4M16 3v4M4 10h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <DevyPromptBand
            isComposing={mapMode === "compose"}
            accent={cardAccents[activeCard]}
            onComposeStart={() => setMapMode("compose")}
            onComposeEnd={() => setMapMode("map")}
            onOpen={onOpenDevy}
          />

          <div className="home-quick-right absolute -right-20 flex gap-3 max-[680px]:static max-[680px]:ml-3">
            <button
              type="button"
              onClick={onOpenDevyPro}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[linear-gradient(86deg,#748fff_0%,#ff90e0_44.8%,#f7c325_100%)] px-4 text-[13px] font-semibold text-neutral-900 shadow-[inset_0_-3px_0_rgba(20,37,99,.3)] hover:brightness-105 focus-visible:outline-3 focus-visible:outline-[#f7c325] focus-visible:outline-offset-2"
            >
              <CrownIcon className="size-[18px] flex-none" />
              Devy Pro
            </button>
            <button
              type="button"
              onClick={onOpenCareerPath}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#404040] bg-[#1f1f1f] px-4 text-[13px] font-medium text-[#f4f4f2] hover:border-[#5a5a60] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-2 [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
            >
              <RouteIcon className="size-[18px] flex-none text-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb]" />
              Career Path
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
