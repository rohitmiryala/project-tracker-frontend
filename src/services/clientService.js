import { apiRequest } from '@/lib/apiClient'

export const clientService = {
  list: () => apiRequest('/clients', { auth: true }),
  getById: (id) => apiRequest(`/clients/${id}`, { auth: true }),
  create: (payload) => apiRequest('/clients', { method: 'POST', body: payload, auth: true }),
  update: (id, payload) => apiRequest(`/clients/${id}`, { method: 'PATCH', body: payload, auth: true }),
  remove: (id) => apiRequest(`/clients/${id}`, { method: 'DELETE', auth: true }),
}
