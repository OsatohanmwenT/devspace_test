import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TierMedal } from "../leaderboard/TierMedal";
import { ActionButton } from "../ui/ActionButton";
import { AnimatedBoltIcon, AnimatedGemIcon } from "../ui/AnimatedIcons";
import { DevyLottie } from "../ui/DevyLottie";
import {
    ArrowLeftIcon,
    PlayIcon,
    RocketIcon,
    SparkleIcon,
} from "../ui/icons";
import { DevyPromptBand } from "./DevyPromptBand";

// The Leaderboard card's own identity color, as a hex — same value as
// cardAccents.leaderboard ("224 80 122"), just in the form TierMedal wants.
const leaderboardMedalColor = "#e0507a";

// Decorative per-row avatar colors for standings entries that aren't the
// learner — cosmetic variety only, cycled by row index since we don't have
// (and don't need) a real per-person color.
const avatarPalette = ["#f5b400", "#8b5cf6", "#04adc0", "#3b82f6"];

// A small shared type scale — three tiers, each responsive across the same
// three breakpoints the carousel already uses (mobile/tablet/desktop) — so
// every card leans on the same few sizes instead of one-off pixel values,
// and hierarchy (what leads, what blends) reads the same everywhere.
// Marked `!important` on every breakpoint so this reliably wins even where
// the element also carries a BEM class (e.g. .home-map-card__course-title)
// with its own font-size rule in styles.css — the same reason the code
// this replaces already used Tailwind's `!` modifier on those elements.
const textTitle =
  "max-[680px]:!text-[16px] min-[681px]:max-[1200px]:!text-[19px] !text-[22px]";
const textBody =
  "max-[680px]:!text-[12px] min-[681px]:max-[1200px]:!text-[14px] !text-[15px]";
const textCaption =
  "max-[680px]:!text-[10px] min-[681px]:max-[1200px]:!text-[11px] !text-[12px]";

// A small shared badge scale for TierMedal — compact (side/peeking state),
// standard (front-card header/masthead), and one deliberately oversized
// "hero" size reserved for the locked-state illustration alone, so no two
// badges on screen ever compete at the same visual weight by accident.
const badgeSm = 22;
const badgeMd = 34;
const badgeLg = 64;

// Shared card shell. Border colour, glow and the accent wash all come from
// .home-map-card in styles.css, driven by the --card-accent each card sets.
const mapCard =
  `home-map-card absolute flex h-[340px] w-[440px] cursor-pointer flex-col items-start rounded-[24px] border p-7 text-left font-medium focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 min-[681px]:max-[1200px]:!h-[360px] min-[681px]:max-[1200px]:!w-[400px] ${textBody}`;

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
  leaderboard: "249 115 22",
  portfolio: "139 124 246",
  dynamic: "34 197 94",
};
const cardLabels = {
  continueLearning: "Continue learning",
  leaderboard: "Leaderboard",
  portfolio: "Your work",
  dynamic: "What's new",
};

// The click-to-jump rail under the stack — makes "this is a paged set of
// four things" explicit instead of leaving wheel/arrow/click-a-side-card as
// the only way to discover it's a carousel at all. Desktop-only: below
// 900px every card is already visible at once in the stacked grid, so a
// pager pointing at one of them would be misleading.
function ScenePager({ activeCard, onSelect }) {
  return (
    <div
      className="mt-2 flex items-center justify-center gap-2"
      role="tablist"
      aria-label="Choose a card"
    >
      {cardOrder.map((cardId) => (
        <button
          key={cardId}
          type="button"
          role="tab"
          aria-selected={cardId === activeCard}
          aria-label={cardLabels[cardId]}
          className="h-2 w-2 flex-none rounded-full border-0 bg-white/20 p-0 transition-[width,background-color,opacity] duration-300 ease-out hover:bg-[rgb(var(--dot-accent)/0.55)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#93c5fd] data-[active=true]:w-6 data-[active=true]:bg-[rgb(var(--dot-accent))] [[data-theme=light]_&]:bg-black/15"
          style={{ "--dot-accent": cardAccents[cardId] }}
          data-active={cardId === activeCard}
          onClick={() => onSelect(cardId)}
        />
      ))}
    </div>
  );
}

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

