import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NotificationDropdown from './NotificationDropdownPeople'

const notifications = vi.hoisted(() => vi.fn())
const markAllNotificationsRead = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { membershipType: 'admin' } }),
}))

vi.mock('@/services/workService', () => ({
  workService: { notifications, markAllNotificationsRead },
}))

vi.mock('@/components/wrappers/SimpleBar', () => ({
  SimpleBar: ({ children }) => <div>{children}</div>,
}))

describe('NotificationDropdown', () => {
  beforeEach(() => {
    notifications.mockReset().mockResolvedValue({
      data: [{ _id: 'notification-1', type: 'task_assigned', title: 'Task assigned', message: 'Build the API', isRead: false, createdAt: new Date().toISOString() }],
    })
    markAllNotificationsRead.mockReset().mockResolvedValue({ data: { modifiedCount: 1 } })
  })

  it('loads live notifications and marks all unread items as read', async () => {
    const user = userEvent.setup()
    render(<NotificationDropdown />)

    const toggle = await screen.findByRole('button', { name: '1 unread notifications' })
    await user.click(toggle)
    await user.click(await screen.findByRole('button', { name: 'Mark all read' }))

    await waitFor(() => expect(markAllNotificationsRead).toHaveBeenCalledOnce())
    expect(screen.getByRole('button', { name: '0 unread notifications' })).toBeInTheDocument()
  })
})
