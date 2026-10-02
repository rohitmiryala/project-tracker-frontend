import RouteGuard from '@/components/RouteGuard'
import MainLayout from '@/layouts/MainLayout'
import { lazy } from 'react'
import { Navigate } from 'react-router'

const guarded = (loader, permissions = []) => {
  const Page = lazy(loader)
  return (
    <RouteGuard permissions={permissions}>
      <Page />
    </RouteGuard>
  )
}

const projectAccess = [['projectManagement', 'view']]
const workAccess = [['workManagement', 'view'], ['projectManagement', 'view']]
const roleAccess = [
  ['userManagement', 'view'],
  ['userManagement', 'invite'],
  ['userManagement', 'changeRole'],
]

export const routes = [
  { path: '', element: <Navigate to="/app/dashboard" replace /> },
  {
    element: (
      <RouteGuard>
        <MainLayout />
      </RouteGuard>
    ),
    children: [
      { path: '/app/dashboard', element: guarded(() => import('@/views/app/dashboard')) },
      { path: '/app/my-work', element: guarded(() => import('@/views/app/my-work'), workAccess) },
      { path: '/app/projects', element: guarded(() => import('@/views/app/projects'), projectAccess) },
      { path: '/app/projects/:projectId/overview', element: guarded(() => import('@/views/app/project-workspace'), projectAccess) },
      { path: '/app/projects/:projectId/work', element: guarded(() => import('@/views/app/project-workspace'), projectAccess) },
      { path: '/app/projects/:projectId/cycles', element: guarded(() => import('@/views/app/project-workspace'), projectAccess) },
      { path: '/app/projects/:projectId/cycles/:cycleId', element: guarded(() => import('@/views/app/project-workspace'), projectAccess) },
      { path: '/app/projects/:projectId/issues', element: guarded(() => import('@/views/app/project-workspace'), projectAccess) },
      { path: '/app/projects/:projectId/timeline', element: guarded(() => import('@/views/app/project-workspace'), projectAccess) },
      { path: '/app/projects/:projectId/team', element: guarded(() => import('@/views/app/project-workspace'), projectAccess) },
      { path: '/app/projects/:projectId/costs', element: guarded(() => import('@/views/app/project-workspace'), projectAccess) },
      { path: '/app/projects/:projectId/activity', element: guarded(() => import('@/views/app/project-workspace'), projectAccess) },
      { path: '/app/projects/:projectId/settings', element: guarded(() => import('@/views/app/project-workspace'), projectAccess) },
      { path: '/app/clients', element: guarded(() => import('@/views/app/clients'), [['clientManagement', 'view']]) },
      { path: '/app/users', element: guarded(() => import('@/views/app/users'), [['userManagement', 'view']]) },
      { path: '/app/users/new', element: guarded(() => import('@/views/app/users/UserFormPage'), [['userManagement', 'invite']]) },
      { path: '/app/users/bulk', element: guarded(() => import('@/views/app/users/BulkUsersPage'), [['userManagement', 'invite']]) },
      { path: '/app/users/:userId', element: guarded(() => import('@/views/app/users/UserDetailsPage'), [['userManagement', 'view']]) },
      {
        path: '/app/users/:userId/edit',
        element: guarded(() => import('@/views/app/users/UserFormPage'), [
          ['userManagement', 'edit'],
          ['userManagement', 'changeRole'],
        ]),
      },
      { path: '/app/roles', element: guarded(() => import('@/views/app/roles'), roleAccess) },
      { path: '/app/profile', element: guarded(() => import('@/views/app/profile')) },
    ],
  },
  { path: '/auth/checkout', Component: lazy(() => import('@/views/auth/basic/checkout')) },
  { path: '/auth/new-pass', Component: lazy(() => import('@/views/auth/basic/new-pass')) },
  { path: '/auth/reset-pass', Component: lazy(() => import('@/views/auth/basic/reset-pass')) },
  { path: '/auth/sign-in', Component: lazy(() => import('@/views/auth/basic/sign-in')) },
  { path: '/auth/sign-up', Component: lazy(() => import('@/views/auth/basic/sign-up')) },
  { path: '/auth/success-mail', Component: lazy(() => import('@/views/auth/basic/success-mail')) },
  { path: '/auth/two-factor', Component: lazy(() => import('@/views/auth/basic/two-factor')) },
  { path: '/error/400', Component: lazy(() => import('@/views/error/400')) },
  { path: '/error/401', Component: lazy(() => import('@/views/error/401')) },
  { path: '/error/403', Component: lazy(() => import('@/views/error/403')) },
  { path: '/error/404', Component: lazy(() => import('@/views/error/404')) },
  { path: '/error/408', Component: lazy(() => import('@/views/error/408')) },
  { path: '/error/500', Component: lazy(() => import('@/views/error/500')) },
  { path: '/error/maintenance', Component: lazy(() => import('@/views/error/maintenance')) },
  { path: '/landing', Component: lazy(() => import('@/views/landing')) },
  { path: '*', element: <Navigate to="/error/404" replace /> },
]
