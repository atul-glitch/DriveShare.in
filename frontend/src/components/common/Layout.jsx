import { Outlet, Navigate } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from './index'

export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}

export function DashboardLayout() {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user)   return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16 max-w-7xl mx-auto w-full px-4 sm:px-6 gap-6">
        <Sidebar />
        <main className="flex-1 py-6 min-w-0 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function AuthLayout() {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user)    return <Navigate to="/dashboard" replace />
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(249,115,22,0.08) 0%, transparent 70%)'
    }}>
      <Outlet />
    </div>
  )
}
