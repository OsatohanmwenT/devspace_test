import {
  animate as animateValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TierMedal } from "../leaderboard/TierMedal";
import { ActionButton } from "../ui/ActionButton";
import { DevyLottie } from "../ui/DevyLottie";
import { DevyMood } from "../ui/DevyMood";
import {
    ArrowLeftIcon,
    BoltIcon,
    GemIcon,
    PlayIcon,
    RocketIcon,
    SparkleIcon,
} from "../ui/icons";
import { DevyPromptBand } from "./DevyPromptBand";
import { useCardCarousel } from "./useCardCarousel";

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
  "max-[680px]:!text-[18px] min-[681px]:max-[1200px]:!text-[19px] !text-[22px]";
const textBody =
  "max-[680px]:!text-[14px] min-[681px]:max-[1200px]:!text-[14px] !text-[15px]";
const textCaption =
  "max-[680px]:!text-[11px] min-[681px]:max-[1200px]:!text-[11px] !text-[12px]";

// A small shared badge scale for TierMedal — compact (side/peeking state),
// standard (front-card header/masthead), and one deliberately oversized
// "hero" size reserved for the locked-state illustration alone, so no two
// badges on screen ever compete at the same visual weight by accident.
const badgeSm = 22;
const badgeMd = 34;
const badgeLg = 64;

// Shared card shell. Border colour, glow and the accent wash all come from
// .home-map-card in styles.css, driven by the --card-accent each card sets.
// Mobile positioning here (top/left/width/height/padding/origin) is the
// single place to retune the mobile card box — change it once and every
// card picks it up. `left`/`width` must stay in step with CAROUSEL.PEEK
// (45) in useCardCarousel.js. The transform itself is NOT set here — it's
// written per-frame by useCardCarousel's paint(), which is why it's absent
// from this class list even though transform-origin/backface-visibility are.
const mapCard =
  `home-map-card absolute flex h-[340px] w-[440px] cursor-pointer flex-col items-start rounded-[24px] border !border-white/10 p-7 text-left font-medium hover:!border-white/20 focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 [[data-theme=light]_&]:!border-neutral-200 [[data-theme=light]_&]:hover:!border-neutral-300 min-[681px]:max-[1200px]:!h-[360px] min-[681px]:max-[1200px]:!w-[400px] max-[680px]:!top-[96px] max-[680px]:!left-[45px] max-[680px]:!w-[calc(100vw-90px)] max-[680px]:!h-[340px] max-[680px]:![padding:10px_24px_20px] max-[680px]:!origin-center max-[680px]:![backface-visibility:hidden] max-[680px]:!visible max-[680px]:![transition:transform_420ms_cubic-bezier(0.22,0.8,0.24,1),opacity_300ms_ease,filter_300ms_ease,border-color_300ms_ease,background-color_300ms_ease] ${textBody}`;

const lightFrontElevation =
  "[[data-theme=light]_&]:![box-shadow:0_10px_24px_-18px_rgba(20,20,40,0.14),0_8px_18px_-20px_rgb(var(--card-accent)_/_0.04)] max-[680px]:[[data-theme=light]_&]:![box-shadow:0_8px_18px_-16px_rgba(20,20,40,0.12),0_6px_14px_-18px_rgb(var(--card-accent)_/_0.03)]";
const darkMobileFrontDepth =
  "max-[680px]:[[data-theme=dark]_&]:![box-shadow:0_12px_24px_-20px_rgb(var(--card-accent)_/_0.06),0_7px_16px_-15px_rgb(0_0_0_/_0.28)]";

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
// four things" explicit instead of leaving wheel/arrow/swipe as the only way
// to discover it's a carousel at all. Shown at every width, including mobile
// where the input band below is pinned absolute — the extra -mt on mobile
// clears that band instead of sitting underneath it.
function ScenePager({ activeCard, onSelect }) {
  return (
    <div
      className="-mt-2 flex items-center justify-center gap-2 min-[1201px]:hidden max-[680px]:hidden"
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
          className="h-2 w-2 flex-none rounded-full border-0 bg-white/20 p-0 transition-[width,background-color,opacity] duration-300 ease-out hover:bg-[rgb(var(--dot-accent)/0.55)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#93c5fd] data-[active=true]:w-6 data-[active=true]:bg-[rgb(var(--dot-accent))] [[data-theme=light]_&]:bg-black/40"
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
    <span className="home-map-card__lesson-illustration max-[680px]:!my-1.5 max-[680px]:!size-20" aria-hidden="true">
      <img src={src} alt="" />
    </span>
  );
}