// The same topic art the region already uses on its Paths roadmap card —
// real illustration instead of another icon standing in for one. A single
// generic icon fallback only for the rare case a path/region has no image.
function LessonIllustration({ src }) {
  if (!src) {
    return (
      <span className="home-map-card__lesson-illustration home-map-card__lesson-illustration--fallback" aria-hidden="true">
        <PlayIcon className="size-7" />
      </span>
    );
  }
  return (
    <span className="home-map-card__lesson-illustration" aria-hidden="true">
      <img src={src} alt="" />
    </span>
  );
}

// The corner cue that only appears on hover — "there is more inside this" —
// so a side card visibly invites a click instead of just sitting there.
function ExpandCue() {
  return (
    <span className="home-map-card__expand" aria-hidden="true">
      <svg className="size-4" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 17 17 7M9 7h8v8"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
      <span className="home-map-card__glyph-bar">
        <span style={{ width: `${percent}%` }} />
      </span>
    </span>
  );
}

// The lesson-row status badge — a filled circle with a green check for the
// lesson that's actually next, a muted circle with a lock for the one after
// it. Replaces the plain dot with the same "what's unlocked right now" cue
// the rest of the app already uses (streak/league locks).
function LessonStatusIcon({ locked }) {
  if (locked) {
    return (
      <span className="grid size-[26px] flex-none place-items-center rounded-full bg-white/[0.06]">
        <svg className="size-[13px]" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5V10Z"
            stroke="#6b6b70"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="relative grid size-[26px] flex-none place-items-center">
      <span
        className="grid size-full place-items-center rounded-full bg-[#3f3f46]"
        style={{ boxShadow: "0 2px 0 #2a2a2f, 0 0 0 3px rgb(var(--card-accent) / 0.15)" }}
      >
        <svg className="size-[12px]" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M8 5v14l11-7L8 5Z" />
        </svg>
      </span>
      <span className="absolute -right-0.5 -top-0.5 grid size-[13px] place-items-center rounded-full border-2 border-[#1f1f1f] bg-[#22c55e] [[data-theme=light]_&]:border-white">
        <svg className="size-[6px]" viewBox="0 0 24 24" fill="none">
          <path d="M20 6 9 17l-5-5" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}

// A small row of dots — the side-state visual grammar for anything that's
// fundamentally a *count* (projects built) rather than a single percentage.
function GlyphDots({ filled, total = 6 }) {
  return (
    <span className="home-map-card__glyph">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className="home-map-card__glyph-dot"
          data-filled={index < filled}
        />
      ))}
    </span>
  );
}

// The one obvious, full-width action every front card ends on — reuses the
// app's own bezelled ActionButton (the same pressed-3D style as "Continue
// lesson" elsewhere) rather than a flat one-off button, just recolored to
// each card's own accent.
function CardCtaButton({ children, onClick }) {
  return (
    <ActionButton
      variant="primary"
      className={`home-map-card__cta-bar flex min-h-[44px] w-full items-center justify-center gap-2 text-center font-medium ${textBody}`}
      style={{
        background: "rgb(var(--card-accent))",
        borderColor: "rgb(var(--card-accent))",
        boxShadow: "0 3px 0 rgb(var(--card-accent) / 0.6)",
      }}
      onClick={onClick}
    >
      {children}
      <ArrowLeftIcon className="size-4 rotate-180" />
    </ActionButton>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The course switcher living inside Continue Learning, instead of a
// separate Paths card — this is the whole answer to "I'm juggling a few
// courses at once and don't want to dig through Paths to swap between
// them." Only rendered once the card is front, so it never competes with
// the compact side teaser.
function CourseSwitcher({ options, selectedId, onSelect }) {
  const [open, setOpen] = useState(false);
  const selected =
    options.find((option) => option.id === selectedId) ?? options[0];
  if (options.length <= 1)
    return <span className="home-map-card__course-pill">{selected.title}</span>;

  return (
    <span className="home-map-card__course-switcher">
      <button
        type="button"
        className="home-map-card__course-pill home-map-card__course-pill--button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
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
              onClick={(event) => {
                event.stopPropagation();
                onSelect(option.id);
                setOpen(false);
              }}
            >
              <span>{option.title}</span>
              <span>{option.percent}%</span>
            </button>
          ))}
        </span>
      )}
    </span>
  );
}

