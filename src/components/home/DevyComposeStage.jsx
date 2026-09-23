import { useAnimationFrame, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DevyLottie } from "../ui/DevyLottie";

const ICONS = {
  explain: (
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z" />
  ),
  quiz: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  next: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m14.8 9.2-1.6 4-4 1.6 1.6-4z" />
    </>
  ),
  code: <path d="m9 8-4 4 4 4M15 8l4 4-4 4M13 6l-2 12" />,
};

// The orbit: a flat ellipse around Devy, one lap every ~36s. The card at
// the bottom of the ellipse is "front" — full size, in front of Devy, lit
// in its own colour — and cards shrink, fade and soften as they go round
// the back.
const RADIUS_X = 230;
const RADIUS_Y = 92;
const LAP_MS = 36000;

function placeCards(cards, angle) {
  let front = 0;
  let frontDepth = -1;
  cards.forEach((card, index) => {
    if (!card) return;
    const theta = angle + (index / cards.length) * Math.PI * 2;
    const depth = (Math.cos(theta) + 1) / 2;
    const x = Math.sin(theta) * RADIUS_X;
    const y = Math.cos(theta) * RADIUS_Y;
    card.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(0.72 + depth * 0.28).toFixed(3)})`;
    card.style.opacity = (0.35 + depth * 0.65).toFixed(3);
    card.style.filter = depth < 0.6 ? `blur(${((0.6 - depth) * 3).toFixed(2)}px)` : "none";
    card.style.zIndex = String(Math.round(depth * 10));
    card.style.setProperty("--glow", Math.max(0, (depth - 0.75) / 0.25).toFixed(3));
    if (depth > frontDepth) {
      frontDepth = depth;
      front = index;
    }
  });
  return front;
}

// Desktop-only "how can I help" stage shown while the Ask Devy input has
// focus: the dashboard steps aside and Devy takes the middle, with a few
// starting points drawn from what the learner is actually doing.
export function DevyComposeStage({ open, name, suggestions, onPick, onClose, onFrontChange }) {
  const reduceMotion = useReducedMotion();
  const cardRefs = useRef([]);
  const angle = useRef(0);
  const paused = useRef(false);
  const [front, setFront] = useState(0);

  useLayoutEffect(() => {
    setFront(placeCards(cardRefs.current, angle.current));
  }, [suggestions.length]);

  const frontAccent = suggestions[front]?.accent;
  useEffect(() => {
    if (frontAccent) onFrontChange?.(frontAccent);
  }, [frontAccent, onFrontChange]);

  useAnimationFrame((_, delta) => {
    if (!open || paused.current || reduceMotion) return;
    angle.current -= (delta / LAP_MS) * Math.PI * 2;
    const next = placeCards(cardRefs.current, angle.current);
    if (next !== front) setFront(next);
  });

  return (
    <div
      className="home-compose-stage"
      data-open={open || undefined}
      aria-hidden={!open}
      style={{ "--stage-glow": `rgb(${suggestions[front]?.accent ?? "59 130 246"})` }}
    >
      <span className="home-compose-stage__glow" aria-hidden="true" />
      <h2 className="home-compose-stage__title">
        Hey{name ? `, ${name}` : ""}! How can I help?
      </h2>
      <div
        className="home-compose-stage__cluster"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        onFocus={() => (paused.current = true)}
        onBlur={() => (paused.current = false)}
      >
        <span className="home-compose-stage__devy" aria-hidden="true">
          {open && <DevyLottie clip="wave" className="size-full" />}
        </span>
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            ref={(node) => (cardRefs.current[index] = node)}
            type="button"
            tabIndex={open ? 0 : -1}
            className="home-compose-stage__card"
            style={{ "--accent": suggestion.accent }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(suggestion.label)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {ICONS[suggestion.icon]}
            </svg>
            <span>{suggestion.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        className="home-compose-stage__close"
        aria-label="Close"
        onClick={onClose}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
