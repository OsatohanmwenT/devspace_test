import { useEffect, useMemo, useRef, useState } from 'react'
import { canPost, CHANNELS, dmKey, getConversation, getDirectContacts, getLastMessage, getLeagueLead, isDmKey, MAX_MESSAGE_LENGTH } from '../../lib/leagueChat'
import { Avatar } from '../ui/Avatar'

// Three surface steps, darkest at the edge — rail, sidebar, conversation —
// the way a chat app separates "where" from "what" without heavy borders.
const RAIL = 'bg-[#111113] [[data-theme=light]_&]:bg-[#e8e6e1]'
const SIDEBAR = 'bg-[#18181a] [[data-theme=light]_&]:bg-[#f3f2ee]'
const MAIN = 'bg-[#1f1f22] [[data-theme=light]_&]:bg-white'
const LINE = 'border-[#2b2b2f] [[data-theme=light]_&]:border-[#e4e2dc]'
const RULE = 'bg-[#2b2b2f] [[data-theme=light]_&]:bg-[#e4e2dc]'
const MUTED = 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
const FAINT = 'text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'
const STRONG = 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'
const LEAD_TEXT = 'text-[#84a5ff] [[data-theme=light]_&]:text-[#2f55c4]'
const HOVER = 'hover:bg-[#26262a] [[data-theme=light]_&]:hover:bg-[#e9e7e2]'
const SELECTED = 'bg-[#2c2c31] [[data-theme=light]_&]:bg-[#e2e0da]'
const CATEGORY = `px-2 text-[11px] font-bold uppercase tracking-[.06em] ${FAINT}`

const CHANNEL_GROUPS = [
  { label: 'Information', ids: ['announcements'] },
  { label: 'Class', ids: ['general', 'help', 'wins'] },
]

function LeadBadge() {
  return <span className="rounded bg-[#4169e1]/20 px-1 py-px text-[10px] font-bold uppercase tracking-[.04em] text-[#84a5ff] [[data-theme=light]_&]:bg-[#e3ebff] [[data-theme=light]_&]:text-[#2f55c4]">Lead</span>
}

function timeLabel(at, now) {
  const date = new Date(at)
  const sameDay = date.toDateString() === new Date(now).toDateString()
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return sameDay ? `Today at ${time}` : `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${time}`
}

const dayLabel = (at) => new Date(at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })

function RailButton({ label, active, onClick, children }) {
  return (
    <div className="group relative flex w-full justify-center">
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-r-full bg-[#f4f4f2] transition-all [[data-theme=light]_&]:bg-neutral-800 ${active ? 'h-10' : 'h-0 group-hover:h-5'}`}
      />
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-current={active ? 'true' : undefined}
        title={label}
        className={`grid size-12 place-items-center text-[22px] transition-all ${active ? 'rounded-2xl bg-[#4169e1] text-white' : 'rounded-[24px] bg-[#232327] hover:rounded-2xl hover:bg-[#4169e1] [[data-theme=light]_&]:bg-white'}`}
      >
        {children}
      </button>
    </div>
  )
}

function ChannelLink({ channel, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${active ? SELECTED : HOVER}`}
    >
      <span aria-hidden="true" className={`w-5 flex-none text-center text-[18px] leading-none ${FAINT}`}>#</span>
      <span className={`min-w-0 flex-1 truncate text-[15px] ${active ? `font-semibold ${STRONG}` : `font-medium ${MUTED}`}`}>{channel.name}</span>
      {channel.leadOnly && <span role="img" aria-label="Only the lead can post" title="Only the lead can post" className="flex-none text-[11px]">🔒</span>}
    </button>
  )
}

function PersonLink({ person, active, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${active ? SELECTED : HOVER}`}
    >
      <Avatar name={person.name} avatarSeed={person.id} size="sm" />
      <span className="grid min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className={`truncate text-[14px] ${active ? `font-semibold ${STRONG}` : `font-medium ${MUTED}`}`}>{person.name}</span>
          {person.isLead && <LeadBadge />}
        </span>
        {subtitle && <span className={`truncate text-[12px] ${FAINT}`}>{subtitle}</span>}
      </span>
    </button>
  )
}

