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
  list: (params) => apiRequest(withQuery('/projects', params), { auth: true }),
  getById: (id) => apiRequest(`/projects/${id}`, { auth: true }),
  create: (payload) => apiRequest('/projects', { method: 'POST', body: payload, auth: true }),
  update: (id, payload) => apiRequest(`/projects/${id}`, { method: 'PATCH', body: payload, auth: true }),
  archive: (id, version) => apiRequest(`/projects/${id}/archive`, { method: 'PATCH', body: { version }, auth: true }),
  remove: (id, version) => apiRequest(`/projects/${id}`, { method: 'DELETE', body: { version }, auth: true }),
  assignableMembers: () => apiRequest('/projects/assignable-members', { auth: true }),
}
