import { Link, NavLink } from 'react-router-dom'
import { Car, LayoutDashboard, LogOut, Moon, ShieldCheck, Sun, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../hooks/useTheme'

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
]

export default function AdminShell({ title, subtitle, actions, children }) {
  const { admin } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(circle at top, var(--accent-dim) 0%, transparent 32%), var(--bg)',
      }}
    >
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <ShieldCheck size={20} color="#052014" />
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs uppercase tracking-[0.3em]"
                  style={{ color: 'var(--text-dim)' }}
                >
                  DriveShare Admin
                </p>
                <p className="font-display text-lg font-semibold truncate">
                  {admin?.fullName || 'Administrator'}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 lg:hidden">
              <ThemeButton isDark={isDark} onToggle={toggleTheme} />
              <Link to="/logout" className="btn btn-outline btn-sm">
                <LogOut size={15} />
                Logout
              </Link>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeButton isDark={isDark} onToggle={toggleTheme} />
            <Link to="/logout" className="btn btn-outline btn-sm">
              <LogOut size={15} />
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 page-enter">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-tag">Control Center</p>
            <h1 className="font-display text-3xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-sm mt-2 max-w-2xl" style={{ color: 'var(--text-mid)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>

        {children}
      </main>
    </div>
  )
}

function ThemeButton({ isDark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="btn btn-ghost btn-sm p-2"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
