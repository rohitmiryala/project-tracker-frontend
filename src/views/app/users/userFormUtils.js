export const emptyUser = {
  fullName: '',
  email: '',
  designation: '',
  department: '',
  salary: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  roleId: '',
}

export const clonePermissions = (value = {}) => JSON.parse(JSON.stringify(value || {}))

export const normalizeEmploymentValue = (value) => typeof value === 'string' ? value.trim() : ''

export const isValidEmploymentValue = (value) => {
  const normalized = normalizeEmploymentValue(value)
  const hasControlCharacter = Array.from(normalized).some((character) => {
    const code = character.charCodeAt(0)
    return code <= 31 || code === 127
  })
  return normalized.length > 0 && normalized.length <= 100 && !/[<>]/.test(normalized) && !hasControlCharacter
}

export const mergeEmploymentOptions = (...collections) => {
  const unique = new Map()
  collections.flat().forEach((value) => {
    const normalized = normalizeEmploymentValue(value)
    if (!isValidEmploymentValue(normalized)) return
    const key = normalized.toLocaleLowerCase()
    if (!unique.has(key)) unique.set(key, normalized)
  })
  return [...unique.values()].sort((left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' }))
}

export const fieldRules = {
  fullName: {
    required: 'Full name is required',
    validate: (value) => {
      const trimmed = value.trim()
      if (trimmed.length < 2 || trimmed.length > 100) return 'Full name must be between 2 and 100 characters'
      if (!/^[\p{L}\p{M} .'-]+$/u.test(trimmed)) return 'Use letters, spaces, apostrophes, hyphens, or periods only'
      return true
    },
  },
  email: {
    required: 'Email is required',
    maxLength: { value: 254, message: 'Email must be 254 characters or fewer' },
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
  },
  optionalText: {
    maxLength: { value: 100, message: 'Maximum 100 characters allowed' },
    validate: (value) => !/[<>]/.test(value || '') || 'Angle brackets are not allowed',
  },
  salary: {
    min: { value: 0, message: 'Salary cannot be negative' },
    max: { value: 999999999.99, message: 'Salary is too large' },
    validate: (value) => value === '' || Math.round(Number(value) * 100) === Number(value) * 100 || 'Use at most two decimal places',
  },
}

export const buildUserPayload = (values, permissions, { includeIdentity = true, includeSalary = true } = {}) => {
  const payload = {
    roleId: values.roleId,
    permissions: clonePermissions(permissions),
    designation: values.designation.trim() || null,
    department: values.department.trim() || null,
    joiningDate: values.joiningDate || null,
  }
  if (includeIdentity) {
    payload.fullName = values.fullName.trim()
    payload.email = values.email.trim().toLowerCase()
  }
  if (includeSalary) payload.salary = values.salary === '' ? null : Number(values.salary)
  return payload
}

export const mapApiErrors = (error, setError, prefix = '') => {
  let mapped = false
  for (const source of error.errorSources || []) {
    const path = String(source.path || '').replace(/^body\.?/, '')
    if (!path) continue
    setError(prefix ? `${prefix}.${path}` : path, { type: 'server', message: source.message })
    mapped = true
  }
  return mapped
}
