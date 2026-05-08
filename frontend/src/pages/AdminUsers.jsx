import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, X, Eye, Search, Filter } from 'lucide-react'
import { adminAPI } from '../services/api'
import { EmptyState, Spinner, StatusBadge } from '../components/common'
import AdminShell from '../components/common/AdminShell'

export function AdminUsers() {
  const [searchParams] = useSearchParams()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [isVerified, setIsVerified] = useState(searchParams.get('verified') || '')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const fetchUsers = async (p = 1, v = isVerified, s = search) => {
    setLoading(true)
    try {
      const response = await adminAPI.getAllUsers({
        page: p,
        limit: 10,
        ...(v && { isVerified: v === 'true' ? 'true' : 'false' }),
        ...(s && { search: s }),
      })
      setUsers(response.data.data.users)
      setPagination(response.data.data.pagination)
      setPage(p)
      setError('')
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1, isVerified, search)
  }, [isVerified, search])

  const openUserDetails = async (userId) => {
    setShowModal(true)
    setSelectedUser(null)
    setDetailsLoading(true)

    try {
      const response = await adminAPI.getUserDetails(userId)
      setSelectedUser(response.data.data)
      setError('')
    } catch (err) {
      setShowModal(false)
      setError(err.response?.data?.message || 'Failed to load user details')
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleVerify = async (userId) => {
    setActionLoading(true)
    try {
      await adminAPI.verifyUser(userId)
      await fetchUsers(page, isVerified, search)
      setShowModal(false)
      alert('User verified successfully')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (userId) => {
    setActionLoading(true)
    try {
      await adminAPI.rejectUser(userId)
      await fetchUsers(page, isVerified, search)
      setShowModal(false)
      alert('User rejected successfully')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return

    setActionLoading(true)
    try {
      await adminAPI.deactivateUser(userId)
      await fetchUsers(page, isVerified, search)
      setShowModal(false)
      alert('User deactivated successfully')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate user')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <AdminShell
      title="User Management"
      subtitle="Search user accounts, review uploaded KYC documents, and approve or reject verification from one place."
    >
      <div className="card p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="label">Search Users</label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-dim)' }}
              />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="label">Verification Status</label>
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--text-dim)' }}
              />
              <select
                value={isVerified}
                onChange={(e) => setIsVerified(e.target.value)}
                className="input pl-10 appearance-none"
              >
                <option value="">All Users</option>
                <option value="true">Verified</option>
                <option value="false">Pending Verification</option>
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
                Loading users...
              </p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No users found"
            description="Try changing the verification filter or search keyword."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-dim)' }}>
                      Phone
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
                  {users.map((user, index) => (
                    <tr
                      key={user._id}
                      className="hover:bg-[var(--surface2)] transition-colors"
                      style={index !== users.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium">{user.fullName}</p>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-mid)' }}>
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-mid)' }}>
                        {user.phone}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.isVerified ? 'verified' : 'pending'} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openUserDetails(user._id)}
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
                  onClick={() => fetchUsers(page - 1, isVerified, search)}
                  disabled={page === 1}
                  className="btn btn-outline btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchUsers(page + 1, isVerified, search)}
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

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          <div
            className="relative card w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div
              className="sticky top-0 px-6 py-4 flex justify-between items-center"
              style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <h2 className="font-display text-2xl font-semibold">User Details</h2>
                <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
                  Review identity, KYC uploads, and account status.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedUser(null)
                }}
                className="btn btn-ghost btn-sm p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="p-10 flex items-center justify-center">
                <div className="text-center">
                  <Spinner size="lg" className="mx-auto mb-4" />
                  <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
                    Loading user details...
                  </p>
                </div>
              </div>
            ) : selectedUser ? (
              <div className="p-6 space-y-8">
                <section className="space-y-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold">Personal Information</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
                      Core details used for account identification.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard label="Full Name" value={selectedUser.fullName} />
                    <InfoCard label="Email" value={selectedUser.email} />
                    <InfoCard label="Phone" value={selectedUser.phone} />
                    <InfoCard label="Role" value={selectedUser.role?.join(', ')} />
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold">Status</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
                      Verification and account access state.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      label="Verification Status"
                      value={<StatusBadge status={selectedUser.isVerified ? 'verified' : 'pending'} />}
                    />
                    <InfoCard
                      label="Account Status"
                      value={<StatusBadge status={selectedUser.isActive ? 'active' : 'inactive'} />}
                    />
                  </div>
                </section>

                <DocumentSection
                  title="Driving Licence"
                  numberLabel="Licence Number"
                  numberValue={selectedUser.drivingLicence?.licenceNumber}
                  doc={selectedUser.drivingLicence}
                  extraFields={[
                    {
                      label: 'Expiry Date',
                      value: selectedUser.drivingLicence?.expiryDate
                        ? new Date(selectedUser.drivingLicence.expiryDate).toLocaleDateString()
                        : '',
                    },
                    {
                      label: 'Verification Status',
                      value: (
                        <StatusBadge
                          status={selectedUser.drivingLicence?.verificationStatus || 'pending'}
                        />
                      ),
                    },
                  ]}
                />

                <DocumentSection
                  title="Aadhaar Card"
                  numberLabel="Aadhaar Number"
                  numberValue={selectedUser.aadhar?.aadharNumber}
                  doc={selectedUser.aadhar}
                  extraFields={[
                    { label: 'Name on Aadhaar', value: selectedUser.aadhar?.nameOnAadhar },
                    {
                      label: 'Verification Status',
                      value: <StatusBadge status={selectedUser.aadhar?.verificationStatus || 'pending'} />,
                    },
                  ]}
                />

                {!selectedUser.isVerified ? (
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}
                  >
                    <p className="text-sm font-medium mb-4" style={{ color: '#7dd3fc' }}>
                      This user is pending verification. Choose an action:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleVerify(selectedUser._id)}
                        disabled={actionLoading}
                        className="btn btn-primary flex-1"
                      >
                        <Check className="w-4 h-4" />
                        {actionLoading ? 'Processing...' : 'Verify User'}
                      </button>
                      <button
                        onClick={() => handleReject(selectedUser._id)}
                        disabled={actionLoading}
                        className="btn btn-danger flex-1"
                      >
                        <X className="w-4 h-4" />
                        {actionLoading ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ) : null}

                {selectedUser.isActive ? (
                  <button
                    onClick={() => handleDeactivate(selectedUser._id)}
                    disabled={actionLoading}
                    className="btn btn-danger w-full"
                  >
                    {actionLoading ? 'Processing...' : 'Deactivate Account'}
                  </button>
                ) : null}
              </div>
            ) : null}
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
      <div className="mt-2 font-medium break-words">
        {value || <span style={{ color: 'var(--text-mid)' }}>-</span>}
      </div>
    </div>
  )
}

