import { describe, expect, it } from 'vitest'
import { filterMenuItems, hasAnyPermission, hasPermission } from './permissions'

describe('permission helpers', () => {
  const member = {
    membershipType: 'employee',
    permissions: {
      projectManagement: { view: true, edit: false },
      userManagement: { view: false },
    },
  }

  it('treats company administrators as authorized', () => {
    expect(hasPermission({ membershipType: 'admin' }, 'budgetAndFinance', 'viewProfit')).toBe(true)
  })

  it('supports any-of permission checks', () => {
    expect(hasAnyPermission(member, [['userManagement', 'view'], ['projectManagement', 'view']])).toBe(true)
  })

  it('filters navigation with the same permission source used by routes', () => {
    const items = [
      { label: 'Projects', permissions: [['projectManagement', 'view']] },
      { label: 'Users', permissions: [['userManagement', 'view']] },
    ]
    expect(filterMenuItems(items, member).map((item) => item.label)).toEqual(['Projects'])
  })
})
