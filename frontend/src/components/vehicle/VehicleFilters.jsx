import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

const CATEGORIES   = ['hatchback','sedan','suv','muv','bike','scooter','truck','van']
const FUEL_TYPES   = ['petrol','diesel','electric','cng','hybrid']
const TRANSMISSIONS = ['manual','automatic','amt']

export default function VehicleFilters({ filters, onChange, onReset }) {
  const [open, setOpen] = useState(false)

  const set = (key, value) => onChange({ ...filters, [key]: value })

  const activeCount = [filters.category, filters.fuelType, filters.transmission,
    filters.minSeats, filters.maxRate].filter(Boolean).length

  return (
    <div>
      {/* Search + Filter toggle bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
          <input
            className="input pl-9"
            placeholder="Search make, model, city…"
            value={filters.search || ''}
            onChange={e => set('search', e.target.value)}
          />
        </div>
        <button
          onClick={() => setOpen(p => !p)}
          className={`btn btn-outline gap-2 flex-shrink-0 ${activeCount > 0 ? 'border-[var(--accent)] text-[var(--accent)]' : ''}`}>
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
              style={{ background: 'var(--accent)', color: '#fff' }}>{activeCount}</span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={onReset} className="btn btn-ghost btn-sm px-2 flex-shrink-0">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {open && (
        <div className="card p-5 mb-4 animate-fade-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">

            {/* Category */}
            <div className="space-y-1.5">
              <label className="label">Category</label>
              <select className="input" value={filters.category || ''} onChange={e => set('category', e.target.value)}>
                <option value="">All</option>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>

            {/* Fuel type */}
            <div className="space-y-1.5">
              <label className="label">Fuel</label>
              <select className="input" value={filters.fuelType || ''} onChange={e => set('fuelType', e.target.value)}>
                <option value="">All</option>
                {FUEL_TYPES.map(f => <option key={f} value={f} className="capitalize">{f}</option>)}
              </select>
            </div>

            {/* Transmission */}
            <div className="space-y-1.5">
              <label className="label">Transmission</label>
              <select className="input" value={filters.transmission || ''} onChange={e => set('transmission', e.target.value)}>
                <option value="">All</option>
                {TRANSMISSIONS.map(t => <option key={t} value={t} className="uppercase">{t}</option>)}
              </select>
            </div>

            {/* Min seats */}
            <div className="space-y-1.5">
              <label className="label">Min Seats</label>
              <input type="number" className="input" min={1} max={50}
                placeholder="e.g. 4"
                value={filters.minSeats || ''}
                onChange={e => set('minSeats', e.target.value)} />
            </div>

            {/* Max rate */}
            <div className="space-y-1.5">
              <label className="label">Max ₹/hr</label>
              <input type="number" className="input" min={0}
                placeholder="e.g. 500"
                value={filters.maxRate || ''}
                onChange={e => set('maxRate', e.target.value)} />
            </div>
          </div>

          {/* Sort row */}
          <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="space-y-1.5">
              <label className="label">Sort by</label>
              <select className="input w-40" value={filters.sortBy || 'createdAt'} onChange={e => set('sortBy', e.target.value)}>
                <option value="createdAt">Newest</option>
                <option value="ratePerHour">Price</option>
                <option value="averageRating">Rating</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="label">Order</label>
              <select className="input w-32" value={filters.order || 'desc'} onChange={e => set('order', e.target.value)}>
                <option value="desc">High → Low</option>
                <option value="asc">Low → High</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
