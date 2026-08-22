import Icon from '@/components/wrappers/Icon'
import { clientService } from '@/services/clientService'
import { projectService } from '@/services/projectService'
import { useNotificationContext } from '@/context/useNotificationContext'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Col,
  Form,
  FormControl,
  FormLabel,
  FormSelect,
  Modal,
  OverlayTrigger,
  ProgressBar,
  Row,
  Spinner,
  Tooltip,
} from 'react-bootstrap'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useWizard, Wizard } from 'react-use-wizard'
import {
  PROJECT_ROLES,
  PROJECT_STATUSES,
  emptyProjectForm,
  fromProjectDetail,
  projectFormSchema,
  stepSchemas,
  toApiPayload,
} from '../projectFormSchema'

const FieldTip = ({ text }) => (
  <OverlayTrigger placement="top" overlay={<Tooltip>{text}</Tooltip>}>
    <span className="ms-1 text-muted" role="button" tabIndex={0}>
      <Icon icon="circle-help" className="fs-sm" />
    </span>
  </OverlayTrigger>
)

const WizardHeader = () => {
  const { activeStep, stepCount, goToStep } = useWizard()
  const steps = [
    { title: 'Basics', hint: 'Name and client' },
    { title: 'Schedule', hint: 'Start and end' },
    { title: 'Team', hint: 'Leads and members' },
    { title: 'More', hint: 'Tags and notes' },
  ]
  return (
    <>
      <ProgressBar now={((activeStep + 1) / stepCount) * 100} className="mb-3" style={{ height: 6 }} />
      <ul className="nav nav-tabs wizard-tabs mb-3" role="tablist">
        {steps.map((step, idx) => (
          <li className="nav-item" key={step.title}>
            <button
              type="button"
              className={clsx('nav-link', activeStep === idx && 'active', activeStep > idx && 'wizard-item-done')}
              onClick={() => goToStep(idx)}
            >
              <span className="fw-semibold">{step.title}</span>
              <span className="d-block fs-xxs text-muted">{step.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

const StepBasics = ({ clients, onQuickAddClient, addingClient }) => {
  const { nextStep } = useWizard()
  const {
    register,
    getValues,
    setError,
    formState: { errors },
  } = useFormContext()
  const [newClientName, setNewClientName] = useState('')

  const goNext = () => {
    const parsed = stepSchemas[0].safeParse(getValues())
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        setError(issue.path[0], { message: issue.message })
      })
      return
    }
    nextStep()
  }

  return (
    <div className="pt-1">
      <Row>
        <Col md={8}>
          <Form.Group className="mb-3">
            <FormLabel>
              Project name <span className="text-danger">*</span>
            </FormLabel>
            <FormControl {...register('name')} placeholder="e.g. Acme website rebuild" isInvalid={Boolean(errors.name)} />
            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <FormLabel>
              Status
              <FieldTip text="Active counts toward your plan’s project limit. On hold pauses work. Cancelled archives it without deleting." />
            </FormLabel>
            <FormSelect {...register('status')} isInvalid={Boolean(errors.status)}>
              {PROJECT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </FormSelect>
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-3">
        <FormLabel>Description</FormLabel>
        <FormControl as="textarea" rows={3} {...register('description')} placeholder="What is this project delivering?" />
      </Form.Group>
      <Form.Group className="mb-3">
        <FormLabel>
          Client <span className="text-danger">*</span>
          <FieldTip text="Who this work is for. A project always belongs to one client in your company." />
        </FormLabel>
        <FormSelect {...register('clientId')} isInvalid={Boolean(errors.clientId)}>
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </FormSelect>
        <Form.Control.Feedback type="invalid">{errors.clientId?.message}</Form.Control.Feedback>
      </Form.Group>
      {clients.length === 0 && (
        <Alert variant="warning" className="py-2">
          Create a client before you can save a project.
        </Alert>
      )}
      <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
        <div className="flex-grow-1">
          <FormLabel className="mb-1">Quick add client</FormLabel>
          <FormControl
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder="Client company name"
          />
        </div>
        <Button
          type="button"
          variant="outline-primary"
          disabled={addingClient || newClientName.trim().length < 2}
          onClick={async () => {
            const created = await onQuickAddClient(newClientName.trim())
            if (created) setNewClientName('')
          }}
        >
          {addingClient ? 'Adding…' : 'Add client'}
        </Button>
      </div>
      <div className="d-flex justify-content-end">
        <Button type="button" variant="primary" onClick={goNext}>
          Next
        </Button>
      </div>
    </div>
  )
}

const StepSchedule = () => {
  const { previousStep, nextStep } = useWizard()
  const {
    register,
    getValues,
    setError,
    formState: { errors },
  } = useFormContext()

  const goNext = () => {
    const parsed = stepSchemas[1].safeParse(getValues())
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        setError(issue.path[0], { message: issue.message })
      })
      return
    }
    nextStep()
  }

  return (
    <div className="pt-1">
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <FormLabel>
              Start date <span className="text-danger">*</span>
              <FieldTip text="Kickoff date. Used for timelines and deadline risk." />
            </FormLabel>
            <FormControl type="date" {...register('startDate')} isInvalid={Boolean(errors.startDate)} />
            <Form.Control.Feedback type="invalid">{errors.startDate?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <FormLabel>
              Estimated end date <span className="text-danger">*</span>
              <FieldTip text="Target delivery date. Must be after start date. Used to flag delayed projects." />
            </FormLabel>
            <FormControl type="date" {...register('estimatedEndDate')} isInvalid={Boolean(errors.estimatedEndDate)} />
            <Form.Control.Feedback type="invalid">{errors.estimatedEndDate?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <div className="d-flex justify-content-between">
        <Button type="button" variant="light" onClick={previousStep}>
          Back
        </Button>
        <Button type="button" variant="primary" onClick={goNext}>
          Next
        </Button>
      </div>
    </div>
  )
}

const StepTeam = ({ members }) => {
  const { previousStep, nextStep } = useWizard()
  const { control, getValues, setError, formState } = useFormContext()
  const [pickId, setPickId] = useState('')
  const [pickRole, setPickRole] = useState('member')
  const teamError = formState.errors.assignedEmployees

  const goNext = () => {
    const parsed = stepSchemas[2].safeParse(getValues())
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        setError(issue.path[0] || 'assignedEmployees', { message: issue.message })
      })
      return
    }
    nextStep()
  }

  const nameById = useMemo(
    () => Object.fromEntries(members.map((member) => [member.id, member.fullName])),
    [members]
  )

  return (
    <div className="pt-1">
      <FormLabel>
        Project members <span className="text-danger">*</span>
        <FieldTip text="Lead is for this project only. The same person can lead one project and be a member on another. Company role does not change." />
      </FormLabel>
      <Controller
        name="assignedEmployees"
        control={control}
        render={({ field }) => {
          const assigned = field.value || []
          const assignedIds = new Set(assigned.map((item) => item.employeeId))
          const available = members.filter((member) => !assignedIds.has(member.id))
          return (
            <>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <FormSelect value={pickId} onChange={(e) => setPickId(e.target.value)} className="flex-grow-1">
                  <option value="">Select a person</option>
                  {available.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                      {member.membershipType === 'admin' ? ' (admin)' : ''}
                    </option>
                  ))}
                </FormSelect>
                <FormSelect value={pickRole} onChange={(e) => setPickRole(e.target.value)} style={{ maxWidth: 140 }}>
                  {PROJECT_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </FormSelect>
                <Button
                  type="button"
                  variant="outline-primary"
                  disabled={!pickId}
                  onClick={() => {
                    field.onChange([...assigned, { employeeId: pickId, projectRole: pickRole }])
                    setPickId('')
                    setPickRole('member')
                  }}
                >
                  Add
                </Button>
              </div>
              {assigned.length === 0 && <p className="text-muted">No one assigned yet.</p>}
              {assigned.map((entry, idx) => (
                <div key={entry.employeeId} className="d-flex align-items-center gap-2 mb-2">
                  <div className="flex-grow-1 fw-semibold">{nameById[entry.employeeId] || entry.employeeId}</div>
                  <FormSelect
                    value={entry.projectRole}
                    style={{ maxWidth: 140 }}
                    onChange={(e) => {
                      const next = assigned.map((item, itemIdx) =>
                        itemIdx === idx ? { ...item, projectRole: e.target.value } : item
                      )
                      field.onChange(next)
                    }}
                  >
                    {PROJECT_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </FormSelect>
                  <Button
                    type="button"
                    size="sm"
                    variant="soft-danger"
                    onClick={() => field.onChange(assigned.filter((_, itemIdx) => itemIdx !== idx))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </>
          )
        }}
      />
      {teamError && <div className="text-danger fs-sm mb-2">{teamError.message || teamError.root?.message}</div>}
      <div className="d-flex justify-content-between mt-3">
        <Button type="button" variant="light" onClick={previousStep}>
          Back
        </Button>
        <Button type="button" variant="primary" onClick={goNext}>
          Next
        </Button>
      </div>
    </div>
  )
}

const StepMore = ({ saving, isEdit }) => {
  const { previousStep } = useWizard()
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <div className="pt-1">
      <Form.Group className="mb-3">
        <FormLabel>
          Tags
          <FieldTip text="Optional labels for filtering, comma-separated. Example: web, react, high-priority. They do not affect cost." />
        </FormLabel>
        <FormControl {...register('tagsText')} placeholder="web, react, high-priority" />
      </Form.Group>
      <Form.Group className="mb-3">
        <FormLabel>
          Notes
          <FieldTip text="Internal admin notes about this project. Not shown as a team-facing description." />
        </FormLabel>
        <FormControl as="textarea" rows={3} {...register('notes')} isInvalid={Boolean(errors.notes)} />
        <Form.Control.Feedback type="invalid">{errors.notes?.message}</Form.Control.Feedback>
      </Form.Group>
      <div className="d-flex justify-content-between">
        <Button type="button" variant="light" onClick={previousStep} disabled={saving}>
          Back
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save project' : 'Create project'}
        </Button>
      </div>
    </div>
  )
}

const ProjectWizardModal = ({ show, onHide, projectId, onSaved }) => {
  const { showNotification } = useNotificationContext()
  const [clients, setClients] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addingClient, setAddingClient] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const isEdit = Boolean(projectId)

  const methods = useForm({
    defaultValues: emptyProjectForm,
  })

  useEffect(() => {
    if (!show) return undefined
    let alive = true
    ;(async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const [clientJson, memberJson, detailJson] = await Promise.all([
          clientService.list(),
          projectService.assignableMembers(),
          projectId ? projectService.getById(projectId) : Promise.resolve(null),
        ])
        if (!alive) return
        setClients(clientJson?.data || [])
        setMembers(memberJson?.data || [])
        methods.reset(detailJson?.data ? fromProjectDetail(detailJson.data) : emptyProjectForm)
      } catch (err) {
        if (alive) setLoadError(err.message || 'Could not load project form')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [show, projectId, methods])

  const handleQuickAddClient = async (name) => {
    try {
      setAddingClient(true)
      const json = await clientService.create({ name })
      const created = json?.data
      if (created) {
        setClients((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
        methods.setValue('clientId', created.id)
        showNotification({ title: 'Client', message: 'Client added', variant: 'success' })
      }
      return created
    } catch (err) {
      showNotification({ title: 'Client', message: err.message || 'Could not add client', variant: 'danger' })
      return null
    } finally {
      setAddingClient(false)
    }
  }

  const onSubmit = methods.handleSubmit(async (values) => {
    const parsed = projectFormSchema.safeParse(values)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        methods.setError(issue.path[0], { message: issue.message })
      })
      return
    }
    try {
      setSaving(true)
      const payload = toApiPayload(values)
      if (isEdit) {
        await projectService.update(projectId, payload)
      } else {
        await projectService.create(payload)
      }
      showNotification({
        title: 'Project',
        message: isEdit ? 'Project updated' : 'Project created',
        variant: 'success',
      })
      onSaved?.()
      onHide()
    } catch (err) {
      showNotification({ title: 'Project', message: err.message || 'Save failed', variant: 'danger' })
    } finally {
      setSaving(false)
    }
  })

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop={false} keyboard={false} centered scrollable>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{isEdit ? 'Edit project' : 'Create project'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loading && (
              <div className="text-center py-4">
                <Spinner animation="border" />
              </div>
            )}
            {loadError && <Alert variant="danger">{loadError}</Alert>}
            {!loading && !loadError && (
              <Wizard header={<WizardHeader />}>
                <StepBasics clients={clients} onQuickAddClient={handleQuickAddClient} addingClient={addingClient} />
                <StepSchedule />
                <StepTeam members={members} />
                <StepMore saving={saving} isEdit={isEdit} />
              </Wizard>
            )}
          </Modal.Body>
        </Form>
      </FormProvider>
    </Modal>
  )
}

export default ProjectWizardModal
