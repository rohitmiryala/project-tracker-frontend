import { apiRequest } from '@/lib/apiClient'

const queryString = (query = {}) => {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') params.set(key, value)
  })
  const value = params.toString()
  return value ? `?${value}` : ''
}

export const userService = {
  list: (query) => apiRequest(`/users${queryString(query)}`, { auth: true }),
  get: (id) => apiRequest(`/users/${id}`, { auth: true }),
  permissionCatalog: () => apiRequest('/users/permissions/catalog', { auth: true }),
  employmentOptions: () => apiRequest('/users/options', { auth: true }),
  create: (payload) => apiRequest('/users', { method: 'POST', body: payload, auth: true }),
  bulkCreate: (users) => apiRequest('/users/bulk', { method: 'POST', body: { users }, auth: true }),
  update: (id, payload) => apiRequest(`/users/${id}`, { method: 'PATCH', body: payload, auth: true }),
  resendInvite: (id) => apiRequest(`/users/${id}/resend-invite`, { method: 'POST', auth: true }),
}
