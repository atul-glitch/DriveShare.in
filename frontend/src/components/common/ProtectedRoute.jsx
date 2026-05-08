import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from './index'

// Redirect to /login if not authenticated
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

// Redirect to /dashboard if already authenticated
export function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user)    return <Navigate to="/dashboard" replace />
  return children
}

// Require a specific role
export function RoleRoute({ children, role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />

  const hasRole = Array.isArray(role)
    ? role.some(r => user.role?.includes(r))
    : user.role?.includes(role)

  if (!hasRole) return <Navigate to="/dashboard" replace />
  return children
}

// Require verified KYC
export function VerifiedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!user?.isVerified) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="font-display text-2xl font-bold mb-2">KYC Required</h2>
        <p className="mb-6" style={{ color: 'var(--text-mid)' }}>
          Your documents are under review. You'll be able to access this feature once verified (within 24 hours).
        </p>
      </div>
    )
  }
  return children
}
