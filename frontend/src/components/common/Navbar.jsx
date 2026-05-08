import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Car, Bell, Menu, X, ChevronDown, LogOut, User, LayoutDashboard, PlusCircle, BookOpen, Wallet, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import { Avatar } from '../common'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout, isOwner } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [dropOpen, setDropOpen]   = useState(false)
  const dropRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  const navLinks = [
    { to: '/vehicles',   label: 'Browse' },
    { to: '/how-it-works', label: 'How it works' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-40" style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Car size={18} color="#fff" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">DriveShare</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) => `nav-link text-sm ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm p-2"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              {/* Notifications */}
              <button className="btn btn-ghost btn-sm p-2 relative hidden sm:flex">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
              </button>

              {/* User dropdown */}
              <div className="relative" ref={dropRef}>
                <button onClick={() => setDropOpen(p => !p)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--surface2)]">
                  <Avatar src={user.avatar} name={user.fullName} size={32} />
                  <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">{user.fullName}</span>
                  <ChevronDown size={14} style={{ color: 'var(--text-dim)' }} className={`transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-52 card py-1.5 shadow-card animate-fade-up" style={{ zIndex: 50 }}>
                    <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-sm font-semibold truncate">{user.fullName}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-mid)' }}>{user.email}</p>
                    </div>
                    <DropItem icon={LayoutDashboard} label="Dashboard"  to="/dashboard"   onClick={() => setDropOpen(false)} />
                    <DropItem icon={User}            label="Profile"    to="/profile"      onClick={() => setDropOpen(false)} />
                    <DropItem icon={BookOpen}        label="My Bookings" to="/bookings"    onClick={() => setDropOpen(false)} />
                    {isOwner && <>
                      <DropItem icon={PlusCircle} label="List Vehicle" to="/vehicles/new" onClick={() => setDropOpen(false)} />
                      <DropItem icon={Wallet}     label="Earnings"     to="/earnings"     onClick={() => setDropOpen(false)} />
                    </>}
                    <div className="border-t mt-1 pt-1" style={{ borderColor: 'var(--border)' }}>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-lg text-left"
                        style={{ color: '#ef4444' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm hidden sm:inline-flex">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button className="md:hidden btn btn-ghost btn-sm p-2" onClick={() => setMenuOpen(p => !p)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-1 animate-fade-in" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
          {!user && (
            <div className="flex gap-2 pt-2">
              <Link to="/login"    className="btn btn-outline btn-sm flex-1" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm flex-1" onClick={() => setMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

function DropItem({ icon: Icon, label, to, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-lg mx-1"
      style={{ color: 'var(--text-mid)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-mid)' }}>
      <Icon size={15} /> {label}
    </Link>
  )
}
