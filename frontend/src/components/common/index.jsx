import { AlertTriangle, X } from 'lucide-react'

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Loading…</p>
      </div>
    </div>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
  available:  { cls: 'badge-ffc',    label: 'Available'  },
  booked:     { cls: 'badge-orange', label: 'Booked'     },
  maintenance:{ cls: 'badge-yellow', label: 'Maintenance' },
  inactive:   { cls: 'badge-gray',   label: 'Inactive'   },
  unavailable: { cls: 'badge-ffc',   label: 'Unavailable' },
  pending:    { cls: 'badge-yellow', label: 'Pending'    },
  confirmed:  { cls: 'badge-blue',   label: 'Confirmed'  },
  active:     { cls: 'badge-green',  label: 'Active'     },
  completed:  { cls: 'badge-gray',   label: 'Completed'  },
  cancelled:  { cls: 'badge-red',    label: 'Cancelled'  },
  disputed:   { cls: 'badge-red',    label: 'Disputed'   },
  verified:   { cls: 'badge-green',  label: 'Verified'   },
  rejected:   { cls: 'badge-red',    label: 'Rejected'   },
  paid:       { cls: 'badge-green',  label: 'Paid'       },
  refunded:   { cls: 'badge-blue',   label: 'Refunded'   },
  failed:     { cls: 'badge-red',    label: 'Failed'     },
}

export function StatusBadge({ status, onImage = false }) {
  const s = STATUS_MAP[status] || { cls: 'badge-gray', label: status }
  const DOT_COLOR = {
    'badge-green': 'var(--accent-500)',
    'badge-orange': '#f97316',
    'badge-yellow': '#f59e0b',
    'badge-blue': '#38bdf8',
    'badge-red': '#ef4444',
    'badge-gray': 'rgba(0,0,0,0.6)',
    'badge-ffc': '#04120a'
  }

  const dotStyle = onImage ? { background: DOT_COLOR[s.cls] || 'var(--text-dim)' } : undefined
  const classes = `badge ${s.cls} ${onImage ? 'badge-on-image' : ''}`

  return (
    <span className={classes}>
      <span className="w-1.5 h-1.5 rounded-full" style={dotStyle} />
      {s.label}
    </span>
  )
}

// ── Star Rating ───────────────────────────────────────────────────────────────
export function StarRating({ value = 0, max = 5, size = 16, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          width={size} height={size} viewBox="0 0 24 24" fill="none"
          className={interactive ? 'cursor-pointer' : ''}
          onClick={() => interactive && onChange?.(i + 1)}
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i < value ? '#f97316' : 'transparent'}
            stroke={i < value ? '#f97316' : 'var(--border-light)'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <Icon size={28} style={{ color: 'var(--text-dim)' }} />
        </div>
      )}
      <h3 className="text-lg font-display font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm mb-6" style={{ color: 'var(--text-mid)' }}>{description}</p>}
      {action}
    </div>
  )
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
export function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative card p-6 w-full max-w-sm animate-fade-up">
        <button onClick={onCancel} className="absolute top-4 right-4 btn btn-ghost btn-sm p-1.5">
          <X size={16} />
        </button>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: danger ? 'rgba(239,68,68,0.12)' : 'var(--accent-dim)' }}>
            <AlertTriangle size={20} style={{ color: danger ? '#ef4444' : 'var(--accent)' }} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base mb-1">{title}</h3>
            <p className="text-sm" style={{ color: 'var(--text-mid)' }}>{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}  className="btn btn-outline flex-1">Cancel</button>
          <button onClick={onConfirm} className={`btn flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
export function VehicleCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-6 w-16" />
          <div className="skeleton h-6 w-16" />
        </div>
        <div className="skeleton h-9 w-full mt-2" />
      </div>
    </div>
  )
}

// ── Form Field wrapper ────────────────────────────────────────────────────────
export function FormField({ label, error, children, required }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="label">
          {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ src, name = '', size = 36 }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0"
    style={{ width: size, height: size }} />
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold"
      style={{ width: size, height: size, background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: size * 0.35 }}>
      {initials || '?'}
    </div>
  )
}