function Message({ message, now, user, grouped }) {
  const { author } = message
  return (
    <div
      className={`group relative flex gap-4 border-l-2 py-0.5 pl-4 pr-6 hover:bg-[#1a1a1d] [[data-theme=light]_&]:hover:bg-[#f7f6f3] ${grouped ? '' : 'mt-4'} ${
        message.highlight ? 'border-[#ffb454] bg-[#ffb454]/[.06] [[data-theme=light]_&]:bg-[#fff8ec]' : 'border-transparent'
      }`}
    >
      <span className="w-10 flex-none">
        {grouped ? (
          <span className={`hidden pt-1 text-right text-[10px] group-hover:block ${FAINT}`}>{new Date(message.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
        ) : (
          <span className="mt-0.5 block [&>*]:!size-10">
            <Avatar name={author.name} photo={author.isYou ? user?.photo : undefined} avatarStyle={author.isYou ? user?.avatarStyle : undefined} avatarSeed={author.id} size="md" />
          </span>
        )}
      </span>
      <div className="grid min-w-0 flex-1">
        {!grouped && (
          <span className="flex flex-wrap items-baseline gap-x-2">
            <strong className={`text-[15px] font-semibold ${author.isLead ? LEAD_TEXT : STRONG}`}>{author.name}</strong>
            {author.isLead && <LeadBadge />}
            <span className={`text-[12px] ${FAINT}`}>{timeLabel(message.at, now)}</span>
          </span>
        )}
        <p className={`m-0 whitespace-pre-wrap break-words text-[15px] leading-[1.45] ${STRONG}`}>{message.text}</p>
      </div>
    </div>
  )
}

function Composer({ placeholder, disabledReason, onSend }) {
  const [text, setText] = useState('')
  const trimmed = text.trim()

  const send = () => {
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  if (disabledReason) {
    return <p className={`m-0 rounded-lg bg-[#2a2a2e] px-4 py-3 text-[14px] [[data-theme=light]_&]:bg-[#f1efea] ${FAINT}`}>{disabledReason}</p>
  }

  return (
    <form
      className="flex items-end gap-2 rounded-lg bg-[#2a2a2e] px-2 py-1.5 [[data-theme=light]_&]:bg-[#f1efea]"
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      <textarea
        value={text}
        autoFocus
        onChange={(event) => setText(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()
            send()
          }
        }}
        rows={Math.min(8, Math.max(1, text.split('\n').length))}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-[1.45] outline-none placeholder:text-[#7d7d80] ${STRONG}`}
      />
      <button
        type="submit"
        disabled={!trimmed}
        aria-label="Send message"
        className="mb-0.5 grid size-9 flex-none place-items-center rounded-md bg-[#4169e1] text-white transition-opacity disabled:opacity-30"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true"><path d="M4 12h15m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </form>
  )
}

function MemberRow({ person, user, onMessage }) {
  return (
    <button
      type="button"
      disabled={person.isYou}
      onClick={() => onMessage(person)}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors enabled:hover:bg-[#26262a] [[data-theme=light]_&]:enabled:hover:bg-[#e9e7e2]"
    >
      <Avatar name={person.name} photo={person.isYou ? user?.photo : undefined} avatarStyle={person.isYou ? user?.avatarStyle : undefined} avatarSeed={person.id} size="sm" />
      <span className={`min-w-0 flex-1 truncate text-[14px] font-medium ${person.isLead ? LEAD_TEXT : MUTED}`}>{person.name}</span>
    </button>
  )
}

function MembersPanel({ league, lead, contacts, user, onMessage }) {
  const you = { id: 'you', name: 'You', isYou: true, isLead: Boolean(lead?.isYou) }
  const others = contacts.filter((contact) => !contact.isLead)
  const leadPerson = lead?.isYou ? you : contacts.find((contact) => contact.isLead)
  const members = lead?.isYou ? others : [...(league.organizerOnly ? [] : [you]), ...others]

  return (
    <aside aria-label="Members" className={`hidden w-60 flex-none overflow-y-auto border-l px-2 py-4 min-[1100px]:block ${LINE} ${SIDEBAR}`}>
      {leadPerson && (
        <div className="mb-4 grid gap-0.5">
          <span className={CATEGORY}>Lead — 1</span>
          <MemberRow person={leadPerson} user={user} onMessage={onMessage} />
        </div>
      )}
      <div className="grid gap-0.5">
        <span className={CATEGORY}>Members — {members.length}</span>
        {members.map((person) => <MemberRow key={person.id} person={person} user={user} onMessage={onMessage} />)}
      </div>
    </aside>
  )
}

// A league's class space, full screen like a chat app: a rail of your
// leagues, a channel + DM sidebar, the conversation, and the member list.
// It covers the app's own chrome, so it brings its own way out (the top of
// the rail, or Escape). On phones the sidebar and the conversation are
// separate views, like any messaging app.
export function ClassSpace({ league, leagues = [], leagueChats, clock, user, initialKey = 'general', onExit, onSwitchLeague, onPost }) {
  const [activeKey, setActiveKey] = useState(initialKey)
  const [showListOnPhone, setShowListOnPhone] = useState(false)
  const [showMembers, setShowMembers] = useState(true)
  const [contactQuery, setContactQuery] = useState('')
  const listRef = useRef(null)
  const lead = getLeagueLead(league)
  const contacts = getDirectContacts(league)
  const now = clock.timestamp

  const messages = useMemo(
    () => getConversation(league, activeKey, leagueChats, clock).map((message) => ({ ...message, highlight: activeKey === 'announcements' })),
    [league, activeKey, leagueChats, clock],
  )
  const channel = CHANNELS.find((entry) => entry.id === activeKey)
  const contact = isDmKey(activeKey) ? contacts.find((entry) => dmKey(entry.id) === activeKey) : null

  // Full screen means the page underneath mustn't scroll behind it, and
  // Escape is the expected way out of an overlay.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape' && !event.defaultPrevented) onExit()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [onExit])

  useEffect(() => {
    const node = listRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [activeKey, messages.length])

  const open = (key) => {
    setActiveKey(key)
    setShowListOnPhone(false)
  }

  const lastPreview = (key) => {
    const last = getLastMessage(league, key, leagueChats, clock)
    return last ? `${last.author.isYou ? 'You' : last.author.name.split(' ')[0]}: ${last.text}` : null
  }

  const filteredContacts = contactQuery.trim()
    ? contacts.filter((entry) => entry.name.toLowerCase().includes(contactQuery.trim().toLowerCase()))
    : contacts

  const disabledReason = !canPost(league, activeKey)
    ? channel?.leadOnly
      ? `Only ${lead?.name ?? 'the lead'} can post in #announcements. Reply in #general, or message them directly.`
      : 'This person is no longer in the league.'
    : null

  return (
    <div className="fixed inset-0 z-[60] flex" role="dialog" aria-modal="true" aria-label={`${league.name} class space`}>
      {/* Rail: the way out, then every league you're in. */}
      <nav aria-label="Your leagues" className={`flex w-[72px] flex-none flex-col items-center gap-2 overflow-y-auto py-3 ${RAIL} ${showListOnPhone ? '' : 'max-[720px]:hidden'}`}>
        <RailButton label="Back to the league page" onClick={onExit}>
          <svg viewBox="0 0 24 24" className={`size-5 ${STRONG}`} fill="none" aria-hidden="true"><path d="m15 5-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </RailButton>
        <span aria-hidden="true" className={`my-1 h-0.5 w-8 rounded-full ${RULE}`} />
        {leagues.map((entry) => (
          <RailButton key={entry.id} label={entry.name} active={entry.id === league.id} onClick={() => entry.id !== league.id && onSwitchLeague?.(entry.id)}>
            <span aria-hidden="true">{entry.emoji ?? '👥'}</span>
          </RailButton>
        ))}
      </nav>

      {/* Channels and DMs. */}
      <div className={`flex w-60 flex-none flex-col ${SIDEBAR} max-[720px]:flex-1 ${showListOnPhone ? '' : 'max-[720px]:hidden'}`}>
        <header className={`flex h-12 flex-none items-center gap-2 border-b px-4 ${LINE}`}>
          <strong className={`min-w-0 flex-1 truncate text-[15px] font-semibold ${STRONG}`}>{league.name}</strong>
          <span className={`flex-none text-[11px] font-semibold uppercase tracking-[.06em] ${FAINT}`}>{league.kind === 'class' ? 'Class' : 'Friends'}</span>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-2 py-4">
          {CHANNEL_GROUPS.map((group) => (
            <div key={group.label} className="grid gap-0.5">
              <span className={CATEGORY}>{group.label}</span>
              {group.ids.map((id) => {
                const entry = CHANNELS.find((item) => item.id === id)
                return <ChannelLink key={id} channel={entry} active={activeKey === id} onClick={() => open(id)} />
              })}
            </div>
          ))}

          <div className="grid gap-0.5">
            <span className={CATEGORY}>Direct messages</span>
            {contacts.length > 8 && (
              <input
                type="search"
                value={contactQuery}
                onChange={(event) => setContactQuery(event.target.value)}
                placeholder="Find someone"
                aria-label="Find someone to message"
                className={`mx-1 mb-1 h-8 rounded-md border-0 bg-[#111113] px-2.5 text-[13px] outline-none placeholder:text-[#7d7d80] focus-visible:ring-2 focus-visible:ring-[#4169e1] [[data-theme=light]_&]:bg-[#e8e6e1] ${STRONG}`}
              />
            )}
            {filteredContacts.map((entry) => (
              <PersonLink key={entry.id} person={entry} active={activeKey === dmKey(entry.id)} subtitle={lastPreview(dmKey(entry.id))} onClick={() => open(dmKey(entry.id))} />
            ))}
            {filteredContacts.length === 0 && <p className={`m-0 px-2 py-1 text-[12px] ${FAINT}`}>No one by that name.</p>}
          </div>

          <p className={`m-0 mt-auto px-2 text-[11px] leading-[1.45] ${FAINT}`}>
            Demo: classmates are simulated, so they won’t reply. Your messages are saved on this device.
          </p>
        </div>

        {/* Who you are here. */}
        <div className={`flex h-14 flex-none items-center gap-2.5 px-3 ${RAIL}`}>
          <Avatar name="You" photo={user?.photo} avatarStyle={user?.avatarStyle} avatarSeed="you" size="sm" />
          <span className="grid min-w-0 flex-1">
            <strong className={`truncate text-[13px] font-semibold ${STRONG}`}>{user?.name ?? 'You'}</strong>
            <span className={`truncate text-[11px] ${FAINT}`}>{lead?.isYou ? (league.organizerOnly ? 'Lead · organizing' : 'Lead') : 'Member'}</span>
          </span>
        </div>
      </div>

      {/* Conversation. */}
      <section className={`flex min-w-0 flex-1 flex-col ${MAIN} ${showListOnPhone ? 'max-[720px]:hidden' : ''}`} aria-label={channel ? `#${channel.name}` : contact?.name}>
        <header className={`flex h-12 flex-none items-center gap-3 border-b px-4 ${LINE}`}>
          <button
            type="button"
            onClick={() => setShowListOnPhone(true)}
            aria-label="Channels and messages"
            className={`hidden size-8 flex-none place-items-center rounded-md max-[720px]:grid ${HOVER} ${MUTED}`}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          {channel ? (
            <>
              <span aria-hidden="true" className={`text-[22px] leading-none ${FAINT}`}>#</span>
              <strong className={`flex-none text-[16px] font-semibold ${STRONG}`}>{channel.name}</strong>
              <span aria-hidden="true" className={`h-5 w-px flex-none max-[720px]:hidden ${RULE}`} />
              <span className={`min-w-0 flex-1 truncate text-[13px] max-[720px]:hidden ${MUTED}`}>{channel.topic}</span>
            </>
          ) : contact ? (
            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              <Avatar name={contact.name} avatarSeed={contact.id} size="sm" />
              <strong className={`truncate text-[16px] font-semibold ${STRONG}`}>{contact.name}</strong>
              {contact.isLead && <LeadBadge />}
              <span className={`truncate text-[13px] max-[720px]:hidden ${MUTED}`}>{contact.isLead ? 'Runs this league' : contact.role}</span>
            </span>
          ) : null}
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => setShowMembers((current) => !current)}
            aria-pressed={showMembers}
            aria-label={showMembers ? 'Hide member list' : 'Show member list'}
            title="Member list"
            className={`hidden size-8 flex-none place-items-center rounded-md min-[1100px]:grid ${HOVER} ${showMembers ? STRONG : MUTED}`}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" /><path d="M2.5 19c.8-3.4 3.3-5 6.5-5s5.7 1.6 6.5 5M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .6 3.1 2.2 3.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto pb-4">
              {/* Welcome header at the top of every conversation. */}
              <div className="grid gap-2 px-4 pb-2 pt-8">
                {channel ? (
                  <span aria-hidden="true" className={`grid size-16 place-items-center rounded-full bg-[#2c2c31] text-[34px] [[data-theme=light]_&]:bg-[#ecebe6] ${STRONG}`}>#</span>
                ) : contact ? (
                  <span className="[&>*]:!size-16"><Avatar name={contact.name} avatarSeed={contact.id} size="lg" /></span>
                ) : null}
                <h2 className={`m-0 text-[26px] font-bold ${STRONG}`}>{channel ? `Welcome to #${channel.name}` : contact?.name}</h2>
                <p className={`m-0 text-[14px] ${MUTED}`}>
                  {channel
                    ? channel.leadOnly
                      ? `Updates from ${lead?.isYou ? 'you, the lead' : lead?.name ?? 'the lead'}. Everyone in ${league.name} sees these.`
                      : `${channel.topic}. Everyone in ${league.name} can read and post here.`
                    : contact
                      ? `This is the start of your conversation with ${contact.name}.${contact.isLead ? ' They run this league.' : ''}`
                      : ''}
                </p>
              </div>

              {messages.map((message, index) => {
                const previous = messages[index - 1]
                const newDay = !previous || new Date(previous.at).toDateString() !== new Date(message.at).toDateString()
                const grouped = !newDay && previous.author.id === message.author.id && message.at - previous.at < 7 * 60 * 1000
                return (
                  <div key={message.id}>
                    {newDay && (
                      <div className={`mx-4 mt-6 flex items-center gap-2 text-[12px] font-semibold ${FAINT}`} role="separator">
                        <span className={`h-px flex-1 ${RULE}`} />
                        {dayLabel(message.at)}
                        <span className={`h-px flex-1 ${RULE}`} />
                      </div>
                    )}
                    <Message message={message} now={now} user={user} grouped={grouped} />
                  </div>
                )
              })}
            </div>

            <div className="flex-none px-4 pb-5 pt-1">
              <Composer
                key={activeKey}
                placeholder={channel ? `Message #${channel.name}` : `Message ${contact?.name ?? ''}`}
                disabledReason={disabledReason}
                onSend={(text) => onPost(activeKey, text)}
              />
            </div>
          </div>

          {showMembers && <MembersPanel league={league} lead={lead} contacts={contacts} user={user} onMessage={(person) => open(dmKey(person.id))} />}
        </div>
      </section>
    </div>
  )
}
