import { apiRequest } from '@/lib/apiClient'

const withQuery = (path, params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '' && value !== 'all') search.set(key, String(value))
  })
  const qs = search.toString()
  return qs ? `${path}?${qs}` : path
}

export const projectService = {
  list: (params) => apiRequest(withQuery('/project', params), { auth: true }),
  getById: (id) => apiRequest(`/project/${id}`, { auth: true }),
  create: (payload) => apiRequest('/project', { method: 'POST', body: payload, auth: true }),
  update: (id, payload) => apiRequest(`/project/${id}`, { method: 'PATCH', body: payload, auth: true }),
  archive: (id) => apiRequest(`/project/${id}/archive`, { method: 'PATCH', auth: true }),
  remove: (id) => apiRequest(`/project/${id}`, { method: 'DELETE', auth: true }),
  assignableMembers: () => apiRequest('/project/assignable-members', { auth: true }),
}
