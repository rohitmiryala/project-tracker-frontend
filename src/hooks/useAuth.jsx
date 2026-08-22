import {
  clearAuthSession,
  getAccessToken,
  getPendingPayment,
  getRefreshToken,
  getStoredUser,
  persistAuthSession,
  setPendingPayment,
} from '@/lib/apiClient'
import { authService } from '@/services/authService'
import { createContext, use, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

const AuthContext = createContext(undefined)

const applyAuthResult = (data) => {
  if (!data?.accessToken) return data

  persistAuthSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  })

  if (data.requiresPayment && data.razorpay) {
    setPendingPayment({
      companyId: data.companyId,
      plan: data.plan,
      planStatus: data.planStatus,
      razorpay: data.razorpay,
    })
  } else {
    setPendingPayment(null)
  }

  return data
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [token, setTokenState] = useState(() => getAccessToken())
  const [user, setUser] = useState(() => getStoredUser())

  const syncFromStorage = useCallback(() => {
    setTokenState(getAccessToken())
    setUser(getStoredUser())
  }, [])

  const login = useCallback(
    async (email, password) => {
      try {
        setLoading(true)
        setError(null)
        const json = await authService.login({ email, password })
        const data = applyAuthResult(json?.data)
        syncFromStorage()

        if (data?.requiresPayment) {
          navigate('/auth/checkout', { replace: true })
          return data
        }

        navigate('/app/dashboard', { replace: true })
        return data
      } catch (err) {
        setError(err.message || 'Login failed')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [navigate, syncFromStorage]
  )

  const register = useCallback(
    async (payload) => {
      try {
        setLoading(true)
        setError(null)
        const json = await authService.register(payload)
        const data = applyAuthResult(json?.data)
        syncFromStorage()

        if (data?.requiresPayment) {
          navigate('/auth/checkout', { replace: true })
          return data
        }

        navigate('/app/dashboard', { replace: true })
        return data
      } catch (err) {
        setError(err.message || 'Registration failed')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [navigate, syncFromStorage]
  )

  const confirmPayment = useCallback(
    async ({ orderId, paymentId, signature }) => {
      try {
        setLoading(true)
        setError(null)
        const json = await authService.confirmPayment({ orderId, paymentId, signature })
        applyAuthResult({ ...json?.data, requiresPayment: false })
        setPendingPayment(null)
        syncFromStorage()
        navigate('/app/dashboard', { replace: true })
        return json?.data
      } catch (err) {
        setError(err.message || 'Payment confirmation failed')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [navigate, syncFromStorage]
  )

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    try {
      await authService.logout(refreshToken)
    } catch {
      // still clear local session
    }
    clearAuthSession()
    syncFromStorage()
    navigate('/auth/sign-in', { replace: true })
  }, [navigate, syncFromStorage])

  const isAuthenticated = Boolean(token)
  const pendingPayment = useMemo(() => getPendingPayment(), [token, user])

  const value = useMemo(
    () => ({
      login,
      register,
      confirmPayment,
      logout,
      isAuthenticated,
      loading,
      error,
      setError,
      user,
      pendingPayment,
      syncFromStorage,
    }),
    [
      login,
      register,
      confirmPayment,
      logout,
      isAuthenticated,
      loading,
      error,
      user,
      pendingPayment,
      syncFromStorage,
    ]
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export const useAuth = () => {
  const context = use(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
