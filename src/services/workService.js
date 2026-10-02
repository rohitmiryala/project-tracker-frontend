import { apiRequest } from '@/lib/apiClient'

const query = (path, params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '' && value !== 'all') search.set(key, String(value))
  })
  return search.size ? `${path}?${search}` : path
}

const mutation = async (path, options) => {
  const result = await apiRequest(path, options)
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('velorak:work-changed'))
  return result
}

export const workService = {
  overview: (projectId) => apiRequest(`/projects/${projectId}/overview`, { auth: true }),
  workstreams: (projectId) => apiRequest(`/projects/${projectId}/workstreams`, { auth: true }),
  createWorkstream: (projectId, body) => mutation(`/projects/${projectId}/workstreams`, { method: 'POST', body, auth: true }),
  updateWorkstream: (id, body) => mutation(`/workstreams/${id}`, { method: 'PATCH', body, auth: true }),
  deliverables: (projectId, params) => apiRequest(query(`/projects/${projectId}/deliverables`, params), { auth: true }),
  createDeliverable: (projectId, body) => mutation(`/projects/${projectId}/deliverables`, { method: 'POST', body, auth: true }),
  deliverable: (id) => apiRequest(`/deliverables/${id}`, { auth: true }),
  updateDeliverable: (id, body) => mutation(`/deliverables/${id}`, { method: 'PATCH', body, auth: true }),
  moveDeliverable: (id, body) => mutation(`/deliverables/${id}/move`, { method: 'POST', body, auth: true }),
  tasks: (projectId, params) => apiRequest(query(`/projects/${projectId}/tasks`, params), { auth: true }),
  createTask: (projectId, body) => mutation(`/projects/${projectId}/tasks`, { method: 'POST', body, auth: true }),
  updateTask: (id, body) => mutation(`/tasks/${id}`, { method: 'PATCH', body, auth: true }),
  moveTask: (id, body) => mutation(`/tasks/${id}/move`, { method: 'POST', body, auth: true }),
  cycles: (projectId) => apiRequest(`/projects/${projectId}/cycles`, { auth: true }),
  createCycle: (projectId, body) => mutation(`/projects/${projectId}/cycles`, { method: 'POST', body, auth: true }),
  updateCycle: (id, body) => mutation(`/cycles/${id}`, { method: 'PATCH', body, auth: true }),
  cycleAction: (id, action, body) => mutation(`/cycles/${id}/${action}`, { method: 'POST', body, auth: true }),
  milestones: (projectId) => apiRequest(`/projects/${projectId}/milestones`, { auth: true }),
  createMilestone: (projectId, body) => mutation(`/projects/${projectId}/milestones`, { method: 'POST', body, auth: true }),
  updateMilestone: (id, body) => mutation(`/milestones/${id}`, { method: 'PATCH', body, auth: true }),
  issues: (projectId, params) => apiRequest(query(`/projects/${projectId}/issues`, params), { auth: true }),
  createIssue: (projectId, body) => mutation(`/projects/${projectId}/issues`, { method: 'POST', body, auth: true }),
  updateIssue: (id, body) => mutation(`/issues/${id}`, { method: 'PATCH', body, auth: true }),
  issueToDeliverable: (id, body = {}) => mutation(`/issues/${id}/create-deliverable`, { method: 'POST', body, auth: true }),
  logTime: (body) => mutation('/time-logs', { method: 'POST', body, auth: true }),
  costs: (projectId) => apiRequest(`/projects/${projectId}/costs`, { auth: true }),
  activity: (projectId, params) => apiRequest(query(`/projects/${projectId}/activity`, params), { auth: true }),
  comments: (params) => apiRequest(query('/comments', params), { auth: true }),
  addComment: (body) => mutation('/comments', { method: 'POST', body, auth: true }),
  uploadAttachment: (formData) => mutation('/attachments', { method: 'POST', body: formData, auth: true }),
  downloadAttachment: (id) => apiRequest(`/attachments/${id}/download`, { auth: true, responseType: 'blob' }),
  myWork: (params) => apiRequest(query('/my-work', params), { auth: true }),
  notifications: () => apiRequest('/notifications', { auth: true }),
  markAllNotificationsRead: () => apiRequest('/notifications/mark-all-read', { method: 'POST', auth: true }),
  remove: (entityType, id, version) => mutation(`/${entityType}/${id}`, { method: 'DELETE', body: { version }, auth: true }),
}
