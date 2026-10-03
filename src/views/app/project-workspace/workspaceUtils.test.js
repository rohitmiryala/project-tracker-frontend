import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, memberOptions, titleCase, toDateInput } from './workspaceUtils'

describe('workspace formatting', () => {
  it('formats enum values for people', () => {
    expect(titleCase('in_progress')).toBe('In Progress')
  })

  it('uses locale-safe currency formatting', () => {
    expect(formatCurrency(1250, 'INR')).toContain('1,250')
  })

  it('returns safe placeholders and date input values', () => {
    expect(formatDate(null)).toBe('Not set')
    expect(toDateInput('2026-10-01T12:30:00.000Z')).toBe('2026-10-01')
  })

  it('uses the project member employee id as the select value', () => {
    expect(memberOptions({
      assignedEmployees: [
        {
          employeeId: '507f1f77bcf86cd799439011',
          fullName: 'Admin User Free',
        },
      ],
    })).toEqual([
      {
        value: '507f1f77bcf86cd799439011',
        label: 'Admin User Free',
      },
    ])
  })

  it('supports legacy member ids and omits options without an id', () => {
    expect(memberOptions({
      assignedEmployees: [
        { id: '507f1f77bcf86cd799439012', fullName: 'Legacy Member' },
        { fullName: 'Invalid Member' },
      ],
    })).toEqual([
      {
        value: '507f1f77bcf86cd799439012',
        label: 'Legacy Member',
      },
    ])
  })
})
