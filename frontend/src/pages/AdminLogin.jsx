import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/common'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { LogIn } from 'lucide-react'

export function AdminLogin() {
  const navigate = useNavigate()
  const { loginAdmin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await loginAdmin(formData)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="card p-8 animate-fade-up">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <LogIn size={20} color="#fff" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">Admin Access</h1>
                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Control panel login</p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg border" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
                <p style={{ color: '#dc2626' }} className="text-sm">{error}</p>
              </div>
            )}
            

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Login ID */}
              <div>
                <label htmlFor="loginId" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-mid)' }}>
                  Login ID
                </label>
                <input
                  id="loginId"
                  type="text"
                  name="loginId"
                  value={formData.loginId}
                  onChange={handleChange}
                  placeholder="Enter login ID"
                  className="input w-full"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-mid)' }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="input w-full"
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full btn-lg mt-2"
              >
                {loading ? <><Spinner size="sm" /> Logging in…</> : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Login
                  </>
                )}
              </button>
            </form>

            <div className="divider" />

            {/* Info box */}
            {/* <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}> */}
              {/* <p style={{ color: 'var(--accent)' }}>
                <span className="font-semibold">Demo credentials:</span>
                <br />
                Login ID: admin
                <br />
                Password: admin
              </p> */}
            {/* </div> */}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
