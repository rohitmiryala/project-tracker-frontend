import { apiRequest } from '@/lib/apiClient'

const query = (path, params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '' && value !== 'all') search.set(key, String(value))
  })
  return search.size ? `${path}?${search}` : path
}

export const workService = {
  overview: (projectId) => apiRequest(`/projects/${projectId}/overview`, { auth: true }),
  workstreams: (projectId) => apiRequest(`/projects/${projectId}/workstreams`, { auth: true }),
  createWorkstream: (projectId, body) => apiRequest(`/projects/${projectId}/workstreams`, { method: 'POST', body, auth: true }),
  updateWorkstream: (id, body) => apiRequest(`/workstreams/${id}`, { method: 'PATCH', body, auth: true }),
  deliverables: (projectId, params) => apiRequest(query(`/projects/${projectId}/deliverables`, params), { auth: true }),
  createDeliverable: (projectId, body) => apiRequest(`/projects/${projectId}/deliverables`, { method: 'POST', body, auth: true }),
  deliverable: (id) => apiRequest(`/deliverables/${id}`, { auth: true }),
  updateDeliverable: (id, body) => apiRequest(`/deliverables/${id}`, { method: 'PATCH', body, auth: true }),
  tasks: (projectId, params) => apiRequest(query(`/projects/${projectId}/tasks`, params), { auth: true }),
  createTask: (projectId, body) => apiRequest(`/projects/${projectId}/tasks`, { method: 'POST', body, auth: true }),
  updateTask: (id, body) => apiRequest(`/tasks/${id}`, { method: 'PATCH', body, auth: true }),
  cycles: (projectId) => apiRequest(`/projects/${projectId}/cycles`, { auth: true }),
  createCycle: (projectId, body) => apiRequest(`/projects/${projectId}/cycles`, { method: 'POST', body, auth: true }),
  updateCycle: (id, body) => apiRequest(`/cycles/${id}`, { method: 'PATCH', body, auth: true }),
  cycleAction: (id, action, body) => apiRequest(`/cycles/${id}/${action}`, { method: 'POST', body, auth: true }),
  milestones: (projectId) => apiRequest(`/projects/${projectId}/milestones`, { auth: true }),
  createMilestone: (projectId, body) => apiRequest(`/projects/${projectId}/milestones`, { method: 'POST', body, auth: true }),
  issues: (projectId, params) => apiRequest(query(`/projects/${projectId}/issues`, params), { auth: true }),
  createIssue: (projectId, body) => apiRequest(`/projects/${projectId}/issues`, { method: 'POST', body, auth: true }),
  updateIssue: (id, body) => apiRequest(`/issues/${id}`, { method: 'PATCH', body, auth: true }),
  issueToDeliverable: (id, body = {}) => apiRequest(`/issues/${id}/create-deliverable`, { method: 'POST', body, auth: true }),
  logTime: (body) => apiRequest('/time-logs', { method: 'POST', body, auth: true }),
  costs: (projectId) => apiRequest(`/projects/${projectId}/costs`, { auth: true }),
  activity: (projectId) => apiRequest(`/projects/${projectId}/activity`, { auth: true }),
  comments: (params) => apiRequest(query('/comments', params), { auth: true }),
  addComment: (body) => apiRequest('/comments', { method: 'POST', body, auth: true }),
  uploadAttachment: (formData) => apiRequest('/attachments', { method: 'POST', body: formData, auth: true }),
  myWork: () => apiRequest('/my-work', { auth: true }),
  remove: (entityType, id, version) => apiRequest(`/${entityType}/${id}`, { method: 'DELETE', body: { version }, auth: true }),
}
