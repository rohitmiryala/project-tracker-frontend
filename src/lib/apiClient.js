const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '')

const TOKEN_KEY = 'velorak_access_token'
const REFRESH_KEY = 'velorak_refresh_token'
const USER_KEY = 'velorak_user'
const PENDING_PAYMENT_KEY = 'velorak_pending_payment'
const RESET_TOKEN_KEY = 'velorak_reset_token'

export const sessionKeys = {
  TOKEN_KEY,
  REFRESH_KEY,
  USER_KEY,
  PENDING_PAYMENT_KEY,
  RESET_TOKEN_KEY,
}

export const getAccessToken = () => sessionStorage.getItem(TOKEN_KEY)
export const getRefreshToken = () => sessionStorage.getItem(REFRESH_KEY)

export const getStoredUser = () => {
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const persistAuthSession = ({ accessToken, refreshToken, user } = {}) => {
  if (accessToken) sessionStorage.setItem(TOKEN_KEY, accessToken)
  if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken)
  if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearAuthSession = () => {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
  sessionStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(PENDING_PAYMENT_KEY)
}

export const setPendingPayment = (payload) => {
  if (!payload) {
    sessionStorage.removeItem(PENDING_PAYMENT_KEY)
    return
  }
  sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payload))
}

export const getPendingPayment = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const parseErrorMessage = async (response) => {
  try {
    const data = await response.json()
    if (data?.message) return data.message
    if (data?.errorSources?.[0]?.message) return data.errorSources[0].message
    if (data?.errorMessages?.[0]?.message) return data.errorMessages[0].message
    if (typeof data?.error === 'string') return data.error
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`
}

let refreshPromise = null

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          clearAuthSession()
          return null
        }
        const json = await res.json()
        const data = json?.data
        if (data?.accessToken) {
          persistAuthSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || refreshToken,
            user: data.user,
          })
          return data.accessToken
        }
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

/**
 * @param {string} path - e.g. '/auth/login'
 * @param {{ method?: string, body?: object, auth?: boolean, headers?: Record<string,string> }} options
 */
export const apiRequest = async (path, { method = 'GET', body, auth = false, headers = {} } = {}) => {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

  const buildHeaders = (token) => {
    const next = {
      'Content-Type': 'application/json',
      ...headers,
    }
    if (auth && token) next.Authorization = `Bearer ${token}`
    return next
  }

  const doFetch = (token) =>
    fetch(url, {
      method,
      credentials: 'include',
      headers: buildHeaders(token),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })

  let response = await doFetch(auth ? getAccessToken() : null)

  if (response.status === 401 && auth) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      response = await doFetch(newToken)
    }
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  if (response.status === 204) return null
  return response.json()
}

export { API_BASE_URL }
