import { motion } from 'motion/react'
import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { DevyMood } from '../ui/DevyMood'
import { ShareButton } from '../ui/ShareButton'
import { getSeasonNumber } from '../../lib/week'
import { formatPercentileBadge, formatPercentileLine } from '../../lib/seasonRecap'
import { inviteShareText, seasonResultShareText } from '../../lib/shareText'

const STAGE_TRANSITION = { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }

const OUTCOME_COPY = {
  promoted: (recap) => `You moved up to ${recap.toLeague}.`,
  qualified: (recap) => `You qualified for ${recap.qualifiedLeague} — your standing is saved for when you unlock it.`,
  demoted: (recap) => `You dropped to ${recap.toLeague}.`,
  stayed: (recap) => `You held your place in ${recap.league}.`,
}

function Glow() {
  return <span className="absolute size-28 rounded-full bg-[#513dec]/25 blur-2xl" aria-hidden="true" />
}

function Card({ children }) {
  return (
    <motion.div
      className="grid w-full justify-items-center text-center"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={STAGE_TRANSITION}
    >
      {children}
    </motion.div>
  )
}

function Eyebrow({ children }) {
  return <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">{children}</p>
}

function BigNumber({ children }) {
  return <p className="m-0 mt-2 font-rethink-sans text-6xl font-bold tabular-nums max-[680px]:text-5xl">{children}</p>
}

function Body({ children }) {
  return <p className="m-0 mt-4 max-w-[42ch] text-[17px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">{children}</p>
}

