import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { ToggleSwitch } from '../ui/ToggleSwitch'
import { InfoTooltip } from '../ui/InfoTooltip'
import { SettingsSection } from './SettingsSection'
import { SettingsRow } from './SettingsRow'

const navItems = [
  { id: 'account', label: 'Account' },
  { id: 'premium', label: 'Premium' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'learning', label: 'Learning' },
  { id: 'danger', label: 'Account actions' },
]

const dailyGoals = [
  { id: 'casual', label: 'Casual', minutes: 5, meta: '5 min / day · 25 XP' },
  { id: 'regular', label: 'Regular', minutes: 10, meta: '10 min / day · 50 XP' },
  { id: 'serious', label: 'Serious', minutes: 15, meta: '15 min / day · 75 XP' },
  { id: 'intense', label: 'Intense', minutes: 20, meta: '20 min / day · 100 XP' },
]

export default function SettingsView({ theme, onToggleTheme, onNotice, email, progress, onOpenPlans, onUpdateDailyMinutes }) {
  const [notifications, setNotifications] = useState({
    reminders: true,
    streak: true,
    weeklyEmail: false,
  })
  const currentMinutes = progress?.profile?.dailyMinutes ?? 10
  const activeGoal = dailyGoals.find((g) => g.minutes === currentMinutes) ?? dailyGoals[1]

  const updateNotification = (key, value) => {
    setNotifications((current) => ({ ...current, [key]: value }))
    onNotice(`${value ? 'Enabled' : 'Disabled'} ${key === 'weeklyEmail' ? 'weekly progress email' : key === 'reminders' ? 'daily reminders' : 'streak alerts'}`)
  }

  const selectDailyGoal = (goal) => {
    onUpdateDailyMinutes?.(goal.minutes)
    onNotice(`Daily goal set to ${goal.label} (${goal.meta})`)
  }

  return (
    <section className="grid gap-8 max-[720px]:gap-[30px]" aria-label="Settings">
      <header className="grid gap-[7px] max-w-[680px]">
        <h1 className="text-3xl font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">Settings</h1>
        <p className="text-[17px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Manage your account, appearance, and learning preferences.</p>
      </header>

      <div className="grid grid-cols-[180px_minmax(0,1fr)] items-start gap-10 max-[720px]:grid-cols-1 max-[720px]:gap-6">
        <nav className="sticky top-6 grid gap-1 max-[720px]:hidden" aria-label="Settings sections">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-lg px-3 py-2 text-[14px] font-medium text-[#9a9a9d] hover:bg-[#262629] hover:text-[#f4f4f2] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:bg-[#f2f2f0] [[data-theme=light]_&]:hover:text-neutral-700"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="grid gap-6 min-w-0">
          <SettingsSection id="account" title="Account" description="Your profile information as seen by other learners.">
            <div className="flex items-center gap-4 max-[480px]:flex-col max-[480px]:items-start">
              <span className="grid size-12 flex-none place-items-center rounded-full bg-[#6699ec] text-lg font-semibold text-white" aria-hidden="true">L</span>
              <div className="grid min-w-0 flex-1 gap-0.5">
                <strong className="text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Learner</strong>
                <span className="truncate text-[14px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{email}</span>
              </div>
              <ActionButton variant="neutral" className="min-h-10 text-sm" onClick={() => onNotice('Profile editing is coming soon')}>
                Edit profile
              </ActionButton>
            </div>
          </SettingsSection>

          <SettingsSection id="premium" title="Premium" description={progress?.isPremium ? 'Manage your plan and see what it unlocks.' : 'Status and safety nets for your streak and league.'}>
            <div className="flex items-center gap-4 max-[480px]:flex-col max-[480px]:items-start">
              <span className="flex items-center gap-1.5">
                <strong className="text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
                  {progress?.isPremium ? 'Premium is active' : 'Not subscribed'}
                </strong>
                {!progress?.isPremium && (
                  <InfoTooltip label="Does Premium change my score?" align="start">
                    Premium never gives a faster score — it's status and safety nets only.
                  </InfoTooltip>
                )}
              </span>
              <ActionButton variant={progress?.isPremium ? 'neutral' : 'premium'} className="min-h-10 text-sm" onClick={() => onOpenPlans?.()}>
                {progress?.isPremium ? 'Manage plan' : 'See plans'}
              </ActionButton>
            </div>
          </SettingsSection>

          <SettingsSection id="appearance" title="Appearance" description="Choose how Devspace looks on this device.">
            <div className="flex gap-2 rounded-xl border border-[#404040] p-1 [[data-theme=light]_&]:border-[#d4d4d4]" role="radiogroup" aria-label="Theme">
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'dark'}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-[#6699ec] text-white' : 'text-[#9a9a9d] hover:text-[#f4f4f2] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:text-neutral-700'}`}
                onClick={() => theme !== 'dark' && onToggleTheme()}
              >
                Dark
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'light'}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${theme === 'light' ? 'bg-[#6699ec] text-white' : 'text-[#9a9a9d] hover:text-[#f4f4f2] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:text-neutral-700'}`}
                onClick={() => theme !== 'light' && onToggleTheme()}
              >
                Light
              </button>
            </div>
          </SettingsSection>

          <SettingsSection id="notifications" title="Notifications" description="Control what Devspace sends you.">
            <SettingsRow label="Daily reminders" description="A nudge if you haven't practiced yet today.">
              <ToggleSwitch
                checked={notifications.reminders}
                onChange={(value) => updateNotification('reminders', value)}
                label="Daily reminders"
              />
            </SettingsRow>
            <SettingsRow label="Streak alerts" description="Warn me before my streak resets.">
              <ToggleSwitch
                checked={notifications.streak}
                onChange={(value) => updateNotification('streak', value)}
                label="Streak alerts"
              />
            </SettingsRow>
            <SettingsRow label="Weekly progress email" description="A summary of your XP and completed missions.">
              <ToggleSwitch
                checked={notifications.weeklyEmail}
                onChange={(value) => updateNotification('weeklyEmail', value)}
                label="Weekly progress email"
              />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection id="learning" title="Learning" description="Set your daily XP goal to shape your streak pace.">
            <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
              {dailyGoals.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  className={`grid gap-1 rounded-xl border px-4 py-3 text-left transition-colors ${activeGoal.id === goal.id ? 'border-[#6699ec] bg-[#211f30] [[data-theme=light]_&]:bg-[#eff4ff]' : 'border-[#404040] hover:border-[#5a5a60] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:hover:border-[#b8b2a8]'}`}
                  aria-pressed={activeGoal.id === goal.id}
                  onClick={() => selectDailyGoal(goal)}
                >
                  <strong className="text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{goal.label}</strong>
                  <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{goal.meta}</span>
                </button>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection id="danger" title="Account actions">
            <div className="flex items-center gap-4 max-[480px]:flex-col max-[480px]:items-start">
              <ActionButton variant="neutral" className="min-h-10 text-sm" onClick={() => onNotice('Signed out')}>
                Sign out
              </ActionButton>
              <button
                type="button"
                className="text-sm font-medium text-[#e5636b] hover:underline"
                onClick={() => onNotice('Account deletion requires confirmation via email')}
              >
                Delete account
              </button>
            </div>
          </SettingsSection>
        </div>
      </div>
    </section>
  )
}
