import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

/* The mobile card stack, driven by one continuous value.
 *
 * `position` is an unbounded float measured in card units: 0 means card 0 is
 * centred, 1.5 means we are halfway between cards 1 and 2. Every card's
 * placement is a pure function of its own distance from that value, so
 * during a drag the whole stack moves in lockstep with the finger instead of
 * the front card and its neighbours being animated by two separate systems
 * that drift apart.
 *
 * The engine itself is deliberately not JS-animated. While dragging, values
 * are written straight to each card's inline `transform` / `opacity` /
 * `zIndex` on every pointer move — direct and immediate, no interpolation.
 * On release we write the *final* resting values once and let the CSS
 * `transition` on `.home-map-card` (mobile block, styles.css) ease there on
 * the browser's own compositor. That is what makes the settle reliable: it
 * doesn't depend on a JS rAF loop staying alive and ticking smoothly.
 *
 * PEEK is duplicated in styles.css — the mobile `.home-map-scene
 * .home-map-card` rule uses `left: 45px` / `width: calc(100vw - 90px)`.
 * Change both together. */
export const CAROUSEL = {
  PEEK: 45,
  SPREAD_RATIO: 0.82,
  DISTANCE: 55,
  VELOCITY: 500,
};

// The gap between card centres, in pixels. Read fresh on every drag-start
// rather than cached, so a resize between gestures is never stale.
const spreadPx = () =>
  Math.max(240, window.innerWidth - CAROUSEL.PEEK * 2) * CAROUSEL.SPREAD_RATIO;

// Every curve below is sampled against |offset| at these stops.
const STOPS = [0, 0.5, 1, 2];
const X = [0, 0.5, 1, 1.72]; // card units, compressed at the far edge
const SCALE = [1, 0.9, 0.8, 0.68];
const ROTATE = [0, 18, 32, 40]; // degrees, signed by the side the card sits on
const Y = [0, 9, 18, 26];
const Z = [0, -70, -140, -220];
// Side cards recede rather than sitting fully opaque — enough presence to
// read as "there's more to swipe to", not enough to compete with the front
// card for attention. BLUR reinforces the same depth-of-field read.
const OPACITY = [1, 0.78, 0.32, 0];
const BLUR = [0, 1, 4, 7]; // px

const mod = (n, m) => ((n % m) + m) % m;

// Shortest signed distance around a ring of `n`. The seam sits at |n / 2| —
// with four cards that is |2|, where OPACITY has already reached 0, so the
// card that wraps from one end of the ring to the other does it unseen.
function wrapOffset(delta, n) {
  let d = delta % n;
  if (d > n / 2) d -= n;
  if (d <= -n / 2) d += n;
  return d;
}

function interpolate(value, stops, outputs) {
  const last = stops.length - 1;
  if (value <= stops[0]) return outputs[0];
  if (value >= stops[last]) return outputs[last];
  for (let i = 1; i <= last; i += 1) {
    if (value <= stops[i]) {
      const t = (value - stops[i - 1]) / (stops[i] - stops[i - 1]);
      return outputs[i - 1] + (outputs[i] - outputs[i - 1]) * t;
    }
  }
  return outputs[last];
}

