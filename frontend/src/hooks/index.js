import { useState, useEffect, useCallback } from 'react'
import { vehicleAPI, bookingAPI, messageAPI } from '../services/api'
import toast from 'react-hot-toast'

// ── useVehicles ───────────────────────────────────────────────────────────────
export function useVehicles(initialFilters = {}) {
  const [vehicles,   setVehicles]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [filters,    setFilters]    = useState(initialFilters)

  const fetch = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 12, ...filters }
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
  }, [filters])

  useEffect(() => { fetch(1) }, [fetch])

  return { vehicles, loading, page, totalPages, total, filters, setFilters, fetch, setPage }
}

// ── useBooking ────────────────────────────────────────────────────────────────
export function useBooking(id) {
  const [booking,  setBooking]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const refresh = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const { data } = await bookingAPI.getById(id)
      setBooking(data.data)
      setError(null)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { refresh() }, [refresh])
  return { booking, loading, error, refresh }
}

// ── useUnreadMessages ─────────────────────────────────────────────────────────
export function useUnreadMessages(pollInterval = 30000) {
  const [count, setCount] = useState(0)

  const fetch = useCallback(async () => {
    try {
      const { data } = await messageAPI.unreadCount()
      setCount(data.data.unreadCount)
    } catch {}
  }, [])

  useEffect(() => {
    fetch()
    const id = setInterval(fetch, pollInterval)
    return () => clearInterval(id)
  }, [fetch, pollInterval])

  return count
}

// ── usePagination ─────────────────────────────────────────────────────────────
export function usePagination(totalItems, itemsPerPage = 10) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const next     = () => setPage(p => Math.min(p + 1, totalPages))
  const prev     = () => setPage(p => Math.max(p - 1, 1))
  const goTo     = (p) => setPage(Math.max(1, Math.min(p, totalPages)))
  const reset    = () => setPage(1)

  return { page, totalPages, next, prev, goTo, reset, isFirst: page === 1, isLast: page === totalPages }
}

// ── useLocalStorage ───────────────────────────────────────────────────────────
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const set = (newVal) => {
    try {
      const v = typeof newVal === 'function' ? newVal(value) : newVal
      setValue(v)
      localStorage.setItem(key, JSON.stringify(v))
    } catch {}
  }

  return [value, set]
}

// ── useDebounce ───────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
