import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, adminAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [admin, setAdmin]     = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await authAPI.me()
      setUser(data.data)
    } catch {
      setUser(null)
      localStorage.removeItem('accessToken')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (localStorage.getItem('accessToken')) fetchMe()
    else setLoading(false)
  }, [fetchMe])

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials)
    localStorage.setItem('accessToken', data.data.accessToken)
    setUser(data.data.user)
    return data.data
  }

  const loginAdmin = async (credentials) => {
    const { data } = await adminAPI.login(credentials)
    localStorage.setItem('accessToken', data.data.accessToken)
    localStorage.setItem('adminToken', 'true')
    setAdmin(data.data.admin)
    return data.data
  }

  const logout = async () => {
    try { 
      if (admin) await adminAPI.logout()
      else await authAPI.logout()
    } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('adminToken')
    setUser(null)
    setAdmin(null)
  }

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }))

  const isOwner  = user?.role?.includes('owner')
  const isRenter = user?.role?.includes('renter')
  const isAdmin  = !!admin

  return (
    <AuthContext.Provider value={{ 
      user, 
      admin,
      loading, 
      login, 
      loginAdmin,
      logout, 
      updateUser, 
      isOwner, 
      isRenter,
      isAdmin,
      fetchMe 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
