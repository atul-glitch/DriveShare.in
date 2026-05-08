import { useState, useEffect } from 'react'
import { vehicleAPI } from '../services/api'
import VehicleCard from '../components/vehicle/VehicleCard'
import VehicleFilters from '../components/vehicle/VehicleFilters'
import { VehicleCardSkeleton, EmptyState } from '../components/common'
import { Car, ChevronLeft, ChevronRight } from 'lucide-react'

const DEFAULT_FILTERS = { category: '', fuelType: '', transmission: '', minSeats: '', maxRate: '', search: '', sortBy: 'createdAt', order: 'desc' }

export default function Vehicles() {
  const [vehicles, setVehicles]   = useState([])
  const [loading,  setLoading]    = useState(true)
  const [page,     setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,    setTotal]      = useState(0)
  const [filters,  setFilters]    = useState(DEFAULT_FILTERS)

  const fetchVehicles = async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 12, ...filters }
      // Remove empty values
      Object.keys(params).forEach(k => !params[k] && delete params[k])
      const { data } = await vehicleAPI.getAll(params)
      setVehicles(data.data.vehicles)
      setTotal(data.data.pagination.total)
      setTotalPages(data.data.pagination.totalPages)
      setPage(p)
    } catch {
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVehicles(1) }, [filters])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="section-tag">Explore</div>
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-bold">Browse Vehicles</h1>
          {!loading && <p className="text-sm" style={{ color: 'var(--text-mid)' }}>{total} vehicles found</p>}
        </div>
      </div>

      {/* Filters */}
      <VehicleFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles found"
          description="Try adjusting your filters or search term."
          action={<button onClick={() => setFilters(DEFAULT_FILTERS)} className="btn btn-outline">Clear filters</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {vehicles.map(v => <VehicleCard key={v._id} vehicle={v} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            onClick={() => fetchVehicles(page - 1)} disabled={page === 1}
            className="btn btn-outline btn-sm">
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-mono" style={{ color: 'var(--text-mid)' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => fetchVehicles(page + 1)} disabled={page === totalPages}
            className="btn btn-outline btn-sm">
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
