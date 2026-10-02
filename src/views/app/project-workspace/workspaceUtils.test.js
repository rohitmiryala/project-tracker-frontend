import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, titleCase, toDateInput } from './workspaceUtils'

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
})
