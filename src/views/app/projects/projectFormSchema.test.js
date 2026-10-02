import { describe, expect, it } from 'vitest'
import {
  emptyProjectForm,
  fromProjectDetail,
  projectFormSchema,
  toApiPayload,
} from './projectFormSchema'

const validForm = {
  ...emptyProjectForm,
  name: 'Customer portal',
  clientId: 'client-1',
  startDate: '2026-10-01',
  estimatedEndDate: '2026-12-01',
  assignedEmployees: [{ employeeId: 'member-1', projectRole: 'lead' }],
  tags: ['Web', 'Priority'],
  notes: 'Internal note',
  estimatedBudget: 1000,
  billingAmount: 1500,
}

describe('project form contract', () => {
  it('omits finance fields and the immutable key for non-finance editors', () => {
    const payload = toApiPayload({ ...validForm, key: 'CP' })

    expect(payload).not.toHaveProperty('key')
    expect(payload).not.toHaveProperty('currency')
    expect(payload).not.toHaveProperty('budgetType')
    expect(payload).not.toHaveProperty('estimatedBudget')
    expect(payload).not.toHaveProperty('billingAmount')
  })

  it('includes finance fields only when explicitly requested', () => {
    const payload = toApiPayload(validForm, { includeFinance: true })

    expect(payload).toMatchObject({
      currency: 'INR',
      budgetType: 'fixed',
      estimatedBudget: 1000,
      billingAmount: 1500,
    })
  })

  it('rejects duplicate, overlength, and excessive tags', () => {
    expect(projectFormSchema.safeParse({ ...validForm, tags: ['Web', 'web'] }).success).toBe(false)
    expect(projectFormSchema.safeParse({ ...validForm, tags: ['x'.repeat(41)] }).success).toBe(false)
    expect(projectFormSchema.safeParse({
      ...validForm,
      tags: Array.from({ length: 21 }, (_, index) => `tag-${index}`),
    }).success).toBe(false)
  })

  it('hydrates immutable identity, currency, budget, and tag values from project detail', () => {
    const values = fromProjectDetail({
      key: 'CP',
      name: 'Customer portal',
      client: { id: 'client-1' },
      currency: 'USD',
      planningMode: 'cycles',
      version: 3,
      tags: ['Web'],
      assignedEmployees: [{ employeeId: 'member-1', projectRole: 'lead' }],
      budget: { budgetType: 'hourly', estimatedBudget: 500, billingAmount: 900 },
    })

    expect(values).toMatchObject({
      key: 'CP',
      currency: 'USD',
      planningMode: 'cycles',
      version: 3,
      tags: ['Web'],
      budgetType: 'hourly',
      estimatedBudget: 500,
      billingAmount: 900,
    })
  })
})