export function useCardCarousel({ count, activeIndex, onCommit, isMobile }) {
  const reduceMotion = useReducedMotion();
  const nodes = useRef([]);
  const spread = useRef(spreadPx());
  const position = useRef(activeIndex);
  const target = useRef(activeIndex);
  const dragStart = useRef(activeIndex);
  const dragMoved = useRef(false);

  const cardRefs = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => (node) => {
        nodes.current[index] = node;
      }),
    [count],
  );

  // Ranks cards by distance and assigns z-index by rank rather than from a
  // rounded formula: two cards at slightly different distances can round to
  // the same z-index, and when they tie the browser falls back to DOM order
  // to decide who paints on top — which has nothing to do with which card
  // is actually closer. A rank is always a unique integer, so that tie (and
  // the "one card slices across another" glitch it causes) can't happen.
  const paint = useCallback(
    (p) => {
      const depth = reduceMotion ? 0 : 1;
      const entries = nodes.current
        .map((node, index) => ({ node, index, offset: wrapOffset(index - p, count) }))
        .filter((entry) => entry.node);
      const ranked = [...entries].sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset));

      ranked.forEach(({ node, offset }, rank) => {
        const distance = Math.abs(offset);
        const side = Math.sign(offset);
        const x = side * interpolate(distance, STOPS, X) * spread.current;
        const y = interpolate(distance, STOPS, Y);
        const z = interpolate(distance, STOPS, Z) * depth;
        const rotate = side * interpolate(distance, STOPS, ROTATE) * depth;
        const scale = interpolate(distance, STOPS, SCALE);
        node.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotate}deg) scale(${scale})`;
        node.style.opacity = `${interpolate(distance, STOPS, OPACITY)}`;
        node.style.filter = `blur(${interpolate(distance, STOPS, BLUR)}px)`;
        node.style.zIndex = `${entries.length - rank}`;
      });
    },
    [count, reduceMotion],
  );

  const setTransitioning = useCallback((enabled) => {
    nodes.current.forEach((node) => {
      if (node) node.style.transition = enabled ? "" : "none";
    });
  }, []);

  useLayoutEffect(() => {
    if (!isMobile) {
      nodes.current.forEach((node) => {
        if (!node) return;
        node.style.transform = "";
        node.style.opacity = "";
        node.style.filter = "";
        node.style.zIndex = "";
        node.style.transition = "";
      });
      return;
    }
    position.current = activeIndex;
    target.current = activeIndex;
    paint(position.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per mobile mount
  }, [isMobile]);

  const commit = useCallback(
    (next) => {
      target.current = next;
      position.current = next;
      setTransitioning(true);
      paint(next);
      onCommit(mod(next, count));
    },
    [count, onCommit, paint, setTransitioning],
  );

  // Motion's own onPanEnd occasionally never fires for a very short, fast
  // gesture (observed with as few as two onPan samples) — the drag then
  // never resolves and the card is stranded mid-swipe. lastOffset/lastVelocity
  // track the gesture ourselves so a window-level pointerup/cancel can finish
  // it independently; `settled` makes the two paths idempotent, since Motion's
  // callback may still also fire.
  const lastOffsetX = useRef(0);
  const lastVelocityX = useRef(0);
  const settled = useRef(true);

  const finishDrag = useCallback(
    (offsetX, velocityX) => {
      if (settled.current) return;
      settled.current = true;
      window.removeEventListener("pointerup", onWindowPointerUpRef.current);
      window.removeEventListener("pointercancel", onWindowPointerUpRef.current);
      const direction =
        offsetX < -CAROUSEL.DISTANCE || velocityX < -CAROUSEL.VELOCITY
          ? 1
          : offsetX > CAROUSEL.DISTANCE || velocityX > CAROUSEL.VELOCITY
            ? -1
            : 0;
      commit(Math.round(dragStart.current) + direction);
    },
    [commit],
  );

  const onWindowPointerUpRef = useRef(() => finishDrag(lastOffsetX.current, lastVelocityX.current));
  onWindowPointerUpRef.current = () => finishDrag(lastOffsetX.current, lastVelocityX.current);

  const onPanStart = useCallback(() => {
    if (!isMobile) return;
    dragStart.current = position.current;
    spread.current = spreadPx();
    dragMoved.current = false;
    lastOffsetX.current = 0;
    lastVelocityX.current = 0;
    settled.current = false;
    setTransitioning(false);
    window.addEventListener("pointerup", onWindowPointerUpRef.current);
    window.addEventListener("pointercancel", onWindowPointerUpRef.current);
  }, [isMobile, setTransitioning]);

  const onPan = useCallback(
    (event, info) => {
      if (!isMobile) return;
      if (Math.abs(info.offset.x) > 5) dragMoved.current = true;
      lastOffsetX.current = info.offset.x;
      lastVelocityX.current = info.velocity.x;
      const distance = -info.offset.x / spread.current;
      position.current = dragStart.current + Math.sign(distance) * Math.min(Math.abs(distance), 1.1);
      paint(position.current);
    },
    [isMobile, paint],
  );

  const onPanEnd = useCallback(
    (event, info) => {
      if (!isMobile) return;
      finishDrag(info.offset.x, info.velocity.x);
    },
    [finishDrag, isMobile],
  );

  useEffect(
    () => () => {
      window.removeEventListener("pointerup", onWindowPointerUpRef.current);
      window.removeEventListener("pointercancel", onWindowPointerUpRef.current);
    },
    [],
  );

  // External changes (ScenePager, arrow keys) take the shortest path around
  // the ring rather than always spinning forward, and are skipped when they
  // are just our own commit() echoing back through activeCard.
  useLayoutEffect(() => {
    if (!isMobile) return;
    if (mod(target.current, count) === activeIndex) return;
    const next = target.current + wrapOffset(activeIndex - mod(target.current, count), count);
    target.current = next;
    position.current = next;
    setTransitioning(true);
    paint(next);
  }, [activeIndex, count, isMobile, paint, setTransitioning]);

  return { cardRefs, dragMoved, panHandlers: { onPanStart, onPan, onPanEnd } };
}
