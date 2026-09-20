import { gsap } from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import { FAN, reducedMotion } from '../../../lib/onboardingMotion'

// P4 — card fan. A stack of cards starts as one point behind the centre and
// fans out to its resting tilt, back card first so the front card lands on
// top. Resting positions are plain CSS transforms on each child (so reduced
// motion and the post-fan state are the same thing); gsap only animates
// *from* the collapsed stack.
//
// `spread` is the horizontal distance between neighbours at rest; `angle`
// the tilt step. `onComplete` fires once the last card has landed — the
// branch break uses it to start its orbit loop only after the fan.
export function CardFan({ children, spread = FAN.spread, angle = FAN.angle, delay = 0, onComplete, className = '' }) {
  const rootRef = useRef(null)
  const cards = Array.isArray(children) ? children.filter(Boolean) : [children]
  const middle = (cards.length - 1) / 2

  useLayoutEffect(() => {
    if (!rootRef.current) return undefined
    if (reducedMotion()) { onComplete?.(); return undefined }

    const context = gsap.context(() => {
      // Back-to-front: the outer cards sit behind the middle one, so they
      // land first and the front card lands last, on top.
      const items = gsap.utils.toArray('[data-fan-card]').sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex))
      gsap.from(items, {
        x: 0,
        y: FAN.rise,
        rotate: 0,
        scale: FAN.scaleFrom,
        autoAlpha: 0,
        duration: FAN.duration,
        ease: FAN.ease,
        delay,
        stagger: FAN.stagger,
        onComplete,
      })
    }, rootRef)

    return () => context.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length, delay])

  return (
    <div ref={rootRef} className={`relative grid place-items-center ${className}`}>
      {cards.map((card, index) => {
        const offset = index - middle
        return (
          <div
            key={index}
            data-fan-card
            className="col-start-1 row-start-1"
            style={{
              transform: `translateX(${offset * spread}px) rotate(${offset * angle}deg)`,
              // The middle card is the front one, like the reference stack.
              zIndex: cards.length - Math.round(Math.abs(offset) * 2),
            }}
          >
            {card}
          </div>
        )
      })}
    </div>
  )
}
