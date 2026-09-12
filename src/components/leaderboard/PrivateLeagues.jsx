import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { Avatar } from '../ui/Avatar'
import { Drawer } from '../ui/Drawer'
import { BackLink } from '../ui/NavArrowLink'
import { getPrivateLeagueStandings, LEAGUE_EMOJIS, MAX_MEMBERS } from '../../lib/privateLeagues'
import { rivals } from '../../data/rivals'
import { CompetitorDrawer } from './CompetitorDrawer'
import { LeaderboardRow } from './LeaderboardRow'

function CreateLeagueDrawer({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(LEAGUE_EMOJIS[0])

  return (
    <Drawer id="create-private-league" title="Create a league" onClose={onClose} labelledBy="create-private-league-title">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim()) return
          onCreate(name.trim(), emoji)
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
        <fieldset className="grid gap-1.5 border-0 p-0 m-0">
          <legend className="text-[13px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Badge</legend>
          <div className="flex flex-wrap gap-2">
            {LEAGUE_EMOJIS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setEmoji(option)}
                aria-pressed={emoji === option}
                aria-label={`Use ${option} as the league badge`}
                className={`grid size-10 place-items-center rounded-xl border text-lg transition-colors ${
                  emoji === option
                    ? 'border-[#88bdf2] bg-[#1f2a3d] [[data-theme=light]_&]:border-[#3d77eb] [[data-theme=light]_&]:bg-[#eaf1ff]'
                    : 'border-[#404040] bg-[#1f1f1f] hover:border-[#5a5a60] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
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
  const memberCount = league.memberRivalIds.length + 1
  return (
    <button
      type="button"
      onClick={() => onOpen(league.id)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#404040] bg-[#1a1a1c] px-5 py-4 text-left transition-colors hover:border-[#5a5a60] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:hover:border-[#d4d4d4]"
    >
      <span aria-hidden="true" className="grid size-10 flex-none place-items-center rounded-xl bg-[#262626] text-lg [[data-theme=light]_&]:bg-[#f0f0ee]">
        {league.emoji ?? '👥'}
      </span>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <span className="flex items-center gap-2">
          <strong className="truncate text-[15px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{league.name}</strong>
          {league.ownerId && (
            <span className="flex-none rounded-full bg-[#2a2a2e] px-1.5 py-px text-[10px] font-bold tracking-[.04em] text-[#9a9a9d] [[data-theme=light]_&]:bg-[#eeeeeb] [[data-theme=light]_&]:text-[#686968]">OWNER</span>
          )}
        </span>
        <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{memberCount} of {MAX_MEMBERS + 1} members · code {league.code}</span>
      </div>
      <span aria-hidden="true" className="flex-none text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">→</span>
    </button>
  )
}

function RenameLeagueControl({ league, onRename }) {
  const [name, setName] = useState(league.name)
  const isDirty = name.trim() && name.trim() !== league.name

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!isDirty) return
        onRename(league.id, name.trim())
      }}
    >
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={40}
        aria-label="League name"
        className="min-w-0 flex-1 rounded-xl border border-[#404040] bg-[#1f1f1f] px-3 py-2 text-[13px] text-[#f4f4f2] outline-none focus-visible:border-[#88bdf2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
      />
      <button
        type="submit"
        disabled={!isDirty}
        className="flex-none rounded-lg border border-[#404040] px-3 py-2 text-[12px] font-medium text-[#9a9a9d] transition-colors hover:border-[#5a5a60] hover:text-[#f4f4f2] disabled:opacity-40 disabled:hover:border-[#404040] disabled:hover:text-[#9a9a9d] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:text-[#686968]"
      >
        Save
      </button>
    </form>
  )
}

// A member list where "remove" really means remove — the spot goes back to
// empty, not to another random name. Auto-backfilling would just be the
// same randomness the owner was trying to get away from, wearing a button.
function LeagueSettingsDrawer({ league, onClose, onRemoveMember, onRename, onRegenerateCode }) {
  const [confirmingId, setConfirmingId] = useState(null)
  const [codeJustRegenerated, setCodeJustRegenerated] = useState(false)
  const members = (league.memberRivalIds ?? []).map((rivalId) => rivals.find((rival) => rival.id === rivalId)).filter(Boolean)
  const openSpots = MAX_MEMBERS - members.length

  return (
    <Drawer id="private-league-settings" title="League settings" subtitle={league.name} onClose={onClose} labelledBy="private-league-settings-title">
      <div className="grid gap-6">
      <div className="grid gap-1.5">
        <span className="text-[12px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">League name</span>
        {onRename && <RenameLeagueControl league={league} onRename={onRename} />}
      </div>

      <div className="grid gap-1.5">
        <span className="text-[12px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Members</span>
        <p className="m-0 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          {openSpots > 0 ? `${openSpots} open ${openSpots === 1 ? 'spot' : 'spots'} — share the code to fill ${openSpots === 1 ? 'it' : 'them'}.` : 'This league is full.'}
          {' '}Removing someone opens their spot; it stays open until a friend joins with the code.
        </p>
        <ul className="m-0 grid list-none gap-1.5 p-0">
          {members.map((rival) => {
            const isConfirming = confirmingId === rival.id
            return (
              <li key={rival.id} className="flex items-center gap-3 rounded-xl px-1 py-1.5">
                <Avatar name={rival.name} avatarSeed={rival.id} size="sm" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{rival.name}</span>
                {isConfirming ? (
                  <span className="flex flex-none items-center gap-1.5">
                    <span className="text-[12px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Remove?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveMember(league.id, rival.id)
                        setConfirmingId(null)
                      }}
                      className="rounded-lg border border-[#ff676d] px-2.5 py-1.5 text-[12px] font-semibold text-[#ff676d] hover:bg-[#ff676d]/10 [[data-theme=light]_&]:border-[#b3272d] [[data-theme=light]_&]:text-[#b3272d]"
                    >
                      Yes, remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="rounded-lg border border-[#404040] px-2.5 py-1.5 text-[12px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:text-[#686968]"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(rival.id)}
                    className="flex-none rounded-lg border border-[#404040] px-2.5 py-1.5 text-[12px] font-medium text-[#9a9a9d] transition-colors hover:border-[#5a5a60] hover:text-[#f4f4f2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:text-neutral-800"
                  >
                    Remove
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {onRegenerateCode && (
        <div className="grid gap-1.5">
          <span className="text-[12px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Invite code</span>
          <p className="m-0 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
            Code leaked or you want a clean invite link? Regenerating retires <strong>{league.code}</strong> — anyone with the old code can no longer join.
          </p>
          <button
            type="button"
            onClick={() => {
              onRegenerateCode(league.id)
              setCodeJustRegenerated(true)
              window.setTimeout(() => setCodeJustRegenerated(false), 2000)
            }}
            className="justify-self-start rounded-lg border border-[#404040] px-3 py-2 text-[12px] font-medium text-[#9a9a9d] transition-colors hover:border-[#5a5a60] hover:text-[#f4f4f2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:text-[#686968]"
          >
            {codeJustRegenerated ? 'New code generated' : 'Regenerate code'}
          </button>
        </div>
      )}
      </div>
    </Drawer>
  )
}

function LeagueDetail({ league, seasonCoins, seasonIndex, onBack, onLeave, onRemoveMember, onRename, onRegenerateCode }) {
  const [showSettings, setShowSettings] = useState(false)
  const [selectedRivalId, setSelectedRivalId] = useState(null)
  const standings = getPrivateLeagueStandings(league, seasonCoins, seasonIndex)
  const inviteLink = `devspace.dev/league/${league.code}`
  const isOwner = Boolean(league.ownerId && onRemoveMember)
  const selectedEntry = selectedRivalId ? standings.find((entry) => entry.id === selectedRivalId) : null
  const selectedRival = selectedEntry ? rivals.find((rival) => rival.id === selectedEntry.id) : null

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <BackLink onClick={onBack}>All private leagues</BackLink>
        <div className="flex items-center gap-4">
          {isOwner && (
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="text-[13px] font-medium text-[#89baff] hover:underline [[data-theme=light]_&]:text-[#3d77eb]"
            >
              League settings
            </button>
          )}
          <button
            type="button"
            onClick={() => onLeave(league.id)}
            className="text-[13px] font-medium text-[#ff676d] hover:underline [[data-theme=light]_&]:text-[#b3272d]"
          >
            Leave league
          </button>
        </div>
      </div>

      <div className="grid gap-2 rounded-2xl border border-[#404040] bg-[#1a1a1c] p-5 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="grid size-11 flex-none place-items-center rounded-xl bg-[#262626] text-xl [[data-theme=light]_&]:bg-[#f0f0ee]">{league.emoji ?? '👥'}</span>
          <h2 className="m-0 text-xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{league.name}</h2>
        </div>
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
            <LeaderboardRow
              entry={entry}
              isCurrentUser={entry.isCurrentUser}
              onSelect={entry.isCurrentUser ? undefined : (row) => setSelectedRivalId(row.id)}
            />
          </li>
        ))}
      </ol>

      {selectedEntry && selectedRival && (
        <CompetitorDrawer
          entry={selectedEntry}
          rival={selectedRival}
          league={league}
          seasonIndex={seasonIndex}
          onClose={() => setSelectedRivalId(null)}
          onRemove={
            isOwner
              ? () => {
                  onRemoveMember(league.id, selectedRival.id)
                  setSelectedRivalId(null)
                }
              : undefined
          }
        />
      )}

      {isOwner && showSettings && (
        <LeagueSettingsDrawer
          league={league}
          onClose={() => setShowSettings(false)}
          onRemoveMember={onRemoveMember}
          onRename={onRename}
          onRegenerateCode={onRegenerateCode}
        />
      )}
    </div>
  )
}

export function PrivateLeagues({ privateLeagues, seasonCoins, seasonIndex, onBack, onCreate, onJoin, onLeave, onRemoveMember, onRename, onRegenerateCode }) {
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
          onRemoveMember={onRemoveMember}
          onRename={onRename}
          onRegenerateCode={onRegenerateCode}
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
