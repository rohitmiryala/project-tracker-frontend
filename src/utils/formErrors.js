export const mapApiErrors = (error, setError, prefix = '') => {
  let mapped = false
  for (const source of error.errorSources || []) {
    const path = String(source.path || '').replace(/^body\.?/, '')
    if (!path) continue
    setError(prefix ? `${prefix}.${path}` : path, {
      type: 'server',
      message: source.message,
    })
    mapped = true
  }
  return mapped
}
