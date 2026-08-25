import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { DevyMood } from '../ui/DevyMood'

const SLIDES = [
  {
    title: 'Build a path around your goal',
    body: 'Tell Devy what you want to learn, build, or prepare for.',
    mood: 'neutral',
  },
  {
    title: 'Get a route that fits',
    body: 'Your route is shaped around your goal, experience, and the work you want to make.',
    mood: 'neutral',
  },
  {
    title: 'Start with a real lesson',
    body: 'Build practical skills now, then work toward a project you can share.',
    mood: 'celebrating',
  },
]

export function CustomPathIntroduction({ onComplete }) {
  const [slideIndex, setSlideIndex] = useState(0)
  const slide = SLIDES[slideIndex]
  const isLastSlide = slideIndex === SLIDES.length - 1

  const continueIntro = () => {
    if (isLastSlide) onComplete()
    else setSlideIndex((current) => current + 1)
  }

  return (
    <section className="fixed inset-0 z-40 grid min-h-screen bg-[#121214] px-6 py-8 text-[#f4f4f2] [[data-theme=light]_&]:bg-[#fafaf8] [[data-theme=light]_&]:text-neutral-800 max-[680px]:px-4" aria-label="About custom paths">
      <main className="grid min-h-0 w-full grid-rows-[1fr_auto] justify-items-center">
        <div key={slideIndex} className="grid place-items-center text-center">
          <div className="grid justify-items-center gap-8 max-[680px]:gap-6">
            <div className="relative grid place-items-center">
              <span className="absolute size-28 rounded-full bg-[#513dec]/25 blur-2xl" aria-hidden="true" />
              <DevyMood mood={slide.mood} className="size-36 max-[680px]:size-28" />
            </div>
            <div className="grid max-w-[430px] gap-4">
              <h1 className="m-0 font-rethink-sans text-[34px] font-semibold leading-[1.2] max-[680px]:text-[28px]">{slide.title}</h1>
              <p className="m-0 text-[18px] leading-[1.5] text-[#525252] [[data-theme=dark]_&]:text-[#c4c4c7] max-[680px]:text-[16px]">{slide.body}</p>
            </div>
          </div>
        </div>
        <div className="grid w-full max-w-[440px] justify-items-center gap-6 pb-1">
          <div className="grid w-32 grid-cols-3 gap-1.5" role="img" aria-label={`Introduction progress: step ${slideIndex + 1} of ${SLIDES.length}`}>
            {SLIDES.map((_, index) => <span key={index} className={index <= slideIndex ? 'h-1.5 rounded bg-[#2986f2]' : 'h-1.5 rounded bg-[#404040] [[data-theme=light]_&]:bg-[#e1e1e1]'} />)}
          </div>
          <ActionButton variant="primary" className="min-h-14 w-full text-[16px] font-semibold" onClick={continueIntro} autoFocus>
            {isLastSlide ? 'Build my path' : 'Continue'}
          </ActionButton>
        </div>
      </main>
    </section>
  )
}