export default function HomeView({
  onStartMission,
  onOpenCareerPath,
  onOpenLeaderboard,
  onOpenDevy,
  onOpenPath,
  courseOptions = [],
  completedLessonsCount = 0,
  pathTools = [],
  leagueName,
  leagueColor,
  leagueRank,
  leagueRankDelta,
  leagueNeighbors = [],
  leagueNeighborsWide = [],
  promoteCount = 1,
  seasonTimeLeft,
  seasonCoins,
  dynamicUpdate,
  streakDays = 0,
  xp = 0,
}) {
  const [mapMode, setMapMode] = useState("map");
  const [activeCard, setActiveCard] = useState("continueLearning");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const wheelLocked = useRef(false);
  const dragMoved = useRef(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 680,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 680);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const activeIndex = cardOrder.indexOf(activeCard);

  const getCardSlot = (cardId) => {
    const offset =
      (cardOrder.indexOf(cardId) - activeIndex + cardOrder.length) %
      cardOrder.length;
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
    if (window.innerWidth > 680 && getCardSlot(cardId) !== "front") {
      setMapMode("map");
      setActiveCard(cardId);
      return;
    }
    onOpen();
  };

  const onCardKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    setMapMode("map");
    setActiveCard(
      cardOrder[
        (activeIndex + direction + cardOrder.length) % cardOrder.length
      ],
    );
  };

  const changeCard = (direction) => {
    setMapMode("map");
    setActiveCard(
      cardOrder[
        (activeIndex + direction + cardOrder.length) % cardOrder.length
      ],
    );
  };

  const onSceneWheel = (event) => {
    if (
      window.innerWidth <= 900 ||
      wheelLocked.current ||
      Math.abs(event.deltaY) < 12
    )
      return;
    event.preventDefault();
    wheelLocked.current = true;
    changeCard(event.deltaY > 0 ? 1 : -1);
    window.setTimeout(() => {
      wheelLocked.current = false;
    }, 430);
  };

  // Mobile-only swipe: the stacked cards below 680px still peek their
  // neighbors at the sides, so the whole stack is wrapped in one draggable
  // Motion element below (pointer-based, so it works for touch, mouse and
  // pen alike) that moves 1:1 with the gesture and snaps back to center via
  // dragConstraints. A plain tap never reaches the offset threshold in
  // onDrag, so dragMoved stays false and the card's own onClick still opens
  // it as before; a real drag flips dragMoved so the browser's post-drag
  // ghost click (fired on whatever card sits under the finger at release)
  // gets swallowed instead of opening that card.
  const onCardDragStart = () => {
    dragMoved.current = false;
  };

  const onCardDrag = (event, info) => {
    if (Math.abs(info.offset.x) > 5) {
      dragMoved.current = true;
    }
  };

  const onCardDragEnd = (event, info) => {
    if (Math.abs(info.offset.x) > 55) {
      changeCard(info.offset.x < 0 ? 1 : -1);
    }
  };

  const onSceneClickCapture = (event) => {
    if (dragMoved.current) {
      event.preventDefault();
      event.stopPropagation();
      dragMoved.current = false;
    }
  };

  const primaryCourse = courseOptions[0];
  const selectedCourse =
    courseOptions.find((option) => option.id === selectedCourseId) ??
    primaryCourse;
  const continueSelectedCourse = () => {
    if (!selectedCourse) {
      onOpenCareerPath();
      return;
    }
    if (selectedCourse.isPrimary) {
      if (selectedCourse.nextLessonTitle) onStartMission();
      else onOpenCareerPath();
      return;
    }
    onOpenPath(selectedCourse.id);
  };

  // The league system technically seats everyone from day one, but competing
  // in it only means something after a first lesson — before that, the real
  // "unlock" moment worth telling the learner about is finishing lesson one.
  const leagueUnlocked = completedLessonsCount > 0;
  const dynamicAction =
    dynamicUpdate?.kind === "path-complete" || dynamicUpdate?.kind === "welcome"
      ? onOpenCareerPath
      : onStartMission;
  const rankTrend =
    leagueRankDelta == null
      ? "Just joined this league"
      : leagueRankDelta === 0
        ? "Holding steady"
        : `${leagueRankDelta > 0 ? "↑" : "↓"} ${Math.abs(leagueRankDelta)} today`;

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden px-[22px] py-5 max-[900px]:px-[18px] max-[680px]:px-[18px] max-[680px]:py-4">
      {/* Header hides the streak/gem counters below 680px (main.jsx) — same
          numbers, shown here instead so they're not lost, just relocated
          from the header chrome into the page's own content. */}
      <div className="hidden max-[680px]:flex items-center justify-end pb-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-2 py-1 shadow-sm">
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[13px] font-bold text-neutral-800">
            <AnimatedBoltIcon className="size-4 text-[#f5a623]" />
            {streakDays}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[13px] font-bold text-neutral-800">
            <AnimatedGemIcon className="size-4 text-[#6699ec]" />
            {xp}
          </span>
        </div>
      </div>

      <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col justify-center">
        <section
          className="home-map-scene relative left-1/2 h-[500px] w-screen -translate-x-1/2"
          data-mode={mapMode}
          aria-label="Learning map"
          onWheel={onSceneWheel}
          onClickCapture={onSceneClickCapture}
        >
          <span className="home-map-atmosphere" aria-hidden="true" />
          {/* Keep positioning on the wrapper so the compose transform never
              conflicts with the active Lottie clip. */}
          <div className="home-map-devy hidden absolute left-1/2 top-[0px] -translate-x-1/2 max-[680px]:block">
            <DevyLottie
              key={activeCard}
              clip={devyClips[activeCard]}
              className="size-36 max-[680px]:size-20"
            />
          </div>

          <motion.div
            className="absolute inset-0"
            drag={isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            dragMomentum={false}
            onDragStart={onCardDragStart}
            onDrag={onCardDrag}
            onDragEnd={onCardDragEnd}
          >
          <div
            className={`${mapCard} home-map-card--continue-learning home-map-card--lesson ${mapCardSurface} ${isFront("continueLearning") ? "!pt-3 min-[681px]:max-[1200px]:!top-[54px] min-[681px]:max-[1200px]:!h-[410px] min-[681px]:max-[1200px]:!w-[460px] min-[681px]:max-[1200px]:!p-6" : ""}`}
            style={{ "--card-accent": cardAccents.continueLearning }}
            data-slot={getCardSlot("continueLearning")}
            tabIndex={0}
            role="group"
            aria-label="Continue learning"
            aria-current={isFront("continueLearning") ? "true" : undefined}
            onKeyDown={onCardKeyDown}
            onClick={() =>
              openOrSelect("continueLearning", continueSelectedCourse)
            }
          >
            {!isFront("continueLearning") && (
              <div className="home-map-card__header-row flex w-full items-center justify-between gap-2">
                <span className="home-map-card__continue-label flex items-center gap-2.5">
                  <IconChip icon={PlayIcon} tone="blue" />
                  <span className="home-map-card__section-label">
                    Continue learning
                  </span>
                </span>
                <ExpandCue />
              </div>
            )}

            <span className="home-map-card__side">
              <GlyphBar percent={primaryCourse?.percent ?? 0} />
              <span className="home-map-card__side-value">
                {primaryCourse?.title ?? "Continue learning"}
              </span>
              <span className="home-map-card__side-label">
                {primaryCourse?.nextLessonTitle ?? "Path complete"}
              </span>
            </span>

            <span className="home-map-card__lesson-details !mt-0">
              <span className="home-map-card__course-heading !gap-2 pt-3! !pb-2">
                <strong className={`home-map-card__course-title ${textTitle}`}>
                  {selectedCourse?.regionTitle ?? selectedCourse?.title ?? "Continue learning"}
                </strong>
                {selectedCourse?.regionLessonsTotal > 0 && (
                  <span className={`home-map-card__course-level ${textCaption}`}>
                    Lesson {(selectedCourse?.regionLessonsCompleted ?? 0) + 1} of{" "}
                    {selectedCourse.regionLessonsTotal}
                  </span>
                )}
                <span className="home-map-card__course-progress">
                  <span className="home-map-card__progress">
                    <span style={{ width: `${selectedCourse?.regionPercent ?? 0}%` }} />
                  </span>
                  <span className={`home-map-card__course-progress-value ${textCaption}`}>{selectedCourse?.regionPercent ?? 0}%</span>
                </span>
                <LessonIllustration src={selectedCourse?.regionImage} />
              </span>

              <span className="home-map-card__lesson-list">
                <span className="home-map-card__lesson-row" data-state="current">
                  <LessonStatusIcon locked={false} />
                  <strong className={selectedCourse?.nextLessonTitle ? undefined : "home-map-card__lesson-complete"}>
                    {selectedCourse?.nextLessonTitle ?? `${selectedCourse?.title ?? "This path"} complete`}
                  </strong>
                </span>
                {/* {selectedCourse?.nextLessonTitle && selectedCourse?.upNextTitle && (
                  <span className="home-map-card__lesson-row" data-state="upcoming">
                    <LessonStatusIcon locked />
                    <span>{selectedCourse.upNextTitle}</span>
                  </span>
                )} */}
              </span>
            </span>

            <CardCtaButton
              onClick={(event) => {
                event.stopPropagation();
                openOrSelect("continueLearning", continueSelectedCourse);
              }}
            >
              {selectedCourse?.nextLessonTitle
                ? "Continue lesson"
                : selectedCourse?.isPrimary
                  ? "See what's next"
                  : "Open path"}
            </CardCtaButton>
          </div>

          <div
            className={`${mapCard} home-map-card--leaderboard ${mapCardSurface} ${isFront("leaderboard") ? "min-[681px]:max-[1200px]:!top-[54px] min-[681px]:max-[1200px]:!h-[410px] min-[681px]:max-[1200px]:!w-[460px] min-[681px]:max-[1200px]:!p-6" : ""}`}
            style={{ "--card-accent": cardAccents.leaderboard }}
            data-slot={getCardSlot("leaderboard")}
            tabIndex={0}
            role="group"
            aria-label="Leaderboard"
            aria-current={isFront("leaderboard") ? "true" : undefined}
            onKeyDown={onCardKeyDown}
            onClick={() => openOrSelect("leaderboard", onOpenLeaderboard)}
          >
            {(!isFront("leaderboard") || !leagueUnlocked) && (
              <div className="flex w-full items-center justify-between gap-2">
                <span className="flex items-center gap-2.5">
                  <TierMedal
                    league={{ color: leagueColor || leaderboardMedalColor }}
                    state="current"
                    size={badgeMd}
                  />
                  <span className="home-map-card__section-label">
                    Leaderboard
                  </span>
                </span>
                {!isFront("leaderboard") && <ExpandCue />}
              </div>
            )}

            {!leagueUnlocked ? (
              <>
                <span className="home-map-card__side">
                  <span className="home-map-card__side-value home-map-card__side-value--text">
                    🔒 Locked
                  </span>
                  <span className="home-map-card__side-label">
                    Finish a lesson to unlock leagues
                  </span>
                </span>
                <span className="home-map-card__details home-map-card__details--centered">
                  <span className="relative grid place-items-center">
                    <span
                      className="absolute size-20 rounded-full blur-2xl"
                      style={{ background: "rgb(var(--card-accent) / 0.35)" }}
                      aria-hidden="true"
                    />
                    <span className="relative">
                      <TierMedal
                        league={{ color: leagueColor || leaderboardMedalColor }}
                        state="locked"
                        size={badgeLg}
                      />
                    </span>
                  </span>
                  <strong className={`font-bold text-[#f4f4f2] ${textTitle}`}>
                    Locked
                  </strong>
                  <span className={`font-medium text-[#8a8f9c] ${textCaption}`}>
                    Finish a lesson to unlock
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="home-map-card__side">
                  <span className="mb-1 flex items-center gap-2">
                    <TierMedal
                      league={{ color: leagueColor || leaderboardMedalColor }}
                      state="default"
                      size={badgeSm}
                    />
                    <span className="flex flex-col leading-tight">
                      <strong className={`font-bold text-[#f4f4f2] ${textBody}`}>
                        {leagueName}
                      </strong>
                      <span
                        className={`font-bold ${textCaption}`}
                        style={{ color: "rgb(var(--card-accent))" }}
                      >
                        #{leagueRank ?? "—"} &middot; {rankTrend}
                      </span>
                    </span>
                  </span>

                  <span className="relative -mx-1 overflow-hidden px-1">
                    {leagueNeighbors.slice(0, 2).map((entry) => (
                      <span
                        key={entry.id}
                        className="flex items-center gap-2 py-[3px]"
                      >
                        <span className={`grid size-[22px] flex-none place-items-center rounded-full bg-white/10 font-bold text-[#d0d3da] ${textCaption}`}>
                          {entry.name?.[0]?.toUpperCase()}
                        </span>
                        <span className={`flex-1 font-semibold text-[#8a8f9c] ${textCaption}`}>
                          {entry.name}
                        </span>
                        <span className={`font-bold text-[#8a8f9c] ${textCaption}`}>
                          {entry.score}
                        </span>
                      </span>
                    ))}
                    <span
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#1f1f1f] to-transparent [[data-theme=light]_&]:from-white"
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    className="mt-0.5 flex items-center gap-2 rounded-xl px-2 py-[5px]"
                    style={{ background: "rgb(var(--card-accent) / 0.15)" }}
                  >
                    <span
                      className="grid size-[24px] flex-none place-items-center rounded-full text-[11px] font-bold text-white"
                      style={{ background: "rgb(var(--card-accent))" }}
                    >
                      You
                    </span>
                    <span className={`flex-1 font-bold text-[#f4f4f2] ${textBody}`}>
                      #{leagueRank ?? "—"}
                    </span>
                    <span className={`font-bold text-[#f4f4f2] ${textBody}`}>
                      {seasonCoins}
                    </span>
                  </span>
                </span>

                <span className="home-map-card__details home-map-card__details--leaderboard">
                  <span className="flex items-center gap-3 pb-2">
                    <TierMedal
                      league={{ color: leagueColor || leaderboardMedalColor }}
                      state="current"
                      size={badgeMd}
                    />
                    <span className="flex-1">
                      <strong className={`block font-rubik font-extrabold uppercase tracking-[0.02em] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 ${textTitle}`}>
                        {leagueName}
                      </strong>
                      <span className={`block font-semibold text-[#8a8f9c] ${textCaption}`}>
                        Top {promoteCount} advance &middot; {seasonTimeLeft}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label="View full leaderboard"
                      className="grid size-8 flex-none place-items-center rounded-lg text-[#6b6b70] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-800"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenLeaderboard();
                      }}
                    >
                      <svg className="size-[18px]" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </span>

                  <span
                    className="relative -mx-1 h-[150px] overflow-hidden border-t border-white/[0.08]"
                    style={{ display: "block" }}
                  >
                    <span className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col">
                      {leagueNeighborsWide.map((entry, index) => (
                        <span
                          key={entry.id}
                          className={`home-map-card__standings-row items-center gap-3 px-4! py-3! ${textBody} ${entry.isCurrentUser ? "rounded-xl bg-[rgb(var(--card-accent)/0.15)]" : ""}`}
                          data-self={entry.isCurrentUser}
                        >
                          <span className="flex flex-1 items-center gap-3">
                            <span
                              className="grid size-8 flex-none place-items-center rounded-full text-[12px] font-bold text-white"
                              style={{
                                background: entry.isCurrentUser
                                  ? "rgb(var(--card-accent))"
                                  : avatarPalette[index % avatarPalette.length],
                              }}
                            >
                              {entry.name?.[0]?.toUpperCase()}
                            </span>
                            <span>
                              #{entry.rank} {entry.name}
                            </span>
                          </span>
                          <span>{entry.score}</span>
                        </span>
                      ))}
                    </span>
                    <span
                      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-[#1f1f1f] to-transparent [[data-theme=light]_&]:from-white"
                      aria-hidden="true"
                    />
                    <span
                      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-[#1f1f1f] to-transparent [[data-theme=light]_&]:from-white"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </>
            )}

            <CardCtaButton
              onClick={(event) => {
                event.stopPropagation();
                openOrSelect("leaderboard", onOpenLeaderboard);
              }}
            >
              View leaderboard
            </CardCtaButton>
          </div>

          <div
            className={`${mapCard} home-map-card--portfolio ${mapCardSurface} ${isFront("portfolio") ? "min-[681px]:max-[1200px]:!top-[54px] min-[681px]:max-[1200px]:!h-[410px] min-[681px]:max-[1200px]:!w-[460px] min-[681px]:max-[1200px]:!p-6" : ""}`}
            style={{ "--card-accent": cardAccents.portfolio }}
            data-slot={getCardSlot("portfolio")}
            tabIndex={0}
            role="group"
            aria-label="Your work"
            aria-current={isFront("portfolio") ? "true" : undefined}
            onKeyDown={onCardKeyDown}
            onClick={() => openOrSelect("portfolio", onOpenCareerPath)}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="flex items-center gap-2.5">
                <IconChip icon={RocketIcon} tone="violet" />
                <span className="home-map-card__section-label">
                  Your work
                </span>
              </span>
              {!isFront("portfolio") && <ExpandCue />}
            </div>

            {completedLessonsCount === 0 ? (
              <>
                <span className="home-map-card__side">
                  <GlyphDots filled={0} />
                  <span className="home-map-card__side-value home-map-card__side-value--text">
                    Your portfolio starts here
                  </span>
                  <span className="home-map-card__side-label">
                    Complete a lesson to begin
                  </span>
                </span>
                <span className="home-map-card__details">
                  <span>
                    Finish your first lesson and your work will start showing up
                    here.
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="home-map-card__side">
                  <GlyphDots filled={completedLessonsCount % 6 || 6} />
                  <span className="home-map-card__side-value">
                    {completedLessonsCount}
                  </span>
                  <span className="home-map-card__side-label">
                    {completedLessonsCount === 1
                      ? "lesson completed"
                      : "lessons completed"}
                  </span>
                  {pathTools.length > 0 && (
                    <span className="mt-2.5 flex flex-wrap gap-1.5">
                      {pathTools.slice(0, 3).map((tool) => (
                        <span
                          key={tool}
                          className={`rounded-full px-2 py-[3px] font-bold ${textCaption}`}
                          style={{
                            background: "rgb(var(--card-accent) / 0.15)",
                            color: "rgb(var(--card-accent))",
                          }}
                        >
                          {tool}
                        </span>
                      ))}
                    </span>
                  )}
                </span>

                <span className="home-map-card__details">
                  <span>
                    {completedLessonsCount} lesson
                    {completedLessonsCount === 1 ? "" : "s"} completed
                  </span>
                  {pathTools.length > 0 && (
                    <span>
                      Skills so far: {pathTools.slice(0, 4).join(", ")}
                    </span>
                  )}
                </span>
              </>
            )}

            <CardCtaButton
              onClick={(event) => {
                event.stopPropagation();
                openOrSelect("portfolio", onOpenCareerPath);
              }}
            >
              {completedLessonsCount === 0
                ? "Explore first project"
                : "View portfolio"}
            </CardCtaButton>
          </div>

          <div
            className={`${mapCard} home-map-card--dynamic ${mapCardSurface} ${isFront("dynamic") ? "min-[681px]:max-[1200px]:!top-[54px] min-[681px]:max-[1200px]:!h-[410px] min-[681px]:max-[1200px]:!w-[460px] min-[681px]:max-[1200px]:!p-6" : ""}`}
            style={{ "--card-accent": cardAccents.dynamic }}
            data-slot={getCardSlot("dynamic")}
            tabIndex={0}
            role="group"
            aria-label="What's new"
            aria-current={isFront("dynamic") ? "true" : undefined}
            onKeyDown={onCardKeyDown}
            onClick={() => openOrSelect("dynamic", dynamicAction)}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="flex items-center gap-2.5">
                <IconChip icon={SparkleIcon} tone="teal" />
                <span className="home-map-card__section-label">
                  What's new
                </span>
              </span>
              {!isFront("dynamic") && <ExpandCue />}
            </div>

            <span className="home-map-card__side">
              <span className="home-map-card__side-value home-map-card__side-value--text">
                {dynamicUpdate?.title}
              </span>
              <span className="home-map-card__side-label">
                {dynamicUpdate?.body}
              </span>
            </span>

            <span className="home-map-card__details">
              <span>{dynamicUpdate?.title}</span>
              <span>{dynamicUpdate?.body}</span>
            </span>

            <CardCtaButton
              onClick={(event) => {
                event.stopPropagation();
                openOrSelect("dynamic", dynamicAction);
              }}
            >
              {dynamicUpdate?.cta ?? "Open"}
            </CardCtaButton>
          </div>
          </motion.div>
        </section>

        <ScenePager
          activeCard={activeCard}
          onSelect={(cardId) => {
            setMapMode("map");
            setActiveCard(cardId);
          }}
        />

        {/* Below 680px the floating "Ask Devy" button (rendered globally in
            main.jsx) takes over for this whole band — Devy Pro and Career
            Path stay reachable from the account menu and the Paths tab. */}
        <section
          className="home-quick-actions relative mx-auto mt-3 flex w-full max-w-[1040px] items-center justify-center py-3"
          aria-label="Quick actions"
        >
          <DevyPromptBand
            isComposing={mapMode === "compose"}
            accent={cardAccents[activeCard]}
            onComposeStart={() => setMapMode("compose")}
            onComposeEnd={() => setMapMode("map")}
            onOpen={onOpenDevy}
          />
        </section>
      </div>
    </div>
  );
}
