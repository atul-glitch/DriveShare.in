import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
})

// Attach access token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post('/api/v1/auth/refresh-token', {}, { withCredentials: true })
        localStorage.setItem('accessToken', data.data.accessToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)
      } catch {
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (formData) => api.post('/auth/register', formData),
  login:    (data)     => api.post('/auth/login', data),
  logout:   ()         => api.post('/auth/logout'),
  me:       ()         => api.get('/auth/me'),
  changePassword: (data) => api.patch('/auth/change-password', data),
  refreshToken:   ()     => api.post('/auth/refresh-token'),
}

// ── Vehicles ──────────────────────────────────────────────────────────────────
export const vehicleAPI = {
  getAll:       (params) => api.get('/vehicles', { params }),
  getById:      (id)     => api.get(`/vehicles/${id}`),
  getMyListings:()       => api.get('/vehicles/my-listings'),
  create:       (data)   => api.post('/vehicles', data),
  update:       (id, data) => api.patch(`/vehicles/${id}`, data),
  delete:       (id)     => api.delete(`/vehicles/${id}`),
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingAPI = {
  create:         (data) => api.post('/bookings', data),
  getById:        (id)   => api.get(`/bookings/${id}`),
  getMyBookings:  (params) => api.get('/bookings/my-bookings', { params }),
  getOwnerBookings:(params)=> api.get('/bookings/owner-bookings', { params }),
  confirm:        (id)   => api.patch(`/bookings/${id}/confirm`),
  markPickup:     (id)   => api.patch(`/bookings/${id}/pickup`),
  markReturn:     (id, data) => api.patch(`/bookings/${id}/return`, data),
  cancel:         (id, data) => api.patch(`/bookings/${id}/cancel`, data),
}

// ── Messages ──────────────────────────────────────────────────────────────────
export const messageAPI = {
  send:         (data)      => api.post('/messages', data),
  getByBooking: (bookingId, params) => api.get(`/messages/${bookingId}`, { params }),
  delete:       (id)        => api.delete(`/messages/${id}`),
  unreadCount:  ()          => api.get('/messages/unread-count'),
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewAPI = {
  create:          (data) => api.post('/reviews', data),
  replyToReview:   (id, data) => api.patch(`/reviews/${id}/reply`, data),
  getVehicleReviews:(vehicleId, params) => api.get(`/reviews/vehicle/${vehicleId}`, { params }),
  getUserReviews:  (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
}

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  initiate:      (bookingId) => api.post(`/payments/${bookingId}/initiate`),
  verify:        (bookingId, data) => api.post(`/payments/${bookingId}/verify`, data),
  mockVerify:    (bookingId) => api.post(`/payments/${bookingId}/mock-verify`),
  getByBooking:  (bookingId) => api.get(`/payments/${bookingId}`),
  getMyEarnings: (params)   => api.get('/payments/my-earnings', { params }),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  login:                (data) => api.post('/admin/login', data),
  logout:               ()     => api.post('/admin/logout'),
  getStatistics:        ()     => api.get('/admin/statistics'),
  getAllUsers:          (params) => api.get('/admin/users', { params }),
  getUserDetails:       (userId) => api.get(`/admin/users/${userId}`),
  verifyUser:           (userId) => api.patch(`/admin/users/${userId}/verify`),
  rejectUser:           (userId, data) => api.patch(`/admin/users/${userId}/reject`, data),
  deactivateUser:       (userId) => api.patch(`/admin/users/${userId}/deactivate`),
  getAllVehicles:       (params) => api.get('/admin/vehicles', { params }),
  getVehicleDetails:    (vehicleId) => api.get(`/admin/vehicles/${vehicleId}`),
  toggleVehicleStatus:  (vehicleId) => api.patch(`/admin/vehicles/${vehicleId}/toggle-status`),
  deleteVehicle:        (vehicleId, data) => api.delete(`/admin/vehicles/${vehicleId}`, { data }),
  updateProfile:        (data) => api.patch('/admin/profile', data),
  changePassword:       (data) => api.patch('/admin/change-password', data),
}

export default api