// A Wrapped-style walkthrough of one finished season, built entirely from
// buildSeasonRecap's output — no card here shows a number that data doesn't
// actually back. The rank-movement and concepts-mastered cards quietly don't
// render at all when the underlying tracking isn't there (a mid-season
// migration, or a first-ever season with no prior rank to compare against)
// rather than showing a guess.
export function SeasonRecapView({ recap, onClose }) {
  const cards = [
    {
      mood: 'celebrating',
      content: (
        <>
          <Eyebrow>Season recap</Eyebrow>
          <h1 className="m-0 mt-2 font-rethink-sans text-3xl font-semibold leading-[1.3] max-[680px]:text-[26px]">
            {recap.league} · Season {getSeasonNumber(recap.seasonIndex)}
          </h1>
          <Body>Here's what this season actually produced.</Body>
        </>
      ),
    },
    recap.startRank !== null && {
      mood: recap.positionsChanged >= 0 ? 'celebrating' : 'neutral',
      content: (
        <>
          <Eyebrow>Rank</Eyebrow>
          <BigNumber>#{recap.startRank} → #{recap.finalRank}</BigNumber>
          <Body>
            {recap.positionsChanged > 0 && `You climbed ${recap.positionsChanged} position${recap.positionsChanged === 1 ? '' : 's'} this season.`}
            {recap.positionsChanged < 0 && `You dropped ${Math.abs(recap.positionsChanged)} position${Math.abs(recap.positionsChanged) === 1 ? '' : 's'} this season.`}
            {recap.positionsChanged === 0 && 'You held the exact same rank all season.'}
            {' '}{formatPercentileLine(recap.percentile, recap.league)}
          </Body>
        </>
      ),
    },
    {
      mood: 'celebrating',
      content: (
        <>
          <Eyebrow>Devy Coins earned</Eyebrow>
          <BigNumber>{recap.seasonCoins.toLocaleString()} 🪙</BigNumber>
          <Body>Every coin came from a clean first-try answer, a finished lesson, or real practice — never a repeat.</Body>
        </>
      ),
    },
    recap.conceptsMastered > 0 && {
      mood: 'celebrating',
      content: (
        <>
          <Eyebrow>Concepts mastered</Eyebrow>
          <BigNumber>{recap.conceptsMastered}</BigNumber>
          <Body>{recap.conceptsMastered === 1 ? 'One concept' : `${recap.conceptsMastered} concepts`} you actually learned this season, not just visited.</Body>
        </>
      ),
    },
    {
      mood: recap.outcome === 'demoted' ? 'annoyed' : 'celebrating',
      content: (
        <>
          <Eyebrow>Season result</Eyebrow>
          <h1 className="m-0 mt-2 font-rethink-sans text-3xl font-semibold leading-[1.3] max-[680px]:text-[26px]">
            {OUTCOME_COPY[recap.outcome]?.(recap) ?? `You finished ${recap.league}.`}
          </h1>
          {recap.reward > 0 && <Body>₦{recap.reward.toLocaleString()} reward confirmed.</Body>}
        </>
      ),
    },
    {
      isFinal: true,
      mood: 'celebrating',
      content: (
        <>
          <div className="grid w-full gap-4 rounded-3xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1c] [[data-theme=light]_&]:bg-white p-6">
            <Eyebrow>{recap.league} · Season {getSeasonNumber(recap.seasonIndex)}</Eyebrow>
            <p className="m-0 font-rethink-sans text-2xl font-semibold">#{recap.finalRank} · {recap.seasonCoins.toLocaleString()} 🪙</p>
            <p className="m-0 text-[15px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
              {formatPercentileBadge(recap.percentile)}
              {recap.reward > 0 && ` · ₦${recap.reward.toLocaleString()} earned`}
            </p>
          </div>
          <Body>Your season, in one card.</Body>
          <div className="mt-5 grid w-full grid-cols-2 gap-2.5">
            <ShareButton
              variant="primary"
              className="min-h-11 text-[15px] font-semibold"
              text={seasonResultShareText({
                league: recap.league,
                seasonNumber: getSeasonNumber(recap.seasonIndex),
                rank: recap.finalRank,
                coins: recap.seasonCoins,
                percentile: recap.percentile,
              })}
            >
              Share
            </ShareButton>
            <ShareButton variant="neutral" className="min-h-11 text-[15px] font-semibold" text={inviteShareText()}>
              Join my league
            </ShareButton>
          </div>
        </>
      ),
    },
  ].filter(Boolean)

  const [index, setIndex] = useState(0)
  const stage = cards[index]
  const isLast = index === cards.length - 1

  const advance = () => {
    if (isLast) onClose()
    else setIndex((current) => current + 1)
  }

  return (
    <section
      className="fixed inset-0 z-40 grid min-h-screen place-items-center overflow-y-auto bg-[linear-gradient(to_bottom,#121214_0%,#121214_42%,#1d2a43_100%)] px-6 py-8 text-[#f4f4f2] [[data-theme=light]_&]:bg-[linear-gradient(to_bottom,#fafaf8_0%,#fafaf8_42%,#e4effd_100%)] [[data-theme=light]_&]:text-neutral-800 max-[680px]:px-4"
      aria-label="Season recap"
    >
      <button
        type="button"
        className="fixed right-5 top-5 grid size-10 place-items-center rounded-lg border-0 bg-transparent text-[#b2b2b6] hover:bg-white/10 [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:bg-black/5"
        onClick={onClose}
        aria-label="Close season recap"
      >
        <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </button>

      <main className="grid w-full max-w-[480px] justify-items-center overflow-hidden text-center">
        <div key={index} className="grid w-full justify-items-center">
          <motion.div
            className="relative mb-7 grid place-items-center"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Glow />
            <DevyMood mood={stage.mood} className="relative size-28" />
          </motion.div>

          <Card>{stage.content}</Card>
        </div>

        <div className="mt-8 flex items-center gap-2" role="img" aria-label={`Card ${index + 1} of ${cards.length}`}>
          {cards.map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={`size-2 rounded-full transition-colors duration-200 ${dotIndex === index
                ? 'bg-[#f4f4f2] [[data-theme=light]_&]:bg-neutral-800'
                : 'bg-[#404040] [[data-theme=light]_&]:bg-[#d4d4d4]'}`}
            />
          ))}
        </div>

        <ActionButton className="mt-5 min-h-13 w-[min(100%,350px)] text-[15px] font-semibold" onClick={advance} autoFocus>
          {isLast ? 'Done' : 'Continue'}
        </ActionButton>
      </main>
    </section>
  )
}
