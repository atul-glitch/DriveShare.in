import { Link } from 'react-router-dom'
import { MapPin, Fuel, Users, Gauge, Star, Zap } from 'lucide-react'
import { StatusBadge } from '../common'

const FUEL_ICON = { electric: Zap }

export default function VehicleCard({ vehicle }) {
  const {
    _id, make, model, year, images, category, fuelType,
    seats, mileage, ratePerHour, averageRating, totalReviews,
    currentLocation, status
  } = vehicle

  const FuelIcon = FUEL_ICON[fuelType] || Fuel

  return (
    <Link to={`/vehicles/${_id}`}
      className="card card-interactive block overflow-hidden group"
      style={{ textDecoration: 'none' }}>

      {/* Image */}
      <div className="relative h-48 overflow-hidden" style={{ background: 'var(--surface2)' }}>
        {images?.[0] ? (
          <img src={images[0]} alt={`${make} ${model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ color: 'var(--text-dim)', fontSize: 48 }}>🚗</span>
          </div>
        )}
        {/* Overlay chips */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="badge badge-gray capitalize">{category}</span>
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={status} onImage />
        </div>
        {/* Rating pill */}
        {totalReviews > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <Star size={11} fill="#f97316" stroke="#f97316" />
            <span>{averageRating?.toFixed(1)}</span>
            <span style={{ color: 'var(--text-dim)' }}>({totalReviews})</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-semibold text-base leading-tight">
            {make} {model}
          </h3>
          <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: 'var(--text-dim)' }}>{year}</span>
        </div>

        {/* Location */}
        {currentLocation?.address?.city && (
          <div className="flex items-center gap-1 mb-3 text-xs" style={{ color: 'var(--text-mid)' }}>
            <MapPin size={11} />
            <span>{currentLocation.address.city}, {currentLocation.address.state}</span>
          </div>
        )}

        {/* Specs row */}
        <div className="flex items-center gap-3 mb-4">
          <SpecChip icon={FuelIcon} label={fuelType} />
          <SpecChip icon={Users}    label={`${seats} seats`} />
          <SpecChip icon={Gauge}    label={`${mileage} km/l`} />
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div>
            <span className="font-display font-bold text-lg" style={{ color: 'var(--accent)' }}>
              ₹{ratePerHour}
            </span>
            <span className="text-xs ml-1" style={{ color: 'var(--text-dim)' }}>/hr</span>
          </div>
          <span className="btn btn-primary btn-sm">Book Now</span>
        </div>
      </div>
    </Link>
  )
}

function SpecChip({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-mid)' }}>
      <Icon size={12} />
      <span className="capitalize">{label}</span>
    </div>
  )
}
