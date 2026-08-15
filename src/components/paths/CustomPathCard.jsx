import { useEffect, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'

const EXAMPLES = [
  'React Native state management',
  'Prepare for a Flutter internship',
  'Build AI agents with Python',
  'Learn SQL for data analysis',
  'Prepare for a backend role at a fintech',
]

// Sits at the bottom of the browse list — the fallback once 35 paths haven't
// covered it — so it reads as "here's the door out", not another path tile.
// Rotates its example so the prompt reads as "describe anything" rather than
// "pick one of these five".
export function CustomPathCard({ onCreatePath }) {
  const [exampleIndex, setExampleIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false)
      swap = setTimeout(() => {
        setExampleIndex((current) => (current + 1) % EXAMPLES.length)
        setVisible(true)
      }, 200)
    }, 2400)
    let swap
    return () => {
      clearInterval(cycle)
      clearTimeout(swap)
    }
  }, [])

  return (
    <article className="flex items-center gap-5 rounded-2xl border border-dashed border-[#4a4a4a] bg-[#1a1a1a] px-6 py-5 [[data-theme=light]_&]:border-[#c9c5bd] [[data-theme=light]_&]:bg-[#f7f6f3] max-[680px]:flex-col max-[680px]:items-stretch max-[680px]:text-center">
      <span className="grid size-12 flex-none place-items-center rounded-full bg-[#2a264c] [[data-theme=light]_&]:bg-[#eeebff] max-[680px]:mx-auto">
        <img className="size-7 object-contain" src="/assets/devy.svg" alt="" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-rethink-sans text-[16px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Didn’t find the right path?</h3>
        <p className="mt-1 text-sm leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          Tell Devy what you want to learn — e.g.{' '}
          <span className={`custom-path-example inline-block text-[#c3b9ff] [[data-theme=light]_&]:text-[#5c49c9] ${visible ? 'custom-path-example-in' : 'custom-path-example-out'}`}>
            “{EXAMPLES[exampleIndex]}”
          </span>
        </p>
      </div>
      <ActionButton
        variant="primary"
        className="min-h-[46px] flex-none px-5 text-sm font-semibold max-[680px]:w-full"
        onClick={onCreatePath}
      >
        Create custom path
      </ActionButton>
    </article>
  )
}
