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

const assignedEmployeeSchema = z.object({
  employeeId: z.string().min(1, 'Select a team member'),
  projectRole: z.enum(['lead', 'member']),
})

export const projectFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
    description: z.string().trim().max(1000).optional().or(z.literal('')),
    clientId: z.string().min(1, 'Select a client'),
    status: z.enum(['active', 'on_hold', 'completed', 'cancelled']),
    startDate: z.string().min(1, 'Start date is required'),
    estimatedEndDate: z.string().min(1, 'Estimated end date is required'),
    assignedEmployees: z.array(assignedEmployeeSchema).min(1, 'Assign at least one team member'),
    tagsText: z.string().optional(),
    notes: z.string().trim().max(1000).optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.estimatedEndDate && data.estimatedEndDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Estimated end date must be after start date',
        path: ['estimatedEndDate'],
      })
    }
    const ids = data.assignedEmployees.map((item) => item.employeeId)
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Each person can be assigned only once',
        path: ['assignedEmployees'],
      })
    }
    if (!data.assignedEmployees.some((item) => item.projectRole === 'lead')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Assign at least one project lead',
        path: ['assignedEmployees'],
      })
    }
  })

export const stepSchemas = {
  0: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
    description: z.string().trim().max(1000).optional().or(z.literal('')),
    clientId: z.string().min(1, 'Select a client'),
    status: z.enum(['active', 'on_hold', 'completed', 'cancelled']),
  }),
  1: z
    .object({
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
    }),
  2: z
    .object({
      assignedEmployees: z.array(assignedEmployeeSchema).min(1, 'Assign at least one team member'),
    })
    .superRefine((data, ctx) => {
      const ids = data.assignedEmployees.map((item) => item.employeeId)
      if (new Set(ids).size !== ids.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Each person can be assigned only once',
          path: ['assignedEmployees'],
        })
      }
      if (!data.assignedEmployees.some((item) => item.projectRole === 'lead')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Assign at least one project lead',
          path: ['assignedEmployees'],
        })
      }
    }),
  3: z.object({
    tagsText: z.string().optional(),
    notes: z.string().trim().max(1000).optional().or(z.literal('')),
  }),
}

export const emptyProjectForm = {
  name: '',
  description: '',
  clientId: '',
  status: 'active',
  startDate: '',
  estimatedEndDate: '',
  assignedEmployees: [],
  tagsText: '',
  notes: '',
}

export const toApiPayload = (values) => ({
  name: values.name.trim(),
  description: values.description?.trim() || null,
  clientId: values.clientId,
  status: values.status,
  startDate: values.startDate,
  estimatedEndDate: values.estimatedEndDate,
  assignedEmployees: values.assignedEmployees,
  tags: (values.tagsText || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean),
  notes: values.notes?.trim() || null,
})

const toDateInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export const fromProjectDetail = (project) => ({
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
  tagsText: (project.tags || []).join(', '),
  notes: project.notes || '',
})
