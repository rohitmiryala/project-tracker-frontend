import { getPendingPayment } from '@/lib/apiClient'
import { LayoutProvider } from '@/context/useLayoutContext'
import { NotificationProvider } from '@/context/useNotificationContext'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

const PUBLIC_PREFIXES = ['/auth', '/landing', '/error']

const isPublicPath = (pathname) =>
  PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

const AppGate = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const publicRoute = isPublicPath(location.pathname)

    if (!isAuthenticated && !publicRoute) {
      navigate('/auth/sign-in', {
        replace: true,
        state: { from: location.pathname },
      })
      return
    }

    const pending = getPendingPayment()
    if (
      isAuthenticated &&
      pending?.razorpay?.orderId &&
      location.pathname !== '/auth/checkout'
    ) {
      navigate('/auth/checkout', { replace: true })
    }
  }, [isAuthenticated, location.pathname, navigate, location])

  return (
    <LayoutProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </LayoutProvider>
  )
}

const AppProvidersWrapper = ({ children }) => (
  <AuthProvider>
    <AppGate>{children}</AppGate>
  </AuthProvider>
)

export default AppProvidersWrapper
