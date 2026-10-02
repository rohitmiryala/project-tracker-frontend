export const titleCase = (value = '') => String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export const formatDate = (value, options = {}) => value
  ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...options }).format(new Date(value))
  : 'Not set'

export const formatCurrency = (value, currency = 'INR') => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(Number(value || 0))

export const can = (user, module, action) => user?.membershipType === 'admin' || user?.permissions?.[module]?.[action] === true

export const memberOptions = (project) => (project.assignedEmployees || []).map((member) => ({
  value: member.id,
  label: member.fullName || 'Unnamed member',
}))

export const setApiFieldErrors = (error, setError) => {
  let mapped = false
  for (const source of error?.errorSources || []) {
    const path = String(source.path || '').replace(/^body\./, '')
    if (!path) continue
    setError(path, { type: 'server', message: source.message })
    mapped = true
  }
  return mapped
}

export const isConflict = (error) => error?.status === 409

export const toDateInput = (value) => value ? new Date(value).toISOString().slice(0, 10) : ''
