import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Trash2, Eye, Search, Filter, ToggleRight, X } from 'lucide-react'
import { adminAPI } from '../services/api'
import { EmptyState, Spinner, StatusBadge } from '../components/common'
import AdminShell from '../components/common/AdminShell'

const getPricePerDay = (vehicle) => {
  const directPrice = Number(vehicle?.pricePerDay)
  if (Number.isFinite(directPrice) && directPrice > 0) return directPrice

  const hourlyRate = Number(vehicle?.ratePerHour)
  if (Number.isFinite(hourlyRate) && hourlyRate >= 0) return hourlyRate * 24

  return null
}

const formatCurrency = (amount) => (
  amount === null ? '-' : `₹ ${amount.toLocaleString('en-IN')}`
)

export function AdminVehicles() {
  const [searchParams] = useSearchParams()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  const fetchVehicles = async (p = 1, st = status, s = search) => {
    setLoading(true)
    try {
      const response = await adminAPI.getAllVehicles({
        page: p,
        limit: 10,
        ...(st && { status: st }),
        ...(s && { search: s }),
      })
      setVehicles(response.data.data.vehicles)
      setPagination(response.data.data.pagination)
      setPage(p)
      setError('')
    } catch {
      setError('Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles(1, status, search)
  }, [status, search])

  const handleToggleStatus = async (vehicleId) => {
    setActionLoading(true)
    try {
      await adminAPI.toggleVehicleStatus(vehicleId)
      await fetchVehicles(page, status, search)
      setShowModal(false)
      alert('Vehicle status updated successfully')
    } catch {
      alert('Failed to toggle vehicle status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteVehicle = async (vehicleId) => {
    if (!deleteReason.trim()) {
      alert('Please provide a reason for deletion')
      return
    }

    if (!window.confirm('Are you sure you want to delete this vehicle?')) return

    setActionLoading(true)
    try {
      await adminAPI.deleteVehicle(vehicleId, { reason: deleteReason })
      await fetchVehicles(page, status, search)
      setShowModal(false)
      setDeleteReason('')
      alert('Vehicle deleted successfully')
    } catch {
      alert('Failed to delete vehicle')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <AdminShell
      title="Vehicle Management"
      subtitle="Inspect listed vehicles, control listing visibility, and remove entries that should not remain on the platform."
    >
      <div className="card p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="label">Search Listings</label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-dim)' }}
              />
              <input
                type="text"
                placeholder="Search by title, brand, or model..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="label">Listing Status</label>
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--text-dim)' }}
              />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
                className="input pl-10 appearance-none"
              >
                <option value="">All Vehicles</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

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

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
                Loading vehicles...
              </p>
            </div>
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No vehicles found"
            description="Try switching the status filter or widening the search term."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px]">
                <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                      Owner
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                      Brand
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                      Price / Day
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle, index) => (
                    <tr
                      key={vehicle._id}
                      className="hover:bg-[var(--surface2)] transition-colors"
                      style={index !== vehicles.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium">{vehicle.title}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
                          {vehicle.licensePlate}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">{vehicle.owner?.fullName}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
                          {vehicle.owner?.email}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-mid)' }}>
                        {vehicle.brand} {vehicle.model}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {formatCurrency(getPricePerDay(vehicle))}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={vehicle.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedVehicle(vehicle)
                            setShowModal(true)
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--accent)' }}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
              style={{ borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
                Page {pagination.page} of {pagination.pages} (Total: {pagination.total})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchVehicles(page - 1, status, search)}
                  disabled={page === 1}
                  className="btn btn-outline btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchVehicles(page + 1, status, search)}
                  disabled={page === pagination.pages}
                  className="btn btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && selectedVehicle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setShowModal(false)
              setDeleteReason('')
            }}
          />

          <div
            className="relative card w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div
              className="sticky top-0 px-6 py-4 flex justify-between items-center"
              style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <h2 className="font-display text-2xl font-semibold">Vehicle Details</h2>
                <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
                  Review listing data and take administrative action.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setDeleteReason('')
                }}
                className="btn btn-ghost btn-sm p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              <section className="space-y-4">
                <div>
                  <h3 className="font-display text-xl font-semibold">Vehicle Information</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
                    Core metadata entered by the vehicle owner.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard label="Title" value={selectedVehicle.title} />
                  <InfoCard label="License Plate" value={selectedVehicle.licensePlate} />
                  <InfoCard label="Brand and Model" value={`${selectedVehicle.brand} ${selectedVehicle.model}`} />
                  <InfoCard label="Year" value={selectedVehicle.year} />
                  <InfoCard label="Price Per Day" value={formatCurrency(getPricePerDay(selectedVehicle))} />
                  <InfoCard label="Mileage" value={`${selectedVehicle.mileage} km`} />
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="font-display text-xl font-semibold">Owner Information</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
                    Owner account currently associated with this vehicle.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard label="Name" value={selectedVehicle.owner?.fullName} />
                  <InfoCard label="Email" value={selectedVehicle.owner?.email} />
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="font-display text-xl font-semibold">Listing Status</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
                    Current visibility and availability state for this listing.
                  </p>
                </div>
                <StatusBadge status={selectedVehicle.status} />
              </section>

              <section className="space-y-4" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <button
                  onClick={() => handleToggleStatus(selectedVehicle._id)}
                  disabled={actionLoading}
                  className="btn btn-outline w-full"
                  style={{ borderColor: 'rgba(56,189,248,0.35)', color: '#38bdf8' }}
                >
                  <ToggleRight className="w-4 h-4" />
                  {actionLoading
                    ? 'Processing...'
                    : `Mark as ${selectedVehicle.status === 'active' ? 'Inactive' : 'Active'}`}
                </button>

                <div
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)' }}
                >
                  <p className="text-sm font-medium mb-3" style={{ color: '#fca5a5' }}>
                    Delete This Vehicle
                  </p>
                  <textarea
                    placeholder="Enter reason for deletion (required)..."
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="input min-h-[110px] mb-3"
                    style={{ borderColor: 'rgba(239,68,68,0.25)' }}
                  />
                  <button
                    onClick={() => handleDeleteVehicle(selectedVehicle._id)}
                    disabled={actionLoading || !deleteReason.trim()}
                    className="btn btn-danger w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                    {actionLoading ? 'Deleting...' : 'Delete Vehicle'}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
        {label}
      </p>
      <p className="font-medium mt-2 break-words">{value || '-'}</p>
    </div>
  )
}
