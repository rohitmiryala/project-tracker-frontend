import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RouteGuard from './RouteGuard'

const authState = vi.hoisted(() => ({ current: { isAuthenticated: false, user: null } }))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => authState.current,
}))

const SignIn = () => {
  const location = useLocation()
  return <div>Sign in:{location.state?.from}</div>
}

const renderGuard = (permissions = [], initialEntry = '/app/projects/abc/work?task=123') => render(
  <MemoryRouter initialEntries={[initialEntry]}>
    <Routes>
      <Route path="/auth/sign-in" element={<SignIn />} />
      <Route path="/app/dashboard" element={<div>Dashboard fallback</div>} />
      <Route
        path="/app/projects/:projectId/work"
        element={<RouteGuard permissions={permissions}><div>Protected work</div></RouteGuard>}
      />
    </Routes>
  </MemoryRouter>,
)

describe('RouteGuard', () => {
  beforeEach(() => {
    authState.current = { isAuthenticated: false, user: null }
  })

  it('preserves the requested URL when redirecting to sign in', () => {
    renderGuard()
    expect(screen.getByText('Sign in:/app/projects/abc/work?task=123')).toBeInTheDocument()
  })

  it('redirects an authenticated user without permission to the dashboard', () => {
    authState.current = { isAuthenticated: true, user: { membershipType: 'employee', permissions: {} } }
    renderGuard([['workManagement', 'view']])
    expect(screen.getByText('Dashboard fallback')).toBeInTheDocument()
  })

  it('renders the page for an administrator', () => {
    authState.current = { isAuthenticated: true, user: { membershipType: 'admin' } }
    renderGuard([['workManagement', 'view']])
    expect(screen.getByText('Protected work')).toBeInTheDocument()
  })
})
