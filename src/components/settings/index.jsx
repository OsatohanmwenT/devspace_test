import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { ToggleSwitch } from '../ui/ToggleSwitch'
import { SettingsSection } from './SettingsSection'
import { SettingsRow } from './SettingsRow'

const navItems = [
  { id: 'account', label: 'Account' },
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

export default function SettingsView({ theme, onToggleTheme, onNotice }) {
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
    <section className="settings-view" aria-label="Settings">
      <header className="settings-page-header">
        <h1>Settings</h1>
        <p>Manage your account, appearance, and learning preferences.</p>
      </header>

      <div className="settings-grid">
        <nav className="settings-nav" aria-label="Settings sections">
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="settings-nav-link">{item.label}</a>
          ))}
        </nav>

        <div className="settings-sections">
          <SettingsSection id="account" title="Account" description="Your profile information as seen by other learners.">
            <div className="settings-profile">
              <span className="settings-avatar" aria-hidden="true">L</span>
              <div className="settings-profile-copy">
                <strong>Learner</strong>
                <span>devspaceglobal@gmail.com</span>
              </div>
              <ActionButton variant="neutral" className="settings-profile-edit" onClick={() => onNotice('Profile editing is coming soon')}>
                Edit profile
              </ActionButton>
            </div>
          </SettingsSection>

          <SettingsSection id="appearance" title="Appearance" description="Choose how Devspace looks on this device.">
            <div className="settings-theme-toggle" role="radiogroup" aria-label="Theme">
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'dark'}
                className={theme === 'dark' ? 'settings-theme-option active' : 'settings-theme-option'}
                onClick={() => theme !== 'dark' && onToggleTheme()}
              >
                Dark
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'light'}
                className={theme === 'light' ? 'settings-theme-option active' : 'settings-theme-option'}
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
            <div className="settings-goal-grid">
              {dailyGoals.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  className={dailyGoal === goal.id ? 'settings-goal-card active' : 'settings-goal-card'}
                  aria-pressed={dailyGoal === goal.id}
                  onClick={() => selectDailyGoal(goal.id)}
                >
                  <strong>{goal.label}</strong>
                  <span>{goal.meta}</span>
                </button>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection id="danger" title="Account actions">
            <div className="settings-danger-row">
              <ActionButton variant="neutral" onClick={() => onNotice('Signed out')}>
                Sign out
              </ActionButton>
              <button type="button" className="settings-delete-link" onClick={() => onNotice('Account deletion requires confirmation via email')}>
                Delete account
              </button>
            </div>
          </SettingsSection>
        </div>
      </div>
    </section>
  )
}
