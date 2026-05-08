import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Car, BookOpen, MessageSquare, Star, Wallet, Settings, PlusCircle, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Avatar, StatusBadge } from '../common'

const renterLinks = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Overview'    },
  { to: '/vehicles',   icon: Car,             label: 'Browse Cars' },
  { to: '/bookings',   icon: BookOpen,        label: 'My Bookings' },
  { to: '/messages',   icon: MessageSquare,   label: 'Messages'    },
  { to: '/reviews',    icon: Star,            label: 'Reviews'     },
]

const ownerLinks = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Overview'     },
  { to: '/my-vehicles',      icon: Car,             label: 'My Listings'  },
  { to: '/vehicles/new',     icon: PlusCircle,      label: 'List Vehicle' },
  { to: '/owner-bookings',   icon: BookOpen,        label: 'Bookings'     },
  { to: '/messages',         icon: MessageSquare,   label: 'Messages'     },
  { to: '/earnings',         icon: Wallet,          label: 'Earnings'     },
]

const bottomLinks = [
  { to: '/profile',  icon: User,     label: 'Profile'  },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { user, isOwner } = useAuth()
  const links = isOwner ? ownerLinks : renterLinks

  return (
    <aside className="w-60 flex-shrink-0 hidden lg:flex flex-col h-full py-6 px-3"
      style={{ borderRight: '1px solid var(--border)' }}>

      {/* User info */}
      <div className="flex items-center gap-3 px-3 mb-6">
        <Avatar src={user?.avatar} name={user?.fullName} size={40} />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{user?.fullName}</p>
          <div className="mt-0.5">
            <StatusBadge status={user?.isVerified ? 'verified' : 'pending'} />
          </div>
        </div>
      </div>

      {/* Role toggle pills */}
      <div className="flex gap-1 mb-5 px-1">
        {user?.role?.map(r => (
          <span key={r} className="badge badge-orange capitalize text-xs">{r}</span>
        ))}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-0.5">
        <p className="section-tag px-3 mb-3" style={{ fontSize: '10px' }}>
          {isOwner ? 'Owner' : 'Renter'} Menu
        </p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="space-y-0.5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        {bottomLinks.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
