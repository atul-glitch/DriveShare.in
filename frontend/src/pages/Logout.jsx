import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Logout() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        navigate('/')
      }
    }
    performLogout()
  }, [logout, navigate])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  )
}
