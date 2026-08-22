import { apiRequest } from '@/lib/apiClient'

export const clientService = {
  list: () => apiRequest('/clients', { auth: true }),
  create: (payload) => apiRequest('/clients', { method: 'POST', body: payload, auth: true }),
}