// The region art used to just sit inline with the rest of the heading text —
// one more paragraph in the stack. Mounting it on a tinted plate that
// straddles the card's own top edge gives Continue Learning the one hero
// moment a "what am I on right now" card should lead with, instead of every
// element on the card carrying equal weight.
function HeroBadge({ src }) {
  return (
    <span className="home-map-card__hero-badge" aria-hidden="true">
      <LessonIllustration src={src} />
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
      {/* A soft, contained spotlight behind the one lesson that's actually
          current — the same "this is the live one" cue TierMedal's ring
          uses elsewhere, just as a glow instead of a ring, since this icon
          already has its own ring. */}
      <span
        className="pointer-events-none absolute inset-[-6px] -z-10 rounded-full blur-md"
        style={{ background: "rgb(var(--card-accent) / 0.35)" }}
        aria-hidden="true"
      />
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

// The right-hand "not done yet" marker on a lesson row — a plain ring, tinted
// with the card's accent on the current lesson so the eye still lands there
// first, neutral grey on anything after it. Deliberately never filled here:
// neither row in this list has been completed, and a filled/checked state
// belongs to the left-hand LessonStatusIcon once a lesson actually is done.
function LessonStatusRing({ current }) {
  return (
    <span
      className={`size-[18px] flex-none rounded-full border-2 ${current ? "" : "border-white/[0.14] [[data-theme=light]_&]:border-black/[0.12]"}`}
      style={current ? { borderColor: "rgb(var(--card-accent) / 0.7)" } : undefined}
      aria-hidden="true"
    />
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
      className={`home-map-card__cta-bar flex min-h-[44px] w-full items-center justify-center gap-2 text-center font-medium [[data-theme=light]_&]:!shadow-[0_2px_0_rgb(var(--card-accent)_/_0.38)] ${textBody}`}
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

function CourseFace({ course, onContinue }) {
  const lessonsTotal = course.regionLessonsTotal ?? 0;
  const lessonsCompleted = Math.min(course.regionLessonsCompleted ?? 0, lessonsTotal);
  const started = course.isPrimary || course.percent > 0;
  return (
    <>
      <span className="home-desktop-course-card__tag">
        {started ? course.title : "Suggested path"}
      </span>
      <strong className="home-desktop-course-card__title">
        {started ? course.nextLessonTitle ?? course.regionTitle ?? course.title : course.title}
      </strong>
      <span className="home-desktop-course-card__subtitle">
        {course.regionTitle ?? "First region"}
        {started && lessonsTotal > 0 && ` · Lesson ${Math.min(lessonsCompleted + 1, lessonsTotal)} of ${lessonsTotal}`}
        {!started && course.regionsTotal > 0 && ` · ${course.regionsTotal} regions`}
      </span>
      {started && lessonsTotal > 0 && (
        <span
          className="home-desktop-course-card__segments"
          role="img"
          aria-label={`${lessonsCompleted} of ${lessonsTotal} lessons done`}
        >
          {Array.from({ length: lessonsTotal }, (_, index) => (
            <span
              key={index}
              data-state={index < lessonsCompleted ? "done" : index === lessonsCompleted ? "current" : undefined}
            />
          ))}
        </span>
      )}
      <span className="home-desktop-course-card__art" aria-hidden="true">
        <LessonIllustration src={course.regionImage} />
      </span>
      <CardCtaButton onClick={onContinue}>
        {course.isPrimary
          ? course.nextLessonTitle ? "Continue lesson" : "Open path"
          : course.percent > 0 ? "Resume path" : "Explore path"}
      </CardCtaButton>
    </>
  );
}

const STACK_DEPTH = 3;
const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 600;

function CourseStackCard({ depth, count, leavingDir, reduceMotion, onSwipe, onLeft, children }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-320, 320], [-9, 9]);
  const dragged = useRef(false);
  const isTop = depth === 0;

  useEffect(() => {
    if (!leavingDir) {
      x.set(0);
      return undefined;
    }
    if (reduceMotion) {
      onLeft();
      return undefined;
    }
    const controls = animateValue(x, leavingDir * 720, { duration: 0.34, ease: [0.4, 0, 0.9, 0.6] });
    controls.then(onLeft);
    return () => controls.stop();
  }, [leavingDir]); // eslint-disable-line react-hooks/exhaustive-deps

  // Plain pointer events with capture rather than Motion's drag: capture
  // guarantees the release arrives, so a short flick can't strand the card.
  const gesture = useRef(null);
  const canDrag = isTop && !leavingDir && count > 1;
  const onPointerDown = (event) => {
    if (!canDrag || event.button !== 0 || event.target.closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { startX: event.clientX, lastX: event.clientX, lastT: event.timeStamp, velocity: 0 };
    dragged.current = false;
  };
  const onPointerMove = (event) => {
    const g = gesture.current;
    if (!g) return;
    const dt = Math.max(1, event.timeStamp - g.lastT);
    g.velocity = ((event.clientX - g.lastX) / dt) * 1000;
    g.lastX = event.clientX;
    g.lastT = event.timeStamp;
    const offset = event.clientX - g.startX;
    if (Math.abs(offset) > 4) dragged.current = true;
    x.set(offset);
  };
  const onPointerEnd = () => {
    const g = gesture.current;
    if (!g) return;
    gesture.current = null;
    const offset = x.get();
    const dir =
      offset > SWIPE_DISTANCE || g.velocity > SWIPE_VELOCITY
        ? 1
        : offset < -SWIPE_DISTANCE || g.velocity < -SWIPE_VELOCITY
          ? -1
          : 0;
    if (dir && dragged.current) onSwipe(dir);
    else animateValue(x, 0, { type: "spring", stiffness: 500, damping: 34 });
    window.setTimeout(() => {
      dragged.current = false;
    }, 0);
  };

  const hidden = depth >= Math.min(count, STACK_DEPTH);
  // Outer layer: the card's place in the deck. Inner layer: the drag and
  // fly-off, kept separate so the two never fight over the same transform.
  return (
    <motion.div
      className="home-course-stack__slot"
      aria-hidden={isTop ? undefined : "true"}
      inert={isTop ? undefined : true}
      style={{ zIndex: 10 - depth }}
      initial={false}
      animate={{
        y: depth * 14,
        scale: 1 - depth * 0.04,
        opacity: leavingDir || hidden ? 0 : 1,
        filter: `brightness(${1 - Math.min(depth, 2) * 0.04})`,
      }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 32, opacity: { duration: 0.25 } }}
    >
      <motion.div
        className="home-course-stack__card"
        data-top={isTop || undefined}
        style={{ x, rotate }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={(event) => {
          if (dragged.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// The learner's courses as a deck: the one they're continuing sits on top,
// the others peek out underneath. Swiping the top card (or the arrow keys /
// dots) sends it to the back and brings the next course forward.
function CourseStack({ courses, activeIndex, onChange, onContinue }) {
  const reduceMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(null);
  const count = courses.length;
  const topCourse = courses[activeIndex];

  const next = (dir = -1) => {
    if (count < 2 || leaving) return;
    setLeaving({ id: topCourse.id, dir });
  };
  const previous = () => {
    if (count < 2 || leaving) return;
    onChange((activeIndex - 1 + count) % count);
  };

  return (
    <div
      className="home-course-stack"
      role="region"
      aria-roledescription="carousel"
      aria-label="Your courses"
      tabIndex={0}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowRight") next(-1);
        else if (event.key === "ArrowLeft") previous();
        else return;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {courses.map((course, index) => {
        const depth = (index - activeIndex + count) % count;
        const leavingDir = leaving?.id === course.id ? leaving.dir : 0;
        return (
          <CourseStackCard
            key={course.id}
            depth={depth}
            count={count}
            leavingDir={leavingDir}
            reduceMotion={reduceMotion}
            onSwipe={next}
            onLeft={() => {
              setLeaving(null);
              onChange((activeIndex + 1) % count);
            }}
          >
            <CourseFace course={course} onContinue={() => onContinue(course)} />
          </CourseStackCard>
        );
      })}
      {count > 1 && (
        <span className="home-course-stack__dots">
          {courses.map((course, index) => (
            <button
              key={course.id}
              type="button"
              aria-label={`Show ${course.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => !leaving && onChange(index)}
            />
          ))}
        </span>
      )}
    </div>
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
  onOpenPlans,
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
  xp = 0,
  dailyXp = 0,
  xpGoal = 1,
  dynamicUpdate,
}) {
  const [mapMode, setMapMode] = useState("map");
  const [activeCard, setActiveCard] = useState("continueLearning");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const wheelLocked = useRef(false);
  const hoverTimer = useRef(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 680,
  );
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1201,
  );
  const [showPremiumOffer, setShowPremiumOffer] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1201,
  );
  const [isPremiumOfferCollapsed, setIsPremiumOfferCollapsed] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 680);
      setIsDesktop(window.innerWidth >= 1201);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!showPremiumOffer) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsPremiumOfferCollapsed(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showPremiumOffer]);

  const activeIndex = cardOrder.indexOf(activeCard);

  const onCarouselCommit = useCallback((index) => {
    setMapMode("map");
    setActiveCard(cardOrder[index]);
  }, []);

  const { cardRefs, dragMoved, panHandlers } = useCardCarousel({
    count: cardOrder.length,
    activeIndex,
    onCommit: onCarouselCommit,
    isMobile,
  });

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
  // On mobile every card renders its full front layout, even while it is off
  // to the side: if the contents swapped at the moment the slot changed, that
  // pop would land in the middle of the swipe and undo the smooth motion.
  const isFrontLayout = (cardId) => isMobile || isDesktop || isFront(cardId);
  const cardTabIndex = (cardId) =>
    isDesktop || ["front", "previous", "next"].includes(getCardSlot(cardId))
      ? 0
      : -1;

  const changeCard = useCallback(
    (direction) => {
      setMapMode("map");
      setActiveCard(
        cardOrder[
          (activeIndex + direction + cardOrder.length) % cardOrder.length
        ],
      );
    },
    [activeIndex],
  );

  const promoteOnHover = (cardId) => {
    if (isDesktop || window.innerWidth <= 900 || isFront(cardId)) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      setMapMode("map");
      setActiveCard(cardId);
    }, 160);
  };

  const clearHoverPromotion = () => window.clearTimeout(hoverTimer.current);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (
        isMobile ||
        isDesktop ||
        event.defaultPrevented ||
        !["ArrowLeft", "ArrowRight"].includes(event.key) ||
        event.target.matches("input, textarea, select, [contenteditable='true']")
      )
        return;
      event.preventDefault();
      changeCard(event.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [changeCard, isDesktop, isMobile]);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  // Bringing a card to the front is itself part of the carousel interaction,
  // so a tap on a peeking card focuses it rather than jumping straight to its
  // screen. Only the front card opens on tap.
  const openOrSelect = (cardId, onOpen) => {
    if (!isDesktop && getCardSlot(cardId) !== "front") {
      setMapMode("map");
      setActiveCard(cardId);
      return;
    }
    onOpen();
  };

  const onCardKeyDown = (event) => {
    if (isDesktop) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    changeCard(event.key === "ArrowRight" ? 1 : -1);
  };

  const onSceneWheel = (event) => {
    if (
      isDesktop ||
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

  // The swipe itself lives in useCardCarousel — the scene's pan gesture feeds
  // one motion value that every card reads, so the stack moves as one piece.
  // A plain tap never passes the small distance threshold there, so dragMoved
  // stays false and the card's own onClick still opens it; a real drag flips
  // it so the browser's post-drag ghost click (fired on whatever card sits
  // under the finger at release) gets swallowed instead of opening that card.
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
  const selectedCourseIndex = Math.max(0, courseOptions.indexOf(selectedCourse));
  const continueCourse = (course) => {
    if (!course) {
      onOpenCareerPath();
      return;
    }
    if (course.isPrimary) {
      if (course.nextLessonTitle) onStartMission();
      else onOpenCareerPath();
      return;
    }
    onOpenPath(course.id);
  };
  const continueSelectedCourse = () => continueCourse(selectedCourse);

  // The league system technically seats everyone from day one, but competing
  // in it only means something after a first lesson — before that, the real
  // "unlock" moment worth telling the learner about is finishing lesson one.
  const leagueUnlocked = completedLessonsCount > 0;
  // Same formula XpPopover already uses for the header's daily-goal ring —
  // reused here rather than reinvented so "today's progress" means the same
  // thing in both places.
  const dailyGoalPercent = Math.min(100, Math.round((dailyXp / Math.max(1, xpGoal)) * 100));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
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
    <div className="h-[calc(100vh-64px)] overflow-hidden px-[22px] py-5 min-[1201px]:overflow-y-auto min-[1201px]:py-8 max-[900px]:px-[18px] max-[680px]:h-[calc(100dvh-64px)] max-[680px]:px-[18px] max-[680px]:py-4">
      <div className="relative mx-auto flex h-full w-full max-w-[1100px] flex-col justify-center min-[1201px]:max-w-[1000px] min-[1201px]:grid min-[1201px]:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] min-[1201px]:grid-rows-[auto_auto_1fr_auto] min-[1201px]:justify-start min-[1201px]:gap-6 min-[1201px]:pb-8 max-[680px]:justify-start max-[680px]:pt-14">
        <header className="home-greeting hidden min-[1201px]:col-span-2 min-[1201px]:row-start-1 min-[1201px]:flex">
          <h1>{greeting}</h1>
        </header>
        <motion.section
          className="home-map-scene relative left-1/2 h-[500px] w-screen -translate-x-1/2 min-[1201px]:contents max-[680px]:!h-[420px] max-[680px]:![perspective:1150px] max-[680px]:![perspective-origin:50%_42%] max-[680px]:![touch-action:pan-y] max-[680px]:![overscroll-behavior-x:contain]"
          data-mode={mapMode}
          aria-label="Learning map"
          onWheel={onSceneWheel}
          onClickCapture={onSceneClickCapture}
          {...panHandlers}
        >
          <span className="home-map-atmosphere min-[1201px]:hidden max-[680px]:opacity-50" aria-hidden="true" />
          {/* Keep positioning on the wrapper so the compose transform never
              conflicts with the active Lottie clip. */}
          <div className="home-map-devy pointer-events-none hidden absolute left-1/2 top-[0px] -translate-x-1/2 max-[680px]:z-0 max-[680px]:block max-[680px]:!top-14">
            <DevyLottie
              key={activeCard}
              clip={devyClips[activeCard]}
              className="size-36 max-[680px]:size-20"
            />
          </div>

          <div
            ref={cardRefs[0]}
            className={`${mapCard} home-map-card--continue-learning home-map-card--lesson min-[1201px]:col-start-2 min-[1201px]:row-start-2 min-[1201px]:row-span-2 min-[1201px]:self-start min-[1201px]:!h-[500px] ${mapCardSurface} max-[1200px]:[[data-theme=light]_&]:!bg-[#f5f9ff] min-[1201px]:!bg-transparent min-[1201px]:!border-0 min-[1201px]:!p-0 min-[1201px]:!overflow-visible min-[1201px]:!cursor-default min-[1201px]:![box-shadow:none] min-[1201px]:![scale:1] ${isFrontLayout("continueLearning") ? "!pt-3 min-[1201px]:!pt-0" : ""} ${!isDesktop && isFront("continueLearning") ? `${lightFrontElevation} ${darkMobileFrontDepth} min-[681px]:max-[1200px]:!top-[54px] min-[681px]:max-[1200px]:!h-[410px] min-[681px]:max-[1200px]:!w-[460px] min-[681px]:max-[1200px]:!p-6` : ""}`}
            style={{ "--card-accent": cardAccents.continueLearning }}
            data-slot={getCardSlot("continueLearning")}
            data-layout={isFrontLayout("continueLearning") ? "front" : getCardSlot("continueLearning")}
            tabIndex={cardTabIndex("continueLearning")}
            role="group"
            aria-label="Continue learning"
            aria-current={isFront("continueLearning") ? "true" : undefined}
            onKeyDown={onCardKeyDown}
            onMouseEnter={() => promoteOnHover("continueLearning")}
            onMouseLeave={clearHoverPromotion}
            onClick={() =>
              openOrSelect("continueLearning", continueSelectedCourse)
            }
          >
            <div className="home-desktop-course-card">
              {courseOptions.length > 0 && (
                <CourseStack
                  courses={courseOptions}
                  activeIndex={selectedCourseIndex}
                  onChange={(index) => setSelectedCourseId(courseOptions[index].id)}
                  onContinue={(course) => openOrSelect("continueLearning", () => continueCourse(course))}
                />
              )}
            </div>

            {!isFrontLayout("continueLearning") && (
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
              <span className="home-map-card__course-heading !gap-2 pt-3! !pb-6">
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
              </span>

              <HeroBadge src={selectedCourse?.regionImage} />

              <span className="home-map-card__lesson-list">
                <span className="home-map-card__lesson-row" data-state="current">
                  <LessonStatusIcon locked={false} />
                  <strong className={`flex-1 ${selectedCourse?.nextLessonTitle ? "" : "home-map-card__lesson-complete"}`}>
                    {selectedCourse?.nextLessonTitle ?? `${selectedCourse?.title ?? "This path"} complete`}
                  </strong>
                  <LessonStatusRing current />
                </span>
                {/* A quiet preview of what comes after the current lesson —
                    real data (main.jsx's upNextTitle), not filler. Without
                    it this was the only content block on the card, and the
                    fixed-height card (row-span-2, to match the left column)
                    left a large gap of true empty space above the CTA. */}
                {selectedCourse?.nextLessonTitle && selectedCourse?.upNextTitle && (
                  <span className="home-map-card__lesson-row" data-state="upcoming">
                    <LessonStatusIcon locked />
                    <span className="flex-1">{selectedCourse.upNextTitle}</span>
                    <LessonStatusRing />
                  </span>
                )}
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
            ref={cardRefs[1]}
            className={`${mapCard} home-map-card--leaderboard min-[1201px]:hidden ${mapCardSurface} ${isDesktop || isFront("leaderboard") ? `${lightFrontElevation} ${darkMobileFrontDepth} !pt-6 min-[681px]:max-[1200px]:!top-[54px] min-[681px]:max-[1200px]:!h-[410px] min-[681px]:max-[1200px]:!w-[460px] min-[681px]:max-[1200px]:!p-6` : ""}`}
            style={{ "--card-accent": cardAccents.leaderboard }}
            data-slot={getCardSlot("leaderboard")}
            data-layout={isFrontLayout("leaderboard") ? "front" : getCardSlot("leaderboard")}
            tabIndex={cardTabIndex("leaderboard")}
            role="group"
            aria-label="Leaderboard"
            aria-current={isFront("leaderboard") ? "true" : undefined}
            onKeyDown={onCardKeyDown}
            onMouseEnter={() => promoteOnHover("leaderboard")}
            onMouseLeave={clearHoverPromotion}
            onClick={() => openOrSelect("leaderboard", onOpenLeaderboard)}
          >
            {(!isFrontLayout("leaderboard") || !leagueUnlocked) && (
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
                {!isFrontLayout("leaderboard") && <ExpandCue />}
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

                <span className="home-map-card__details home-map-card__details--leaderboard flex-1 justify-start">
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
                    className="relative -mx-1 h-[184px] overflow-hidden border-t border-white/[0.08] min-[681px]:h-[224px]"
                    style={{ display: "block" }}
                  >
                    <span className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col">
                      {leagueNeighborsWide.slice(0, 3).map((entry, index) => (
                        <span
                          key={entry.id}
                          className={`home-map-card__standings-row items-center gap-3 px-4! py-2! min-[681px]:py-3! ${textBody} ${entry.isCurrentUser ? "rounded-xl bg-[rgb(var(--card-accent)/0.15)]" : ""}`}
                          data-self={entry.isCurrentUser}
                        >
                          <span className="flex flex-1 items-center gap-3">
                            <span
                              className="grid size-7 flex-none place-items-center rounded-full text-[12px] font-bold text-white"
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
            ref={cardRefs[2]}
            className={`${mapCard} home-map-card--portfolio min-[1201px]:hidden ${mapCardSurface} ${isDesktop || isFront("portfolio") ? `${lightFrontElevation} ${darkMobileFrontDepth} min-[681px]:max-[1200px]:!top-[54px] min-[681px]:max-[1200px]:!h-[410px] min-[681px]:max-[1200px]:!w-[460px] min-[681px]:max-[1200px]:!p-6` : ""}`}
            style={{ "--card-accent": cardAccents.portfolio }}
            data-slot={getCardSlot("portfolio")}
            data-layout={isFrontLayout("portfolio") ? "front" : getCardSlot("portfolio")}
            tabIndex={cardTabIndex("portfolio")}
            role="group"
            aria-label="Your work"
            aria-current={isFront("portfolio") ? "true" : undefined}
            onKeyDown={onCardKeyDown}
            onMouseEnter={() => promoteOnHover("portfolio")}
            onMouseLeave={clearHoverPromotion}
            onClick={() => openOrSelect("portfolio", onOpenCareerPath)}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="flex items-center gap-2.5">
                <IconChip icon={RocketIcon} tone="violet" />
                <span className="home-map-card__section-label">
                  Your work
                </span>
              </span>
              {!isFrontLayout("portfolio") && <ExpandCue />}
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
            ref={cardRefs[3]}
            className={`${mapCard} home-map-card--dynamic min-[1201px]:col-start-1 min-[1201px]:row-start-2 min-[1201px]:self-start min-[1201px]:!h-[356px] min-[1201px]:!overflow-hidden min-[1201px]:!p-0 ${mapCardSurface} ${isDesktop || isFront("dynamic") ? `${lightFrontElevation} ${darkMobileFrontDepth} min-[681px]:max-[1200px]:!top-[54px] min-[681px]:max-[1200px]:!h-[410px] min-[681px]:max-[1200px]:!w-[460px] min-[681px]:max-[1200px]:!p-6` : ""}`}
            style={{ "--card-accent": isDesktop ? cardAccents.leaderboard : cardAccents.dynamic }}
            data-slot={getCardSlot("dynamic")}
            data-layout={isFrontLayout("dynamic") ? "front" : getCardSlot("dynamic")}
            tabIndex={isDesktop ? -1 : cardTabIndex("dynamic")}
            role="group"
            aria-label="What's new"
            aria-current={isFront("dynamic") ? "true" : undefined}
            onKeyDown={onCardKeyDown}
            onMouseEnter={() => promoteOnHover("dynamic")}
            onMouseLeave={clearHoverPromotion}
            onClick={() => {
              if (!isDesktop) openOrSelect("dynamic", dynamicAction);
            }}
          >
            <div className="home-dashboard-summary">
              <section className="home-dashboard-streak">
                <span className="home-dashboard-xp">
                  {/* The ring used to be a fixed 25% regardless of xp — it
                      now reflects today's real progress toward the daily
                      goal (same formula XpPopover already uses), so it's an
                      actual signal instead of decoration shaped like one.
                      The number beside it stays lifetime total, which is
                      why the ring gets its own label rather than relying on
                      that number to explain it. */}
                  <span
                    className="home-dashboard-xp-ring"
                    style={{ "--xp-fill": `${dailyGoalPercent}%` }}
                    role="img"
                    aria-label={`${dailyGoalPercent}% of today’s XP goal`}
                  >
                    <BoltIcon className="size-4" aria-hidden="true" />
                  </span>
                  <strong>{xp}</strong>
                </span>
              </section>

              <section className="home-dashboard-league">
                {leagueUnlocked ? (
                  <>
                    <span className="home-dashboard-league-head">
                      <TierMedal
                        league={{ color: leagueColor || leaderboardMedalColor }}
                        state="current"
                        size={badgeMd}
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <strong>{leagueName ?? "Your league"}</strong>
                        <span>
                          Top {promoteCount} advance · {seasonTimeLeft}
                        </span>
                      </span>
                      {/* The standings list below already reads as a mini
                          leaderboard on its own — this replaces a separate
                          "View leaderboard" row at the foot of the card with
                          the same quiet expand affordance the mobile card
                          uses, so the card stays exactly as tall as its
                          content. It needs to stay a real, always-visible
                          button (not ExpandCue itself, which is opacity:0
                          until the whole card is hovered) since this is the
                          only way to reach the leaderboard from here on
                          desktop — but it reuses ExpandCue's exact glyph and
                          size so "this expands" means one shape everywhere,
                          not a second, unrelated icon design. */}
                      <button
                        type="button"
                        aria-label="View full leaderboard"
                        className="home-dashboard-league-expand"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenLeaderboard();
                        }}
                      >
                        <svg className="size-4" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M7 17 17 7M9 7h8v8"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </span>

                    {/* The middle of this card used to be one centred line of
                        text over a lot of empty space — the same standings
                        preview the mobile leaderboard card already builds
                        (leagueNeighborsWide, faded top and bottom) fills it
                        with something worth looking at: where you actually
                        sit against the league right now. */}
                    {/* leagueNeighborsWide is a fixed four-person window, never a
                        long scroll — so the rows just sit centred in the
                        space with no overlay-fade pretending there's more
                        below than there actually is. */}
                    {/* Every row used to be flat grey — the mobile
                        leaderboard card's own standings preview already
                        colors each row with a per-person avatar chip
                        (avatarPalette, self gets --card-accent); this
                        reuses the exact same device so the two renderings
                        of "your standing" read as the same UI, not two
                        different ones that happen to show the same data. */}
                    <span className="home-dashboard-standings">
                      {leagueNeighborsWide.slice(0, 3).map((entry, index) => (
                        <span
                          key={entry.id}
                          className="home-dashboard-standings-row"
                          data-self={entry.isCurrentUser || undefined}
                        >
                          <span className="home-dashboard-standings-rank">{entry.rank}</span>
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span
                              className="home-dashboard-standings-avatar"
                              style={{
                                background: entry.isCurrentUser
                                  ? "rgb(var(--card-accent))"
                                  : avatarPalette[index % avatarPalette.length],
                              }}
                            >
                              {(entry.isCurrentUser ? "You" : entry.name)?.[0]?.toUpperCase()}
                            </span>
                            <span className="min-w-0 truncate">
                              {entry.isCurrentUser ? "You" : entry.name}
                            </span>
                          </span>
                          <span className="home-dashboard-standings-score">{entry.score}</span>
                        </span>
                      ))}
                    </span>
                  </>
                ) : (
                  <span className="home-dashboard-league-empty">
                    <TierMedal
                      league={{ color: leagueColor || leaderboardMedalColor }}
                      state="locked"
                      size={badgeLg}
                    />
                    <span>
                      <strong>It’s comeback time</strong>
                      <span>Complete a lesson to claim your place in the league.</span>
                    </span>
                    <button
                      type="button"
                      className="home-dashboard-link"
                      onClick={(event) => {
                        event.stopPropagation();
                        onStartMission();
                      }}
                    >
                      Continue <ArrowLeftIcon className="size-4 rotate-180" />
                    </button>
                  </span>
                )}
              </section>

            </div>

            <div className="flex w-full items-center justify-between gap-2">
              <span className="flex items-center gap-2.5">
                <IconChip icon={SparkleIcon} tone="teal" />
                <span className="home-map-card__section-label">
                  Next milestone
                </span>
              </span>
              {!isFrontLayout("dynamic") && <ExpandCue />}
            </div>

            <span className="home-map-card__side">
              <span className="home-map-card__side-value home-map-card__side-value--text">
                {dynamicUpdate?.title}
              </span>
              <span className="home-map-card__side-label">
                {dynamicUpdate?.body}
              </span>
            </span>

            <div className="home-map-card__dynamic-story">
              <span className="home-map-card__dynamic-icon">
                <SparkleIcon className="size-6" />
              </span>
              <span className="home-map-card__dynamic-eyebrow">
                {selectedCourse?.regionTitle ?? selectedCourse?.title ?? "Your learning path"}
              </span>
              <strong>{dynamicUpdate?.title}</strong>
              <span>{dynamicUpdate?.body}</span>
            </div>

            <CardCtaButton
              onClick={(event) => {
                event.stopPropagation();
                openOrSelect("dynamic", dynamicAction);
              }}
            >
              {dynamicUpdate?.cta ?? "Open"}
            </CardCtaButton>
          </div>

          {/* This slot used to be an empty aria-hidden spacer — the desktop
              grid never actually gave "Your work" (the portfolio card) a
              home of its own: it's min-[1201px]:hidden everywhere else, the
              only one of the four cards with no desktop presence. This is
              that presence, condensed to the one row the grid leaves for it
              (its height is fixed by the grid's own 1fr row, not a free
              choice — see the row-start-3 math against the 500px card
              opposite it). */}
          <button
            type="button"
            className="home-dashboard-portfolio hidden min-[1201px]:col-start-1 min-[1201px]:row-start-3 min-[1201px]:flex"
            style={{ "--card-accent": cardAccents.portfolio }}
            onClick={() => openOrSelect("portfolio", onOpenCareerPath)}
          >
            {/* Pinned to the corner rather than its own flex row above the
                text — a header row here was pushing "N lessons completed"
                down by its own height + gap before the text ever started,
                which is exactly the "not at the top" gap the reference
                doesn't have (its title sits right at the card's own
                padding, nothing above it). */}
            <span className="home-dashboard-portfolio-expand" aria-hidden="true">
              <svg className="size-4" viewBox="0 0 24 24" fill="none">
                <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>

            <span className="home-dashboard-portfolio-body">
              <span className="min-w-0">
                {completedLessonsCount === 0 ? (
                  <>
                    <strong>Your portfolio starts here</strong>
                    <span>Complete a lesson to begin</span>
                  </>
                ) : (
                  <>
                    <strong>
                      {completedLessonsCount} lesson{completedLessonsCount === 1 ? "" : "s"} completed
                    </strong>
                    {pathTools.length > 0 ? (
                      <span className="home-dashboard-portfolio-tags">
                        {pathTools.slice(0, 3).map((tool) => (
                          <span key={tool}>{tool}</span>
                        ))}
                      </span>
                    ) : (
                      <span>Building your work, one lesson at a time</span>
                    )}
                  </>
                )}
              </span>
            </span>

            {/* The reference's mascot-in-the-corner idea, with Devy instead —
                neutral for the empty state, the same celebrating pose the
                roadmap uses once there's actually something to show. Pinned
                to the card itself rather than sharing the text row's flex
                box, so its size is never squeezed by (or squeezing) the
                header row above it. */}
            <DevyMood
              mood={completedLessonsCount === 0 ? "neutral" : "celebrating"}
              animate={completedLessonsCount > 0}
              className="home-dashboard-portfolio-devy"
              alt=""
            />
          </button>
        </motion.section>

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
          className="home-quick-actions relative mx-auto mt-9 flex w-full max-w-[1040px] items-center justify-center py-3 min-[1201px]:col-span-2 min-[1201px]:row-start-4 min-[1201px]:self-end min-[1201px]:mt-0 min-[1201px]:pb-4 max-[680px]:absolute max-[680px]:bottom-4 max-[680px]:left-1/2 max-[680px]:z-10 max-[680px]:mt-0 max-[680px]:-translate-x-1/2 max-[680px]:pb-4 max-[680px]:pt-3"
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

        {showPremiumOffer && (
          <div className="fixed bottom-0 left-6 z-50 hidden min-[1201px]:block">
            <motion.div
              layout
              transition={{ layout: { type: "spring", stiffness: 320, damping: 30, mass: 0.8 } }}
              style={{ transformOrigin: "bottom left" }}
              className={isPremiumOfferCollapsed ? "w-[228px]" : "w-[360px]"}
            >
            {isPremiumOfferCollapsed ? (
              <button
                type="button"
                className="flex h-12 w-full items-center gap-2.5 rounded-t-[18px] rounded-b-none border border-white/10 bg-[#232323] px-4 text-sm font-semibold text-[#f4f4f2] shadow-[0_12px_28px_rgb(0_0_0_/_0.24)] hover:bg-[#2a2a2a] [[data-theme=light]_&]:border-neutral-200 [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-neutral-50"
                aria-expanded="false"
                onClick={() => setIsPremiumOfferCollapsed(false)}
              >
                <GemIcon className="size-4 text-[#9c84ff]" />
                Devspace Pro
                <svg className="ml-1 size-4 text-[#a9a9ad]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <section
                className="relative w-full overflow-hidden rounded-t-[16px] rounded-b-none border border-white/10 bg-[#232323] p-6 text-[#f4f4f2] shadow-[0_18px_40px_rgb(0_0_0_/_0.28)] [[data-theme=light]_&]:border-neutral-200 [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
                role="dialog"
                aria-labelledby="premium-offer-title"
              >
              <button
                type="button"
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-[#a9a9ad] hover:bg-white/10 hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:bg-black/5 [[data-theme=light]_&]:hover:text-neutral-800"
                aria-label="Collapse Devspace Pro offer"
                onClick={() => setIsPremiumOfferCollapsed(true)}
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="mb-4 grid size-10 place-items-center rounded-xl bg-[linear-gradient(86deg,#7491ff33_-7.44%,#ff90e033_44.8%,#f7c32533_102.54%)] text-[#9c84ff]">
                <GemIcon className="size-5" />
              </span>
              <h2 id="premium-offer-title" className="pr-8 text-[21px] font-bold tracking-[-0.03em]">
                Keep your streak protected
              </h2>
              <p className="mt-2 max-w-[32ch] text-[14px] leading-5 text-[#b6bac4] [[data-theme=light]_&]:text-neutral-600">
                Devspace Pro gives you streak protection and more room to keep learning on your schedule.
              </p>
              <ActionButton
                variant="premium"
                className="mt-5 min-h-11 w-full text-[14px]"
                onClick={() => {
                  setShowPremiumOffer(false);
                  onOpenPlans?.();
                }}
              >
                Explore Devspace Pro
              </ActionButton>
              </section>
            )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
