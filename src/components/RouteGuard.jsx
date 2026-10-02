import { useAuth } from '@/hooks/useAuth'
import { hasAnyPermission } from '@/utils/permissions'
import { Navigate, useLocation } from 'react-router'

const RouteGuard = ({ children, permissions = [] }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`
    return <Navigate to="/auth/sign-in" replace state={{ from: returnTo }} />
  }

  if (permissions.length > 0 && !hasAnyPermission(user, permissions)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return children
}

export default RouteGuard
