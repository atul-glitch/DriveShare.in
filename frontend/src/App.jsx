import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { PublicLayout, DashboardLayout, AuthLayout } from './components/common/Layout'

// Pages
import Home          from './pages/Home'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Vehicles      from './pages/Vehicles'
import VehicleDetail from './pages/VehicleDetail'
import { Dashboard, Bookings, Earnings } from './pages/Dashboard'
import BookingDetail from './pages/BookingDetail'
import PaymentPage from './pages/Payment'
import { MyVehicles, ListVehicle } from './pages/MyVehicles'
import Profile       from './pages/Profile'
import { Logout } from './pages/Logout'
import { AdminLogin } from './pages/AdminLogin'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminUsers } from './pages/AdminUsers'
import { AdminVehicles } from './pages/AdminVehicles'

// Protected Admin Route
function AdminRoute({ element }) {
  const { admin } = useAuth()
  return admin ? element : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminRoute element={<AdminDashboard />} />} />
      <Route path="/admin/users" element={<AdminRoute element={<AdminUsers />} />} />
      <Route path="/admin/vehicles" element={<AdminRoute element={<AdminVehicles />} />} />

      {/* Logout */}
      <Route path="/logout" element={<Logout />} />

      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/"         element={<Home />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Route>

      {/* Auth (redirect if already logged in) */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/profile"        element={<Profile />} />
        <Route path="/settings"       element={<Profile />} />
        <Route path="/bookings"       element={<Bookings ownerView={false} />} />
        <Route path="/bookings/:id"   element={<BookingDetail />} />
        <Route path="/payments/:id"   element={<PaymentPage />} />
        <Route path="/owner-bookings" element={<Bookings ownerView={true} />} />
        <Route path="/my-vehicles"    element={<MyVehicles />} />
        <Route path="/vehicles/new"   element={<ListVehicle />} />
        <Route path="/earnings"       element={<Earnings />} />
        <Route path="/messages"       element={<MessagesPage />} />
        <Route path="/reviews"        element={<ReviewsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Lightweight placeholder pages
function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="section-tag justify-center">Guide</div>
      <h1 className="font-display text-4xl font-bold mb-4">How DriveShare Works</h1>
      <p style={{ color: 'var(--text-mid)' }}>
        DriveShare connects vehicle owners with renters in a safe, verified peer-to-peer marketplace.
        Browse, book, pay — all in one place.
      </p>
    </div>
  )
}

function MessagesPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Messages</h1>
      <p style={{ color: 'var(--text-mid)' }}>
        Messages are tied to individual bookings. Open a booking to chat with the owner or renter.
      </p>
    </div>
  )
}

function ReviewsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Reviews</h1>
      <p style={{ color: 'var(--text-mid)' }}>
        After completing a trip, you can leave a review from the booking detail page.
      </p>
    </div>
  )
}
