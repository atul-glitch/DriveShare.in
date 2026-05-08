import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'

// ── Currency ──────────────────────────────────────────────────────────────────
export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

// ── Date helpers ──────────────────────────────────────────────────────────────
export const formatDate = (date, fmt = 'dd MMM yyyy') => format(new Date(date), fmt)

export const formatDateTime = (date) => format(new Date(date), 'dd MMM yyyy, hh:mm a')

export const relativeTime = (date) => formatDistanceToNow(new Date(date), { addSuffix: true })

export const friendlyDate = (date) => {
  const d = new Date(date)
  if (isToday(d))    return `Today, ${format(d, 'hh:mm a')}`
  if (isTomorrow(d)) return `Tomorrow, ${format(d, 'hh:mm a')}`
  return formatDateTime(d)
}

// ── Fare calculation ──────────────────────────────────────────────────────────
export const calculateFare = ({ ratePerHour = 120, pickupAt, returnAt, insuranceFeePerHour = 0, insuranceOpted = false, damageFee = 0 }) => {
  const hours       = Math.max(0, (new Date(returnAt) - new Date(pickupAt)) / 3_600_000)
  const baseFare    = +(ratePerHour * hours).toFixed(2)
  const insuranceFee = insuranceOpted ? +(insuranceFeePerHour * hours).toFixed(2) : 0
  const totalAmount = +(baseFare + insuranceFee + damageFee).toFixed(2)
  return { hours: +hours.toFixed(2), baseFare, insuranceFee, damageFee, totalAmount }
}

// ── Status helpers ────────────────────────────────────────────────────────────
export const STATUS_COLOR = {
  available:  '#22c55e',
  booked:     '#f97316',
  maintenance:'#eab308',
  inactive:   '#64748b',
  pending:    '#eab308',
  confirmed:  '#38bdf8',
  active:     '#22c55e',
  completed:  '#94a3b8',
  cancelled:  '#ef4444',
  disputed:   '#ef4444',
  verified:   '#22c55e',
  rejected:   '#ef4444',
  paid:       '#22c55e',
  refunded:   '#38bdf8',
  failed:     '#ef4444',
}

// ── Truncate text ─────────────────────────────────────────────────────────────
export const truncate = (str, n = 80) => str?.length > n ? str.slice(0, n) + '…' : str

// ── Image fallback ────────────────────────────────────────────────────────────
export const vehiclePlaceholder = '🚗'

// ── Geocode label ─────────────────────────────────────────────────────────────
export const locationLabel = (loc) => {
  if (!loc) return '—'
  const { city, state } = loc.address || {}
  return [city, state].filter(Boolean).join(', ') || '—'
}

// ── Validate Indian phone ─────────────────────────────────────────────────────
export const isValidPhone = (p) => /^[6-9]\d{9}$/.test(p)

// ── File size check (bytes) ───────────────────────────────────────────────────
export const isFileSizeOk = (file, maxMB = 5) => file.size <= maxMB * 1024 * 1024

// ── Class name joiner ─────────────────────────────────────────────────────────
export const cn = (...classes) => classes.filter(Boolean).join(' ')
