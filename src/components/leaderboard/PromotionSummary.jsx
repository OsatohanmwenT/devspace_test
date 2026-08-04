const XP_PER_ROUND = 10

function roundsFor(px) {
  return Math.max(1, Math.ceil(px / XP_PER_ROUND))
}

export function PromotionSummary({ summary }) {
  const { user, inPromotion, inDemotion, promotesAnyone, gapToPromotion, promotionCushion, gapToSafety, league } = summary

  const headline = inPromotion
    ? `You're ${promotionCushion.toLocaleString()} px clear of the cutoff`
    : inDemotion
      ? `${gapToSafety.toLocaleString()} px to escape the demotion zone`
      : promotesAnyone
        ? `${gapToPromotion.toLocaleString()} px to reach the promotion zone`
        : 'Hold your place to stay in Diamond'

  const gap = inPromotion ? 0 : inDemotion ? gapToSafety : gapToPromotion
  const accent = inDemotion ? '#ff676d' : inPromotion ? '#04adc0' : '#6f66ec'

  // Progress toward the line the user is currently chasing.
  const target = user.score + gap
  const fill = target > 0 ? Math.min(100, Math.round((user.score / target) * 100)) : 100

  return (
    <div className="grid gap-3 rounded-2xl border-2 bg-[#242424] p-4 [[data-theme=light]_&]:bg-white" style={{ borderColor: accent }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="grid gap-0.5">
          <span className="flex items-center gap-2 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">
            You're {user.rank}
            {user.rank === 1 ? 'st' : user.rank === 2 ? 'nd' : user.rank === 3 ? 'rd' : 'th'} this week in {league.name}
            {user.delta !== 0 && (
              <span className={user.delta > 0 ? 'text-[#04adc0]' : 'text-[#ff676d]'}>
                {user.delta > 0 ? `▲ ${user.delta}` : `▼ ${Math.abs(user.delta)}`} since yesterday
              </span>
            )}
          </span>
          <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-[15px] font-semibold">{headline}</strong>
        </div>
        {gap > 0 && (
          <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs whitespace-nowrap">
            ≈ {roundsFor(gap)} practice {roundsFor(gap) === 1 ? 'round' : 'rounds'}
          </span>
        )}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-[#262626] [[data-theme=light]_&]:bg-[#eeeeeb]" role="img" aria-label={`${fill}% of the way to the next cutoff`}>
        <div className="h-full rounded-full" style={{ width: `${fill}%`, background: accent }} />
      </div>
    </div>
  )
}
