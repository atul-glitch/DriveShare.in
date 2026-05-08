import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { StatusBadge, Avatar } from '../common'

export default function BookingCard({ booking, role = 'renter' }) {
  const { _id, vehicle, owner, renter, scheduledPickupAt, scheduledReturnAt, status, ratePerHour, estimatedHours } = booking

  const other  = role === 'renter' ? owner   : renter
  const otherLabel = role === 'renter' ? 'Owner'  : 'Renter'

  const hours = estimatedHours?.toFixed(1) || '—'
  const est   = ratePerHour && estimatedHours ? `₹${(ratePerHour * estimatedHours).toFixed(0)}` : '—'

  return (
    <Link to={`/bookings/${_id}`}
      className="card card-interactive flex gap-4 p-4 no-underline"
      style={{ textDecoration: 'none' }}>

      {/* Vehicle image */}
      <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--surface2)' }}>
        {vehicle?.images?.[0]
          ? <img src={vehicle.images[0]} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-3xl">🚗</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h4 className="font-display font-semibold text-sm leading-tight">
            {vehicle?.make} {vehicle?.model}
          </h4>
          <StatusBadge status={status} />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2" style={{ color: 'var(--text-mid)' }}>
          <span className="flex items-center gap-1.5">
            <Calendar size={11} />
            {format(new Date(scheduledPickupAt), 'dd MMM, hh:mm a')}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={11} />
            {hours} hrs
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={11} />
            {booking.pickupLocation?.address?.city || '—'}
          </span>
          <span className="font-semibold" style={{ color: 'var(--accent)' }}>{est}</span>
        </div>

        {/* Other party */}
        {other && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-mid)' }}>
            <Avatar src={other.avatar} name={other.fullName} size={18} />
            <span>{otherLabel}: {other.fullName}</span>
          </div>
        )}
      </div>

      <ChevronRight size={16} className="self-center flex-shrink-0" style={{ color: 'var(--text-dim)' }} />
    </Link>
  )
}
