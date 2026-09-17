import { useRef, useState } from "react";
import { DevyLottie } from "../ui/DevyLottie";
import { ArrowLeftIcon, CompassIcon, CrownIcon, DumbbellIcon, PlayIcon, PodiumIcon, RocketIcon, RouteIcon } from "../ui/icons";
import { DevyPromptBand } from "./DevyPromptBand";

// Shared card shell. Border colour, glow and the accent wash all come from
// .home-map-card in styles.css, driven by the --card-accent each card sets.
const mapCard =
  "home-map-card absolute flex h-[250px] w-[360px] flex-col items-start rounded-3xl border p-6 text-left text-[21px] font-medium focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 max-[900px]:static max-[900px]:size-auto max-[900px]:min-h-[250px]";

const mapCardSurface =
  "bg-[#1f1f1f] text-[#f4f4f2] hover:bg-[#252525] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-white";

const chipClass = "grid size-9 flex-none place-items-center rounded-xl";
const cardOrder = ["practice", "leaderboard", "lesson", "projects", "paths"];
const devyClips = {
  practice: "wave",
  leaderboard: "listening",
  lesson: "thinking",
  projects: "walk",
  paths: "wave",
};
const cardAccents = {
  practice: "245 166 35",
  leaderboard: "224 80 122",
  lesson: "59 130 246",
  projects: "139 124 246",
  paths: "4 173 192",
};

