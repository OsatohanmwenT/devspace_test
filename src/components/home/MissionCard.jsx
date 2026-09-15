import { ActionButton } from '../ui/ActionButton'
import { Badge } from '../ui/Badge'
import { InfoTooltip } from '../ui/InfoTooltip'

// The hero card: the sketch's central "device" mockup, filling its grid
// cell so it reads as the tall center card flanked by the smaller ones.
export function MissionCard({ currentPath, currentRegionCard, currentStepIndex, regions, regionsTotal, nextLesson, started, onStartMission, className = '' }) {
  return (
    <div className={`relative h-full w-full ${className}`}>
      <article className="relative z-[1] flex h-full w-full flex-col items-center gap-[18px] p-7 max-[900px]:p-[22px] max-[680px]:pt-[22px] max-[680px]:px-[18px] max-[680px]:pb-5 overflow-hidden rounded-3xl text-center bg-[#1f1f1f]! [[data-theme=light]_&]:bg-[#f4f7fc]! border border-[#404040] [[data-theme=light]_&]:border-[#e3e9f2] [[data-theme=light]_&]:shadow-none">
        <div className="absolute right-4 top-4 flex gap-1.5">
          <InfoTooltip label="Quick check-in" align="end">
            A 30-second check-in on how this region is going — coming soon.
          </InfoTooltip>
        </div>

        <div className="w-full pt-1 text-center">
          <Badge className="bg-neutral-700 text-neutral-100">{currentPath.level}</Badge>
          <h2 className="max-w-[520px] mx-auto mt-3.5 mb-1.5 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rubik text-3xl sm:text-3xl lg:text-4xl font-medium leading-[1.04] [overflow-wrap:anywhere] text-balance">{currentPath.title}</h2>
          <p className="m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs max-[680px]:leading-[1.5] font-medium tracking-[.04em]">{currentRegionCard.title} · {currentRegionCard.percent}% complete</p>
        </div>

        <div className="relative w-[220px] h-[220px] max-[900px]:w-[190px] max-[900px]:h-[190px] max-[680px]:w-[170px] max-[680px]:h-[170px] max-[680px]:mx-auto flex-none">
          <div className="relative grid place-items-center w-[220px] h-[220px] max-[900px]:w-[190px] max-[900px]:h-[190px] max-[680px]:w-[170px] max-[680px]:h-[170px] overflow-visible">
            <div className="absolute z-0 right-[14%] bottom-[-2%] left-[14%] h-[28%] rounded-full bg-[#525252] blur-[18px] opacity-25" />
            <img className="relative z-[1] block w-full h-full object-contain" src={currentPath.emblem} alt="A colorful symbolic illustration for the current path" />
          </div>
        </div>

        <div className="w-full mt-auto">
          <div className="flex items-center justify-center gap-1.5 mb-[9px]" role="img" aria-label={`Region ${currentStepIndex + 1} of ${regionsTotal}`}>
            {regions.map((region, index) => (
              <span className={`home-progress-dot w-2 h-2 rounded-full ${index === currentStepIndex ? 'bg-[#d4d4d4]' : 'bg-[#404040] [[data-theme=light]_&]:bg-[#eeeeeb]'}`} key={region.id} />
            ))}
          </div>
          <p className="max-w-full m-0 mb-[18px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs leading-[1.5] text-center"><strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-medium">Region {currentStepIndex + 1} of {regionsTotal}</strong> · {nextLesson?.title}</p>
          <ActionButton variant="primary" className="cta-idle w-full min-h-[52px] text-[15px] font-medium" onClick={onStartMission}>
            {started ? 'Continue mission' : 'Start mission'} <span className="cta-idle-arrow" aria-hidden="true">→</span>
          </ActionButton>
        </div>
      </article>
    </div>
  )
}
