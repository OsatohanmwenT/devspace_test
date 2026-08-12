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
  { id: 'casual', label: 'Casual', meta: '5 XP / day' },
  { id: 'regular', label: 'Regular', meta: '10 XP / day' },
  { id: 'serious', label: 'Serious', meta: '20 XP / day' },
  { id: 'intense', label: 'Intense', meta: '30 XP / day' },
]

export default function SettingsView({ theme, onToggleTheme, onNotice, email, progress, onOpenPlans }) {
  const [notifications, setNotifications] = useState({
    reminders: true,
    streak: true,
    weeklyEmail: false,
  })
  const [dailyGoal, setDailyGoal] = useState('regular')

  const updateNotification = (key, value) => {
    setNotifications((current) => ({ ...current, [key]: value }))
    onNotice(`${value ? 'Enabled' : 'Disabled'} ${key === 'weeklyEmail' ? 'weekly progress email' : key === 'reminders' ? 'daily reminders' : 'streak alerts'}`)
  }

  const selectDailyGoal = (id) => {
    setDailyGoal(id)
    onNotice(`Daily goal set to ${dailyGoals.find((goal) => goal.id === id).label}`)
  }

  return (
    <section className="grid gap-8 max-[720px]:gap-[30px]" aria-label="Settings">
      <header className="grid gap-[7px] max-w-[680px]">
        <h1 className="text-3xl font-medium text-[var(--text-primary)] font-['Rethink_Sans',Arial,sans-serif] [[data-theme=light]_&]:text-[var(--text-primary)]">Settings</h1>
        <p className="text-[17px] leading-[1.5] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">Manage your account, appearance, and learning preferences.</p>
      </header>

      <div className="grid grid-cols-[180px_minmax(0,1fr)] items-start gap-10 max-[720px]:grid-cols-1 max-[720px]:gap-6">
        <nav className="sticky top-6 grid gap-1 max-[720px]:hidden" aria-label="Settings sections">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-lg px-3 py-2 text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-secondary)] [[data-theme=light]_&]:hover:bg-[var(--surface-subtle)] [[data-theme=light]_&]:hover:text-[var(--text-primary)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="grid gap-6 min-w-0">
          <SettingsSection id="account" title="Account" description="Your profile information as seen by other learners.">
            <div className="flex items-center gap-4 max-[480px]:flex-col max-[480px]:items-start">
              <span className="grid size-12 flex-none place-items-center rounded-full bg-[var(--brand-cta)] text-lg font-semibold text-white" aria-hidden="true">L</span>
              <div className="grid min-w-0 flex-1 gap-0.5">
                <strong className="text-[15px] font-medium text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">Learner</strong>
                <span className="truncate text-[14px] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">{email}</span>
              </div>
              <ActionButton variant="secondary" className="text-sm" onClick={() => onNotice('Profile editing is coming soon')}>
                Edit profile
              </ActionButton>
            </div>
          </SettingsSection>

          <SettingsSection id="premium" title="Premium" description={progress?.isPremium ? 'Manage your plan and see what it unlocks.' : 'Status and safety nets for your streak and league.'}>
            <div className="flex items-center gap-4 max-[480px]:flex-col max-[480px]:items-start">
              <span className="flex items-center gap-1.5">
                <strong className="text-[15px] font-medium text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">
                  {progress?.isPremium ? 'Premium is active' : 'Not subscribed'}
                </strong>
                {!progress?.isPremium && (
                  <InfoTooltip label="Does Premium change my score?" align="start">
                    Premium never gives a faster score — it's status and safety nets only.
                  </InfoTooltip>
                )}
              </span>
              <ActionButton variant={progress?.isPremium ? 'secondary' : 'primary'} className="text-sm" onClick={() => onOpenPlans?.()}>
                {progress?.isPremium ? 'Manage plan' : 'See plans'}
              </ActionButton>
            </div>
          </SettingsSection>

          <SettingsSection id="appearance" title="Appearance" description="Choose how Devspace looks on this device.">
            <div className="flex gap-2 rounded-xl border border-[var(--border-default)] p-1 [[data-theme=light]_&]:border-[var(--border-default)]" role="radiogroup" aria-label="Theme">
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'dark'}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-[var(--brand-cta)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-secondary)] [[data-theme=light]_&]:hover:text-[var(--text-primary)]'}`}
                onClick={() => theme !== 'dark' && onToggleTheme()}
              >
                Dark
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'light'}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${theme === 'light' ? 'bg-[var(--brand-cta)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-secondary)] [[data-theme=light]_&]:hover:text-[var(--text-primary)]'}`}
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
                  className={`grid gap-1 rounded-[var(--radius-card)] border px-4 py-3 text-left transition-colors ${dailyGoal === goal.id ? 'border-[var(--brand-cta)] bg-[var(--surface-brand-tint)]' : 'border-[var(--border-default)] hover:border-[var(--border-interactive)]'}`}
                  aria-pressed={dailyGoal === goal.id}
                  onClick={() => selectDailyGoal(goal.id)}
                >
                  <strong className="text-[15px] font-medium text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">{goal.label}</strong>
                  <span className="text-[13px] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">{goal.meta}</span>
                </button>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection id="danger" title="Account actions">
            <div className="flex items-center gap-4 max-[480px]:flex-col max-[480px]:items-start">
              <ActionButton variant="secondary" className="text-sm" onClick={() => onNotice('Signed out')}>
                Sign out
              </ActionButton>
              <button
                type="button"
                className="text-sm font-medium text-[var(--accent-error)] hover:underline"
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
