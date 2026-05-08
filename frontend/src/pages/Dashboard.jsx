// ── Dashboard ─────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingAPI, vehicleAPI, paymentAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Spinner, StatusBadge, StarRating, EmptyState, Avatar } from '../components/common'
import BookingCard from '../components/booking/BookingCard'
import { Car, BookOpen, Wallet, Star, TrendingUp, ArrowRight } from 'lucide-react'

export function Dashboard() {
  const { user, isOwner, isRenter } = useAuth()
  const showRenterView = isRenter || !isOwner
  const [stats, setStats]     = useState(null)
  const [recent, setRecent]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDash = async () => {
      try {
        const [bRes] = await Promise.all([
          showRenterView
            ? bookingAPI.getMyBookings({ limit: 5 })
            : bookingAPI.getOwnerBookings({ limit: 5 }),
        ])
        setRecent(bRes.data.data.bookings)
        setStats({ totalBookings: bRes.data.data.pagination.total })
      } catch {}
      finally { setLoading(false) }
    }
    fetchDash()
  }, [showRenterView])

  if (loading) return <div className="flex justify-center pt-20"><Spinner /></div>

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <p className="text-sm mb-1" style={{ color: 'var(--text-dim)' }}>Welcome back 👋</p>
        <h1 className="font-display text-3xl font-bold">{user?.fullName}</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Total Bookings', value: stats?.totalBookings ?? '—', color: 'var(--accent)' },
          { icon: Car,      label: 'Active Trips',   value: recent.filter(b=>b.status==='active').length, color: '#22c55e' },
          { icon: Star,     label: 'Avg. Rating',    value: user?.averageRating?.toFixed(1) || '—', color: '#f59e0b' },
          { icon: Wallet,   label: showRenterView ? 'Spent' : 'Earnings', value: '—', color: '#38bdf8' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
            </div>
            <p className="font-display font-bold text-2xl mb-0.5" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">Recent Bookings</h2>
          <Link to={showRenterView ? '/bookings' : '/owner-bookings'} className="text-sm flex items-center gap-1"
            style={{ color: 'var(--accent)' }}>View all <ArrowRight size={13} /></Link>
        </div>
        {recent.length === 0
          ? <EmptyState icon={BookOpen} title="No bookings yet" description={showRenterView ? "Your booking requests will appear here." : "Start by browsing available vehicles."} action={<Link to="/vehicles" className="btn btn-primary btn-sm">Browse vehicles</Link>} />
          : <div className="space-y-3">
              {recent.map(b => <BookingCard key={b._id} booking={b} role={showRenterView ? 'renter' : 'owner'} />)}
            </div>
        }
      </div>
    </div>
  )
}

// ── Bookings List page ────────────────────────────────────────────────────────
export function Bookings({ ownerView = false }) {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [status,   setStatus]   = useState('')
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const params = { page, limit: 10, ...(status && { status }) }
        const { data } = ownerView
          ? await bookingAPI.getOwnerBookings(params)
          : await bookingAPI.getMyBookings(params)
        setBookings(data.data.bookings)
        setTotal(data.data.pagination.total)
      } catch {}
      finally { setLoading(false) }
    }
    fetch()
  }, [ownerView, status, page])

  const statuses = ['', 'pending','confirmed','active','completed','cancelled']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-2xl font-bold">{ownerView ? 'Owner' : 'My'} Bookings</h1>
        <p className="text-sm" style={{ color: 'var(--text-mid)' }}>{total} bookings</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }}
            className={`btn btn-sm flex-shrink-0 ${status === s ? 'btn-primary' : 'btn-outline'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-10"><Spinner /></div>
        : bookings.length === 0
          ? <EmptyState icon={BookOpen} title="No bookings" description="No bookings match this filter." />
          : <div className="space-y-3">
              {bookings.map(b => <BookingCard key={b._id} booking={b} role={ownerView ? 'owner' : 'renter'} />)}
            </div>
      }
    </div>
  )
}

// ── Earnings page ─────────────────────────────────────────────────────────────
export function Earnings() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentAPI.getMyEarnings({ limit: 20 })
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center pt-20"><Spinner /></div>

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Earnings</h1>

      {/* Total */}
      <div className="stat-card flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.12)' }}>
          <TrendingUp size={22} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <p className="text-sm" style={{ color: 'var(--text-mid)' }}>Total Earnings</p>
          <p className="font-display font-bold text-3xl" style={{ color: 'var(--accent)' }}>
            ₹{data?.totalEarnings?.toLocaleString('en-IN') || '0'}
          </p>
        </div>
      </div>

      {/* Payment list */}
      <div className="space-y-3">
        {data?.payments?.length === 0
          ? <EmptyState icon={Wallet} title="No earnings yet" description="Complete bookings will appear here." />
          : data?.payments?.map(p => (
            <div key={p._id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.1)' }}>
                <Wallet size={18} style={{ color: '#22c55e' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Trip #{p._id?.slice(-6)}</p>
                <p className="text-xs" style={{ color: 'var(--text-mid)' }}>
                  {p.hoursUsed?.toFixed(1)}h · {p.paidBy?.fullName}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold" style={{ color: '#22c55e' }}>+₹{p.totalAmount?.toLocaleString('en-IN')}</p>
                <StatusBadge status={p.status} />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
