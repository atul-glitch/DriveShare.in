import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Car, CheckCircle, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { adminAPI } from '../services/api'
import { Spinner } from '../components/common'
import AdminShell from '../components/common/AdminShell'

export function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStatistics()
        setStats(response.data.data)
      } catch {
        setError('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.users.total || 0,
      icon: Users,
      color: '#38bdf8',
      hint: 'Registered accounts across the platform',
    },
    {
      label: 'Verified Users',
      value: stats?.users.verified || 0,
      icon: CheckCircle,
      color: '#22c55e',
      hint: 'KYC approved and ready to transact',
    },
    {
      label: 'Pending Review',
      value: stats?.users.unverified || 0,
      icon: AlertCircle,
      color: '#f59e0b',
      hint: 'Users waiting for document approval',
    },
    {
      label: 'Total Vehicles',
      value: stats?.vehicles.total || 0,
      icon: Car,
      color: 'var(--accent)',
      hint: 'Listings created by vehicle owners',
    },
  ]

  return (
    <AdminShell
      title="Admin Dashboard"
      subtitle="Track platform activity, review pending accounts, and manage the marketplace from the same theme as the user dashboard."
    >
      {error ? (
        <div
          className="rounded-2xl border px-4 py-3"
          style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.1)' }}
        >
          <p className="text-sm" style={{ color: '#f87171' }}>
            {error}
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, hint }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                  {label}
                </p>
                <p className="font-display font-bold text-3xl mt-3" style={{ color }}>
                  {value}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18`, border: `1px solid ${color}33` }}
              >
                <Icon size={22} style={{ color }} />
              </div>
            </div>
            <p className="text-sm mt-4" style={{ color: 'var(--text-mid)' }}>
              {hint}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminActionCard
          title="User Management"
          description="Review KYC submissions, verify user accounts, and inspect Aadhaar and driving licence documents."
          icon={Users}
          color="#38bdf8"
          primaryAction={{
            to: '/admin/users',
            label: 'Manage All Users',
          }}
          secondaryAction={{
            to: '/admin/users?verified=false',
            label: `Review Pending Users (${stats?.users.unverified || 0})`,
          }}
          footer={`Active users: ${stats?.users.active || 0}`}
        />

        <AdminActionCard
          title="Vehicle Management"
          description="Monitor listings, toggle active status, and remove vehicles that violate platform rules."
          icon={Car}
          color="var(--accent)"
          primaryAction={{
            to: '/admin/vehicles',
            label: 'Manage Vehicles',
          }}
          secondaryAction={{
            to: '/admin/vehicles?status=active',
            label: `View Active Listings (${stats?.vehicles.active || 0})`,
          }}
          footer={`Inactive vehicles: ${stats?.vehicles.inactive || 0}`}
        />
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(56,189,248,0.14)', border: '1px solid rgba(56,189,248,0.24)' }}
          >
            <TrendingUp size={20} style={{ color: '#38bdf8' }} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Quick Statistics</h2>
            <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
              Snapshot of verification and listing health across the platform.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricPanel
            label="Verification Rate"
            value={
              stats?.users.total > 0
                ? `${Math.round((stats.users.verified / stats.users.total) * 100)}%`
                : '0%'
            }
            accent="#38bdf8"
          />
          <MetricPanel
            label="Active Vehicle Rate"
            value={
              stats?.vehicles.total > 0
                ? `${Math.round((stats.vehicles.active / stats.vehicles.total) * 100)}%`
                : '0%'
            }
            accent="#22c55e"
          />
          <MetricPanel
            label="Platform Health"
            value="Good"
            accent="var(--accent)"
          />
        </div>
      </div>
    </AdminShell>
  )
}

function AdminActionCard({ title, description, icon: Icon, color, primaryAction, secondaryAction, footer }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-mid)' }}>
            {description}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}2e` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
      </div>

      <div className="space-y-3">
        <Link to={primaryAction.to} className="btn btn-primary w-full">
          {primaryAction.label}
          <ArrowRight size={16} />
        </Link>
        <Link
          to={secondaryAction.to}
          className="btn btn-outline w-full"
          style={{ borderColor: `${color}4d`, color }}
        >
          {secondaryAction.label}
        </Link>
      </div>

      <div
        className="mt-5 rounded-2xl px-4 py-3 text-sm"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-mid)' }}
      >
        {footer}
      </div>
    </div>
  )
}

function MetricPanel({ label, value, accent }) {
  return (
    <div
      className="rounded-2xl px-4 py-5"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
    >
      <p className="text-sm font-medium" style={{ color: 'var(--text-mid)' }}>
        {label}
      </p>
      <p className="font-display font-bold text-3xl mt-3" style={{ color: accent }}>
        {value}
      </p>
    </div>
  )
}
