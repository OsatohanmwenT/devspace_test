import { useEffect, useRef, useState } from "react";
import { DevyMood } from "../ui/DevyMood";
import { CompassIcon, CrownIcon, DumbbellIcon, PlayIcon, PodiumIcon, RocketIcon, RouteIcon } from "../ui/icons";
import { DevyPromptBand } from "./DevyPromptBand";

// Shared card shell. Border colour, glow and the accent wash all come from
// .home-map-card in styles.css, driven by the --card-accent each card sets.
const mapCard =
  "home-map-card absolute flex h-[116px] w-36 flex-col items-start justify-between rounded-3xl border p-4 text-left text-[17px] font-medium focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 max-[900px]:static max-[900px]:size-auto max-[900px]:min-h-[144px] max-[680px]:min-h-[96px]";

const mapCardSurface =
  "bg-[#1f1f1f] text-[#f4f4f2] hover:bg-[#252525] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-white";

const chipClass = "grid size-9 flex-none place-items-center rounded-xl";

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
  leaderboardPreview,
}) {
  const [mapMode, setMapMode] = useState("map");
  const [activePreview, setActivePreview] = useState(null);
  const leaderboardCardRef = useRef(null);

  useEffect(() => {
    if (activePreview !== "leaderboard") return undefined;

    const closePreview = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setActivePreview(null);
      window.requestAnimationFrame(() => leaderboardCardRef.current?.focus());
    };

    window.addEventListener("keydown", closePreview);
    return () => window.removeEventListener("keydown", closePreview);
  }, [activePreview]);

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden px-[22px] py-5 max-[900px]:h-auto max-[900px]:overflow-visible max-[900px]:px-[18px] max-[680px]:px-[18px] max-[680px]:py-6">
      <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col justify-center max-[900px]:h-auto">
        <section
          className="home-map-scene relative h-[520px] max-[900px]:grid max-[900px]:h-auto max-[900px]:grid-cols-2 max-[900px]:gap-4 max-[680px]:grid-cols-1"
          data-mode={mapMode}
          data-preview={activePreview ?? ""}
          aria-label="Learning map"
        >
          <span className="home-map-atmosphere" aria-hidden="true" />
          {/* Positioning sits on the wrapper so the idle float, which animates
              transform, doesn't cancel the -translate-x-1/2 centering. */}
          <div className="home-map-devy absolute left-1/2 top-[96px] -translate-x-1/2 max-[900px]:static max-[900px]:col-span-2 max-[900px]:justify-self-center max-[900px]:translate-x-0 max-[680px]:col-span-1">
            <DevyMood mood="neutral" className="devy-idle size-36" />
          </div>

          <button
            type="button"
            onClick={() => {
              setMapMode("map");
              onSeeAllPractice();
            }}
            style={{ "--card-accent": "245 166 35" }}
            className={`${mapCard} home-map-card--practice ${mapCardSurface} left-[calc(50%-390px)] top-[164px]`}
          >
            <IconChip icon={DumbbellIcon} tone="orange" />
            Practice
          </button>
          <button
            type="button"
            onClick={() => {
              setMapMode("map");
              onOpenCareerPath();
            }}
            style={{ "--card-accent": "4 173 192" }}
            className={`${mapCard} home-map-card--paths ${mapCardSurface} left-[calc(50%+246px)] top-[164px]`}
          >
            <IconChip icon={CompassIcon} tone="teal" />
            Paths
          </button>
          <button
            ref={leaderboardCardRef}
            type="button"
            onClick={() => {
              setMapMode("map");
              setActivePreview("leaderboard");
            }}
            style={{ "--card-accent": "224 80 122" }}
            className={`${mapCard} home-map-card--leaderboard ${mapCardSurface} left-[calc(50%-230px)] top-[244px]`}
            aria-expanded={activePreview === "leaderboard"}
            aria-controls="home-leaderboard-preview"
            disabled={activePreview === "leaderboard"}
          >
            <IconChip icon={PodiumIcon} tone="pink" />
            Leaderboard
          </button>
          <button
            type="button"
            onClick={() => {
              setMapMode("map");
              onOpenCareerPath();
            }}
            style={{ "--card-accent": "139 124 246" }}
            className={`${mapCard} home-map-card--projects ${mapCardSurface} left-[calc(50%+86px)] top-[244px]`}
          >
            <IconChip icon={RocketIcon} tone="violet" />
            Projects
          </button>
          {/* A real 3D flip card, not a slide-and-swap: the hero slot is one
              object with two faces glued back-to-back. Clicking Leaderboard
              spins it around its own vertical axis to its back face rather
              than sliding a separate panel over the top. */}
          <div
            style={{ "--card-accent": "59 130 246" }}
            className="home-flip absolute left-1/2 top-[300px] h-[300px] w-[280px] -translate-x-1/2 max-[900px]:static max-[900px]:h-auto max-[900px]:w-full max-[900px]:translate-x-0 max-[900px]:col-span-2 max-[680px]:col-span-1"
          >
            <div className={`home-flip-inner ${activePreview === "leaderboard" ? "is-flipped" : ""}`}>
              <button
                type="button"
                onClick={() => {
                  setMapMode("map");
                  onStartMission();
                }}
                className="home-flip-face home-flip-face--front home-map-card-featured flex flex-col items-start justify-between rounded-3xl border p-5 text-left text-[#f4f4f2] bg-[#1c2a4d] hover:bg-[#213762] [[data-theme=light]_&]:bg-[#f0f5fd] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-[#e2edfc]"
                tabIndex={activePreview === "leaderboard" ? -1 : 0}
              >
                <IconChip icon={PlayIcon} tone="blue" />
                <h1 className="m-0 font-rubik text-2xl font-medium leading-none">
                  Current Lesson
                </h1>
              </button>

              <article
                id="home-leaderboard-preview"
                className="home-flip-face home-flip-face--back rounded-3xl border border-[#e0507a]/70 bg-[#1f1f1f] p-4 text-[#f4f4f2] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:text-neutral-800"
                aria-labelledby="home-leaderboard-preview-title"
                aria-hidden={activePreview !== "leaderboard"}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="m-0 text-xs font-medium text-[#f5a6bc] [[data-theme=light]_&]:text-[#b22d58]">
                      {leaderboardPreview?.league?.name}
                    </p>
                    <h2 id="home-leaderboard-preview-title" className="mt-1 text-lg font-semibold">
                      Leaderboard
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePreview(null);
                      window.requestAnimationFrame(() => leaderboardCardRef.current?.focus());
                    }}
                    className="grid size-9 place-items-center rounded-full text-[#b7b7bb] hover:bg-white/10 hover:text-white focus-visible:outline-3 focus-visible:outline-[#f5a6bc] focus-visible:outline-offset-2 [[data-theme=light]_&]:hover:bg-black/5 [[data-theme=light]_&]:hover:text-neutral-800"
                    aria-label="Close leaderboard preview"
                    tabIndex={activePreview === "leaderboard" ? 0 : -1}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <p className="mt-1 text-xs text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
                  Your place this season
                </p>

                <ul className="mt-3 space-y-1.5" aria-label="Leaderboard standings around you">
                  {(leaderboardPreview?.entries ?? []).map((entry) => {
                    const isCurrentUser = entry.isCurrentUser;
                    return (
                      <li
                        key={entry.id}
                        className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm ${isCurrentUser ? "border border-[#8bb5f5] bg-[#2a293c] font-semibold [[data-theme=light]_&]:border-[#b9d4f7] [[data-theme=light]_&]:bg-[#e9f2ff]" : "bg-black/10 [[data-theme=light]_&]:bg-black/[0.03]"}`}
                      >
                        <span className="w-5 text-center text-xs tabular-nums text-[#b7b7bb] [[data-theme=light]_&]:text-[#686968]">
                          {entry.rank}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                        <span className="text-xs tabular-nums text-[#d8d8dc] [[data-theme=light]_&]:text-[#555556]">
                          {entry.score.toLocaleString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    setActivePreview(null);
                    onOpenLeaderboard();
                  }}
                  className="mt-3 min-h-11 w-full rounded-xl bg-[#6699ec] px-4 text-sm font-semibold text-white shadow-[inset_0_-3px_0_rgba(20,37,99,.3)] hover:bg-[#4f83db] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-2 [[data-theme=light]_&]:bg-[#2563eb] [[data-theme=light]_&]:hover:bg-[#1d4ed8]"
                  tabIndex={activePreview === "leaderboard" ? 0 : -1}
                >
                  Proceed to Leaderboard
                </button>
              </article>
            </div>
          </div>
        </section>

        <section
          className="relative mx-auto flex w-full max-w-[1040px] items-center justify-center py-6 max-[900px]:mt-6 max-[680px]:mt-4"
          aria-label="Quick actions"
        >
          <div className="absolute left-0 flex gap-3 max-[680px]:static max-[680px]:mr-3">
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
            onComposeStart={() => {
              setActivePreview(null);
              setMapMode("compose");
            }}
            onComposeEnd={() => setMapMode("map")}
            onOpen={onOpenDevy}
          />

          <div className="absolute right-0 flex gap-3 max-[680px]:static max-[680px]:ml-3">
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