// Small colored icon badge, top-left of each card — the same accent hues
// Badge.jsx's TONES already use, reused here instead of new colors.
function IconChip({ icon: Icon, tone }) {
  const tones = {
    orange: `${chipClass} bg-[#f5a623]/15 text-[#f5a623]`,
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

export default function HomeView({
  onStartMission,
  onOpenCareerPath,
  onOpenDevyPro,
  onOpenLeaderboard,
  onSeeAllPractice,
  onOpenDevy,
  currentPathTitle,
  currentLessonTitle,
  pathProgress,
  currentRegionTitle,
  currentRegionProgress,
  currentRegionLessonsCompleted,
  currentRegionLessonsTotal,
  practiceSession,
  leagueName,
  leagueRank,
  seasonCoins,
}) {
  const [mapMode, setMapMode] = useState("map");
  const [activeCard, setActiveCard] = useState("lesson");
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

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden px-[22px] py-5 max-[900px]:h-auto max-[900px]:overflow-visible max-[900px]:px-[18px] max-[900px]:pb-8 max-[680px]:min-h-[calc(100dvh-64px)] max-[680px]:h-auto max-[680px]:flex max-[680px]:flex-col max-[680px]:justify-center max-[680px]:px-[18px] max-[680px]:py-6">
      <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col justify-center max-[900px]:h-auto max-[680px]:my-auto max-[680px]:w-full max-[680px]:items-center">
        <section
          className="home-map-scene relative h-[520px] max-[900px]:grid max-[900px]:h-auto max-[900px]:grid-cols-2 max-[900px]:gap-4 max-[680px]:flex max-[680px]:flex-col max-[680px]:items-center max-[680px]:justify-center max-[680px]:w-full max-[680px]:gap-4"
          data-mode={mapMode}
          aria-label="Learning map"
          onWheel={onSceneWheel}
        >
          <span className="home-map-atmosphere" aria-hidden="true" />
          {/* Keep positioning on the wrapper so the compose transform never
              conflicts with the active Lottie clip. */}
          <div className="home-map-devy absolute left-1/2 top-[30px] -translate-x-1/2 max-[900px]:static max-[900px]:col-span-2 max-[900px]:justify-self-center max-[900px]:translate-x-0">
            <DevyLottie
              key={activeCard}
              clip={devyClips[activeCard]}
              flip={activeCard === "paths"}
              className="size-36 max-[680px]:size-20"
            />
          </div>

          <button
            type="button"
            onClick={() => openOrSelect("practice", onSeeAllPractice)}
            onKeyDown={onCardKeyDown}
            style={{ "--card-accent": "245 166 35" }}
            className={`${mapCard} home-map-card--practice ${mapCardSurface}`}
            data-slot={getCardSlot("practice")}
            tabIndex={0}
            aria-current={getCardSlot("practice") === "front" ? "true" : undefined}
          >
            <IconChip icon={DumbbellIcon} tone="orange" />
            <span className="home-map-card__title">Practice</span>
            <span className="home-map-card__details">
              <span>{practiceSession?.title ?? "A recommended session"}</span>
              <span>{practiceSession ? `${practiceSession.minutes} min · Recommended for you` : "Recommended for you"}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => openOrSelect("paths", onOpenCareerPath)}
            onKeyDown={onCardKeyDown}
            style={{ "--card-accent": "4 173 192" }}
            className={`${mapCard} home-map-card--paths ${mapCardSurface}`}
            data-slot={getCardSlot("paths")}
            tabIndex={0}
            aria-current={getCardSlot("paths") === "front" ? "true" : undefined}
          >
            <IconChip icon={CompassIcon} tone="teal" />
            <span className="home-map-card__title">Paths</span>
            <span className="home-map-card__details">
              <span>{currentPathTitle}</span>
              <span>{pathProgress}% complete · Continue your path</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => openOrSelect("leaderboard", onOpenLeaderboard)}
            onKeyDown={onCardKeyDown}
            style={{ "--card-accent": "224 80 122" }}
            className={`${mapCard} home-map-card--leaderboard ${mapCardSurface}`}
            data-slot={getCardSlot("leaderboard")}
            tabIndex={0}
            aria-current={getCardSlot("leaderboard") === "front" ? "true" : undefined}
          >
            <IconChip icon={PodiumIcon} tone="pink" />
            <span className="home-map-card__title">Leaderboard</span>
            <span className="home-map-card__details">
              <span>{leagueName} · #{leagueRank ?? "—"}</span>
              <span>{seasonCoins} coins earned this season</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => openOrSelect("projects", onOpenCareerPath)}
            onKeyDown={onCardKeyDown}
            style={{ "--card-accent": "139 124 246" }}
            className={`${mapCard} home-map-card--projects ${mapCardSurface}`}
            data-slot={getCardSlot("projects")}
            tabIndex={0}
            aria-current={getCardSlot("projects") === "front" ? "true" : undefined}
          >
            <IconChip icon={RocketIcon} tone="violet" />
            <span className="home-map-card__title">Projects</span>
            <span className="home-map-card__details">
              <span>Build something with your skills</span>
              <span>Explore project ideas</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => openOrSelect("lesson", () => { if (currentLessonTitle) onStartMission(); else onOpenCareerPath() })}
            onKeyDown={onCardKeyDown}
            style={{ "--card-accent": "59 130 246" }}
            className={`${mapCard} home-map-card--lesson bg-[#1c2a4d] text-[#f4f4f2] hover:bg-[#213762] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-white max-[900px]:col-span-2 max-[680px]:min-h-[190px] max-[680px]:w-full max-[680px]:max-w-[480px] max-[680px]:mx-auto`}
            data-slot={getCardSlot("lesson")}
            tabIndex={0}
            aria-current={getCardSlot("lesson") === "front" ? "true" : undefined}
          >
            <IconChip icon={PlayIcon} tone="blue" />
            <h1 className="home-map-card__title m-0 font-rubik text-[21px] font-medium leading-none">
              {currentRegionTitle ?? "Current Lesson"}
            </h1>
            <span className="home-map-card__lesson-details">
              <strong className={currentLessonTitle ? undefined : "home-map-card__lesson-complete"}>{currentLessonTitle ?? "Current path complete"}</strong>
              <span>{currentPathTitle} · {currentRegionLessonsCompleted}/{currentRegionLessonsTotal} lessons</span>
              <span className="home-map-card__progress" aria-label={`${currentRegionProgress}% of this region complete`}>
                <span style={{ width: `${currentRegionProgress}%` }} />
              </span>
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
          className="home-quick-actions relative mx-auto flex w-full max-w-[1040px] items-center justify-center py-6"
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
