import { HomeIcon, PathsIcon, SettingsIcon } from '../ui/icons'

const navItems = [
  { id: 'Home', label: 'Home', Icon: HomeIcon },
  { id: 'Paths', label: 'Paths', Icon: PathsIcon },
  { id: 'Settings', label: 'Settings', Icon: SettingsIcon },
]

export function AppSidebar({ active, onNavigate, theme, onToggleTheme }) {
  return (
    <aside className="app-sidebar">
      <button className="sidebar-brand" onClick={() => onNavigate('Home')} aria-label="Devspace home">
        <img src="/assets/logo.svg" alt="Devspace" />
      </button>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={active === id ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
            aria-current={active === id ? 'page' : undefined}
            onClick={() => onNavigate(id)}
          >
            <Icon className="sidebar-nav-icon" />
            <span className="sidebar-nav-label">{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-nav-item" onClick={onToggleTheme}>
          <span className="sidebar-nav-icon" aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
          <span className="sidebar-nav-label">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>
    </aside>
  )
}

