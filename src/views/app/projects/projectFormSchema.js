import { z } from 'zod'

export const PROJECT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const PROJECT_ROLES = [
  { value: 'lead', label: 'Lead' },
  { value: 'member', label: 'Member' },
]

export const PROJECT_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'SGD']

const assignedEmployeeSchema = z.object({
  employeeId: z.string().min(1, 'Select a team member'),
  projectRole: z.enum(['lead', 'member']),
})

const assignedEmployeesSchema = z
  .array(assignedEmployeeSchema)
  .min(1, 'Assign at least one team member')
  .superRefine((items, ctx) => {
    const ids = items.map((item) => item.employeeId)
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Each person can be assigned only once',
      })
    }
    if (!items.some((item) => item.projectRole === 'lead')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Assign at least one project lead',
      })
    }
  })

const tagsSchema = z
  .array(z.string().trim().min(1, 'Tags cannot be empty').max(40, 'Each tag must be 40 characters or fewer'))
  .max(20, 'Add no more than 20 tags')
  .superRefine((tags, ctx) => {
    const normalized = tags.map((tag) => tag.toLocaleLowerCase())
    if (new Set(normalized).size !== normalized.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tags must be unique',
      })
    }
  })

const basicsSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
    description: z.string().trim().max(1000).optional().or(z.literal('')),
    clientId: z.string().min(1, 'Select a client'),
    status: z.enum(['active', 'on_hold', 'completed', 'cancelled']),
    startDate: z.string().min(1, 'Start date is required'),
    estimatedEndDate: z.string().min(1, 'Estimated end date is required'),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.estimatedEndDate && data.estimatedEndDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Estimated end date must be after start date',
        path: ['estimatedEndDate'],
      })
    }
  })

const planningSchema = z.object({
  planningMode: z.enum(['continuous', 'cycles']),
  tags: tagsSchema,
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
})

const commercialSchema = z.object({
  currency: z.enum(PROJECT_CURRENCIES),
  budgetType: z.enum(['fixed', 'hourly']),
  estimatedBudget: z.coerce.number().min(0, 'Internal budget cannot be negative'),
  billingAmount: z.coerce.number().min(0, 'Client billing cannot be negative'),
})

export const projectFormSchema = basicsSchema
  .and(z.object({ assignedEmployees: assignedEmployeesSchema }))
  .and(planningSchema)
  .and(commercialSchema)
  .and(z.object({
    key: z.string().optional(),
    version: z.coerce.number().int().min(1).optional(),
  }))

export const stepSchemas = {
  0: basicsSchema,
  1: z.object({ assignedEmployees: assignedEmployeesSchema }),
  2: planningSchema,
  3: commercialSchema,
}

export const emptyProjectForm = {
  key: '',
  name: '',
  description: '',
  clientId: '',
  status: 'active',
  startDate: '',
  estimatedEndDate: '',
  assignedEmployees: [],
  planningMode: 'continuous',
  currency: 'INR',
  budgetType: 'fixed',
  estimatedBudget: 0,
  billingAmount: 0,
  version: undefined,
  tags: [],
  notes: '',
}

export const toApiPayload = (values, { includeFinance = false } = {}) => ({
  name: values.name.trim(),
  description: values.description?.trim() || null,
  clientId: values.clientId,
  status: values.status,
  startDate: values.startDate,
  estimatedEndDate: values.estimatedEndDate,
  assignedEmployees: values.assignedEmployees,
  planningMode: values.planningMode,
  ...(values.version ? { version: values.version } : {}),
  tags: values.tags.map((tag) => tag.trim()).filter(Boolean),
  notes: values.notes?.trim() || null,
  ...(includeFinance
    ? {
        currency: values.currency,
        budgetType: values.budgetType,
        estimatedBudget: Number(values.estimatedBudget || 0),
        billingAmount: Number(values.billingAmount || 0),
      }
    : {}),
})

const toDateInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export const fromProjectDetail = (project) => ({
  key: project.key || '',
  name: project.name || '',
  description: project.description || '',
  clientId: project.client?.id || '',
  status: project.status || 'active',
  startDate: toDateInput(project.startDate),
  estimatedEndDate: toDateInput(project.estimatedEndDate),
  assignedEmployees: (project.assignedEmployees || []).map((entry) => ({
    employeeId: entry.employeeId,
    projectRole: entry.projectRole || 'member',
  })),
  planningMode: project.planningMode || 'continuous',
  currency: project.currency || 'INR',
  budgetType: project.budget?.budgetType || 'fixed',
  estimatedBudget: project.budget?.estimatedBudget || 0,
  billingAmount: project.budget?.billingAmount || 0,
  version: project.version,
  tags: project.tags || [],
  notes: project.notes || '',
})
