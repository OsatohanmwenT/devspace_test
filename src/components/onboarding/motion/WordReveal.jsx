import { gsap } from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import { reducedMotion, WORD } from '../../../lib/onboardingMotion'

// P3 — word reveal. Each word rises a beat after the last, the
// way the reference's "Create and… Join Vybe" lands. Hero titles only; a
// question prompt should be readable the instant it appears.
//
// Renders inline spans, so it can sit inside any heading element and keep
// that element's typography. `delay` lets a screen sequence it after its
// hero art. Screen readers get the whole string once via aria-label.
export function WordReveal({ text, delay = 0, as: Tag = 'span', className = '' }) {
  const rootRef = useRef(null)
  const words = String(text).split(' ')

  useLayoutEffect(() => {
    if (!rootRef.current || reducedMotion()) return undefined

    const context = gsap.context(() => {
      gsap.from('[data-word]', {
        autoAlpha: 0,
        y: WORD.y,
        duration: WORD.duration,
        ease: WORD.ease,
        delay,
        stagger: WORD.stagger,
      })
    }, rootRef)

    return () => context.revert()
  }, [text, delay])

  return (
    <Tag ref={rootRef} className={className} aria-label={text}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} aria-hidden="true" className="inline-block whitespace-pre" data-word>
          {word}{index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
