import { apiRequest } from '@/lib/apiClient'

const queryString = (query = {}) => {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, value)
  })
  const value = params.toString()
  return value ? `?${value}` : ''
}

export const roleService = {
  list: (query) => apiRequest(`/roles${queryString(query)}`, { auth: true }),
  create: (payload) => apiRequest('/roles', { method: 'POST', body: payload, auth: true }),
  update: (id, payload) => apiRequest(`/roles/${id}`, { method: 'PATCH', body: payload, auth: true }),
}
