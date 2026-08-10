import { apiRequest } from '@/lib/apiClient'

export const plansService = {
  list: () => apiRequest('/payments/plans'),
}
