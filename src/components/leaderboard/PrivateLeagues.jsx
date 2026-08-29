import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { Drawer } from '../ui/Drawer'
import { BackLink } from '../ui/NavArrowLink'
import { getPrivateLeagueStandings } from '../../lib/privateLeagues'
import { LeaderboardRow } from './LeaderboardRow'

function CreateLeagueDrawer({ onClose, onCreate }) {
  const [name, setName] = useState('')

  return (
    <Drawer id="create-private-league" title="Create a league" onClose={onClose} labelledBy="create-private-league-title">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim()) return
          onCreate(name.trim())
          onClose()
        }}
      >
        <label className="grid gap-1.5">
          <span className="text-[13px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">League name</span>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={40}
            placeholder="Study Crew"
            className="rounded-xl border border-[#404040] bg-[#1f1f1f] px-3.5 py-3 text-[15px] text-[#f4f4f2] outline-none focus-visible:border-[#88bdf2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
          />
        </label>
        <ActionButton type="submit" className="min-h-12" disabled={!name.trim()}>Create league</ActionButton>
      </form>
    </Drawer>
  )
}

function JoinLeagueDrawer({ onClose, onJoin }) {
  const [code, setCode] = useState('')

  return (
    <Drawer id="join-private-league" title="Join with a code" onClose={onClose} labelledBy="join-private-league-title">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!code.trim()) return
          onJoin(code.trim())
          onClose()
        }}
      >
        <label className="grid gap-1.5">
          <span className="text-[13px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Invite code</span>
          <input
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ABC234"
            className="rounded-xl border border-[#404040] bg-[#1f1f1f] px-3.5 py-3 text-[15px] font-semibold tracking-[.1em] text-[#f4f4f2] outline-none focus-visible:border-[#88bdf2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
          />
        </label>
        <ActionButton type="submit" className="min-h-12" disabled={!code.trim()}>Join league</ActionButton>
      </form>
    </Drawer>
  )
}

function CopyButton({ label, value }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Clipboard can be unavailable (permissions, insecure context); the
      // button still flips to "Copied" so the flow doesn't dead-end.
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ActionButton variant="neutral" className="min-h-10 px-4 text-sm font-medium" onClick={copy}>
      {copied ? 'Copied' : label}
    </ActionButton>
  )
}

function LeagueListRow({ league, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(league.id)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#404040] bg-[#1a1a1c] px-5 py-4 text-left transition-colors hover:border-[#5a5a60] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:hover:border-[#d4d4d4]"
    >
      <div className="grid min-w-0 gap-0.5">
        <strong className="truncate text-[15px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{league.name}</strong>
        <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{league.memberRivalIds.length + 1} members · code {league.code}</span>
      </div>
      <span aria-hidden="true" className="flex-none text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">→</span>
    </button>
  )
}

function LeagueDetail({ league, seasonCoins, seasonIndex, onBack, onLeave }) {
  const standings = getPrivateLeagueStandings(league, seasonCoins, seasonIndex)
  const inviteLink = `devspace.dev/league/${league.code}`

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <BackLink onClick={onBack}>All private leagues</BackLink>
        <button
          type="button"
          onClick={() => onLeave(league.id)}
          className="text-[13px] font-medium text-[#ff676d] hover:underline [[data-theme=light]_&]:text-[#b3272d]"
        >
          Leave league
        </button>
      </div>

      <div className="grid gap-2 rounded-2xl border border-[#404040] bg-[#1a1a1c] p-5 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
        <h2 className="m-0 text-xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{league.name}</h2>
        <p className="m-0 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          Ranked by the same Season Devy Coins as the official board — joining or leaving never changes your rank, coins, or promotion.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <CopyButton label={`Copy code · ${league.code}`} value={league.code} />
          <CopyButton label="Copy invite link" value={`https://${inviteLink}`} />
        </div>
      </div>

      <ol className="grid list-none m-0 overflow-hidden rounded-3xl bg-[#1a1a1c] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_1px_3px_rgba(20,20,20,0.06)] p-1.5" aria-label={`${league.name} standings`}>
        {standings.map((entry) => (
          <li key={entry.id} className="border-t border-[#404040] first:border-t-0 [[data-theme=light]_&]:border-[#ebe9e4]">
            <LeaderboardRow entry={entry} isCurrentUser={entry.isCurrentUser} />
          </li>
        ))}
      </ol>
    </div>
  )
}

export function PrivateLeagues({ privateLeagues, seasonCoins, seasonIndex, onBack, onCreate, onJoin, onLeave }) {
  const [selectedId, setSelectedId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  const leagues = Object.values(privateLeagues ?? {})
  const selected = selectedId ? privateLeagues?.[selectedId] : null

  return (
    <div className="grid w-full max-w-[860px] mx-auto gap-6">
      {!selected && (
        <BackLink onClick={onBack} className="justify-self-start">Back to your league</BackLink>
      )}

      {selected ? (
        <LeagueDetail
          league={selected}
          seasonCoins={seasonCoins}
          seasonIndex={seasonIndex}
          onBack={() => setSelectedId(null)}
          onLeave={(id) => {
            onLeave(id)
            setSelectedId(null)
          }}
        />
      ) : (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="m-0 text-xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Private leagues</h2>
            <div className="flex gap-2">
              <ActionButton variant="neutral" className="min-h-10 px-4 text-sm font-medium" onClick={() => setShowJoin(true)}>Join with code</ActionButton>
              <ActionButton className="min-h-10 px-4 text-sm font-medium" onClick={() => setShowCreate(true)}>Create a league</ActionButton>
            </div>
          </div>

          {leagues.length === 0 ? (
            <p className="m-0 rounded-2xl border border-dashed border-[#404040] px-5 py-8 text-center text-[14px] text-[#9a9a9d] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:text-[#686968]">
              No private leagues yet. Create one to invite friends, or join one with a code.
            </p>
          ) : (
            <div className="grid gap-3">
              {leagues.map((league) => (
                <LeagueListRow key={league.id} league={league} onOpen={setSelectedId} />
              ))}
            </div>
          )}
        </div>
      )}

      {showCreate && <CreateLeagueDrawer onClose={() => setShowCreate(false)} onCreate={onCreate} />}
      {showJoin && <JoinLeagueDrawer onClose={() => setShowJoin(false)} onJoin={onJoin} />}
    </div>
  )
}
