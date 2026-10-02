import Icon from '@/components/wrappers/Icon'
import { SimpleBar } from '@/components/wrappers/SimpleBar'
import { useAuth } from '@/hooks/useAuth'
import { workService } from '@/services/workService'
import { hasAnyPermission } from '@/utils/permissions'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Spinner } from 'react-bootstrap'

const iconByType = {
  task_assigned: 'check-square',
  task_overdue: 'calendar-x',
  project_budget_warning: 'triangle-alert',
  issue_assigned: 'circle-alert',
  mention: 'at-sign',
}

const relativeTime = (value) => {
  if (!value) return ''
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const ranges = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  const [unit, divisor] = ranges.find(([, size]) => Math.abs(seconds) >= size) || ['second', 1]
  return formatter.format(Math.round(seconds / divisor), unit)
}

const NotificationDropdown = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [marking, setMarking] = useState(false)
  const canLoad = hasAnyPermission(user, [
    ['workManagement', 'view'],
    ['projectManagement', 'view'],
  ])

  const load = useCallback(async () => {
    if (!canLoad) return
    setLoading(true)
    setError('')
    try {
      const response = await workService.notifications()
      setItems(response?.data || [])
    } catch (requestError) {
      setError(requestError.message || 'Notifications could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [canLoad])

  useEffect(() => {
    const initialLoad = window.setTimeout(load, 0)
    const refresh = () => load()
    window.addEventListener('velorak:work-changed', refresh)
    return () => {
      window.clearTimeout(initialLoad)
      window.removeEventListener('velorak:work-changed', refresh)
    }
  }, [load])

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items])

  const markAllRead = async () => {
    if (!unreadCount) return
    setMarking(true)
    try {
      await workService.markAllNotificationsRead()
      setItems((current) => current.map((item) => ({ ...item, isRead: true })))
    } catch (requestError) {
      setError(requestError.message || 'Notifications could not be updated.')
    } finally {
      setMarking(false)
    }
  }

  if (!canLoad) return null

  return (
    <div id="notification-dropdown-people" className="topbar-item">
      <Dropdown align="end" onToggle={(open) => open && load()}>
        <DropdownToggle className="topbar-link drop-arrow-none" as="button" aria-label={`${unreadCount} unread notifications`}>
          <span className="topbar-link-icon"><Icon icon="bell" /></span>
          {unreadCount > 0 && <span className="badge text-bg-danger badge-circle topbar-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </DropdownToggle>

        <DropdownMenu className="p-0 dropdown-menu-end dropdown-menu-lg">
          <div className="d-flex align-items-center justify-content-between gap-3 px-3 py-2 border-bottom">
            <div>
              <h6 className="m-0 fs-md fw-semibold">Notifications</h6>
              <span className="text-muted fs-xs">{unreadCount} unread</span>
            </div>
            <Button type="button" variant="link" size="sm" className="p-0" onClick={markAllRead} disabled={marking || unreadCount === 0}>
              {marking ? 'Updating…' : 'Mark all read'}
            </Button>
          </div>

          <SimpleBar style={{ maxHeight: 340 }}>
            {loading && items.length === 0 && (
              <div className="text-center py-5" role="status"><Spinner animation="border" size="sm" /><div className="text-muted fs-sm mt-2">Loading notifications…</div></div>
            )}
            {error && (
              <div className="text-center p-4">
                <p className="text-danger fs-sm mb-2">{error}</p>
                <Button size="sm" variant="outline-danger" onClick={load}>Try again</Button>
              </div>
            )}
            {!loading && !error && items.length === 0 && (
              <div className="text-center p-5">
                <Icon icon="bell-off" className="fs-2 text-muted mb-2" />
                <p className="text-muted mb-0">You are all caught up.</p>
              </div>
            )}
            {!error && items.map((notification) => (
              <DropdownItem key={notification._id} as="div" className={`notification-item py-3 text-wrap ${notification.isRead ? '' : 'bg-primary-subtle'}`}>
                <span className="d-flex align-items-start gap-3">
                  <span className="avatar avatar-sm avatar-title rounded bg-light text-primary flex-shrink-0">
                    <Icon icon={iconByType[notification.type] || 'bell'} />
                  </span>
                  <span className="flex-grow-1 min-w-0">
                    <span className="d-block fw-semibold text-body">{notification.title}</span>
                    <span className="d-block text-muted fs-sm text-break">{notification.message}</span>
                    <span className="d-block text-muted fs-xs mt-1">{relativeTime(notification.createdAt)}</span>
                  </span>
                  {!notification.isRead && <span className="rounded-circle bg-primary mt-2" style={{ width: 7, height: 7 }} aria-label="Unread" />}
                </span>
              </DropdownItem>
            ))}
          </SimpleBar>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default NotificationDropdown