function DocumentSection({ title, numberLabel, numberValue, doc, extraFields = [] }) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-mid)' }}>
          Uploaded identity records and verification state.
        </p>
      </div>

      {!doc ? (
        <div
          className="rounded-2xl px-4 py-5 text-sm"
          style={{ border: '1px dashed var(--border-light)', color: 'var(--text-mid)', background: 'var(--surface2)' }}
        >
          Document not uploaded
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard label={numberLabel} value={numberValue} />
            {extraFields.map((field) => (
              <InfoCard key={field.label} label={field.label} value={field.value} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentImageCard title="Front Image" src={doc.frontImage} />
            <DocumentImageCard title="Back Image" src={doc.backImage} />
          </div>
        </div>
      )}
    </section>
  )
}

function DocumentImageCard({ title, src }) {
  return (
    <div className="card overflow-hidden">
      <div
        className="px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}
      >
        <p className="text-sm font-medium">{title}</p>
      </div>
      {src ? (
        <a href={src} target="_blank" rel="noreferrer" className="block" style={{ background: 'var(--surface2)' }}>
          <img src={src} alt={title} className="w-full h-64 object-contain" style={{ background: 'var(--surface)' }} />
        </a>
      ) : (
        <div className="h-64 flex items-center justify-center text-sm" style={{ color: 'var(--text-mid)', background: 'var(--surface2)' }}>
          Image unavailable
        </div>
      )}
    </div>
  )
}
