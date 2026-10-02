import Icon from '@/components/wrappers/Icon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuth } from '@/hooks/useAuth'
import { clientService } from '@/services/clientService'
import { projectService } from '@/services/projectService'
import { mapApiErrors } from '@/utils/formErrors'
import { hasPermission } from '@/utils/permissions'
import { zodResolver } from '@hookform/resolvers/zod'
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
  PROJECT_CURRENCIES,
  PROJECT_ROLES,
  PROJECT_STATUSES,
  emptyProjectForm,
  fromProjectDetail,
  projectFormSchema,
  stepSchemas,
  toApiPayload,
} from '../projectFormSchema'
import ProjectTagsSelect from './ProjectTagsSelect'

const FieldTip = ({ text }) => (
  <OverlayTrigger placement="top" overlay={<Tooltip>{text}</Tooltip>}>
    <span className="ms-1 text-muted" role="button" tabIndex={0}>
      <Icon icon="circle-help" className="fs-sm" />
    </span>
  </OverlayTrigger>
)

const applyStepErrors = (result, setError) => {
  if (result.success) return true
  result.error.issues.forEach((issue) => {
    setError(issue.path[0], { type: 'validation', message: issue.message })
  })
  return false
}

const WizardHeader = ({ steps, disabled }) => {
  const { activeStep, stepCount, goToStep } = useWizard()

  return (
    <>
      <ProgressBar now={((activeStep + 1) / stepCount) * 100} className="mb-3" style={{ height: 6 }} />
      <ul className="nav nav-tabs wizard-tabs mb-3" role="tablist">
        {steps.map((step, index) => (
          <li className="nav-item flex-fill" key={step.title}>
            <button
              type="button"
              className={clsx(
                'nav-link w-100 text-center',
                activeStep === index && 'active',
                activeStep > index && 'wizard-item-done'
              )}
              onClick={() => goToStep(index)}
              disabled={disabled}
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

const StepBasics = ({ clients, onQuickAddClient, addingClient, canQuickAdd, isEdit, saving }) => {
  const { nextStep } = useWizard()
  const {
    control,
    register,
    getFieldState,
    getValues,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()
  const [newClientName, setNewClientName] = useState('')
  const selectedClientId = watch('clientId')
  const selectableClients = clients.filter(
    (client) => client.isActive !== false || client.id === selectedClientId
  )
  const hasActiveClients = clients.some((client) => client.isActive !== false)

  const goNext = () => {
    if (applyStepErrors(stepSchemas[0].safeParse(getValues()), setError)) nextStep()
  }

  const applyClientCurrency = (clientId) => {
    if (isEdit || getFieldState('currency').isDirty) return
    const client = clients.find((item) => item.id === clientId)
    setValue('currency', client?.currency || 'INR', { shouldDirty: false })
  }

  return (
    <div className="pt-1">
      {isEdit ? (
        <Form.Group className="mb-3" controlId="projectKey">
          <FormLabel>Project key</FormLabel>
          <FormControl value={watch('key')} readOnly disabled />
          <Form.Text className="text-muted">Used in Deliverable, Task, and Issue references.</Form.Text>
        </Form.Group>
      ) : (
        <Alert variant="info" className="py-2">
          A short, permanent project key will be generated from the project name.
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Form.Group className="mb-3" controlId="projectName">
            <FormLabel>
              Project name <span className="text-danger">*</span>
            </FormLabel>
            <FormControl
              {...register('name')}
              placeholder="e.g. Acme website rebuild"
              isInvalid={Boolean(errors.name)}
              disabled={saving}
            />
            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3" controlId="projectStatus">
            <FormLabel>
              Status
              <FieldTip text="Active counts toward your plan’s project limit. On hold pauses work. Cancelled archives it without deleting." />
            </FormLabel>
            <FormSelect {...register('status')} isInvalid={Boolean(errors.status)} disabled={saving}>
              {PROJECT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </FormSelect>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="projectDescription">
        <FormLabel>Description</FormLabel>
        <FormControl
          as="textarea"
          rows={3}
          maxLength={1000}
          {...register('description')}
          placeholder="What is this project delivering?"
          isInvalid={Boolean(errors.description)}
          disabled={saving}
        />
        <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="projectStartDate">
            <FormLabel>Start date <span className="text-danger">*</span></FormLabel>
            <FormControl type="date" {...register('startDate')} isInvalid={Boolean(errors.startDate)} disabled={saving} />
            <Form.Control.Feedback type="invalid">{errors.startDate?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="projectEndDate">
            <FormLabel>Estimated end date <span className="text-danger">*</span></FormLabel>
            <FormControl type="date" {...register('estimatedEndDate')} isInvalid={Boolean(errors.estimatedEndDate)} disabled={saving} />
            <Form.Control.Feedback type="invalid">{errors.estimatedEndDate?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="projectClient">
        <FormLabel>
          Client <span className="text-danger">*</span>
          <FieldTip text="Who this work is for. A project always belongs to one client in your company." />
        </FormLabel>
        <Controller
          name="clientId"
          control={control}
          render={({ field }) => (
            <FormSelect
              {...field}
              isInvalid={Boolean(errors.clientId)}
              disabled={saving}
              onChange={(event) => {
                field.onChange(event)
                applyClientCurrency(event.target.value)
              }}
            >
              <option value="">Select a client</option>
              {selectableClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}{client.isActive === false ? ' (inactive)' : ''}
                </option>
              ))}
            </FormSelect>
          )}
        />
        <Form.Control.Feedback type="invalid" className={errors.clientId ? 'd-block' : ''}>
          {errors.clientId?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {!hasActiveClients && !selectedClientId && (
        <Alert variant="warning" className="py-2">
          An active client is required before this project can be saved.
        </Alert>
      )}

      {canQuickAdd && (
        <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
          <div className="flex-grow-1">
            <FormLabel className="mb-1" htmlFor="quickAddClient">Quick add client</FormLabel>
            <FormControl
              id="quickAddClient"
              value={newClientName}
              maxLength={100}
              onChange={(event) => setNewClientName(event.target.value)}
              placeholder="Client company name"
              disabled={saving || addingClient}
            />
          </div>
          <Button
            type="button"
            variant="outline-primary"
            disabled={saving || addingClient || newClientName.trim().length < 2}
            onClick={async () => {
              const created = await onQuickAddClient(newClientName.trim())
              if (created) setNewClientName('')
            }}
          >
            {addingClient ? 'Adding…' : 'Add client'}
          </Button>
        </div>
      )}

      <div className="d-flex justify-content-end">
        <Button type="button" variant="primary" onClick={goNext} disabled={saving || addingClient}>
          Next
        </Button>
      </div>
    </div>
  )
}

const StepTeam = ({ members, saving }) => {
  const { previousStep, nextStep } = useWizard()
  const { control, getValues, setError, formState } = useFormContext()
  const [pickId, setPickId] = useState('')
  const [pickRole, setPickRole] = useState('member')
  const teamError = formState.errors.assignedEmployees

  const goNext = () => {
    if (applyStepErrors(stepSchemas[1].safeParse(getValues()), setError)) nextStep()
  }

  const nameById = useMemo(
    () => Object.fromEntries(members.map((member) => [member.id, member.fullName])),
    [members]
  )

  return (
    <div className="pt-1">
      <FormLabel>
        Project members <span className="text-danger">*</span>
        <FieldTip text="Lead is for this project only. Company roles remain unchanged." />
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
                <FormSelect value={pickId} onChange={(event) => setPickId(event.target.value)} className="flex-grow-1" disabled={saving}>
                  <option value="">Select a person</option>
                  {available.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}{member.membershipType === 'admin' ? ' (admin)' : ''}
                    </option>
                  ))}
                </FormSelect>
                <FormSelect value={pickRole} onChange={(event) => setPickRole(event.target.value)} style={{ maxWidth: 140 }} disabled={saving}>
                  {PROJECT_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                </FormSelect>
                <Button
                  type="button"
                  variant="outline-primary"
                  disabled={saving || !pickId}
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
              {assigned.map((entry, index) => (
                <div key={entry.employeeId} className="d-flex align-items-center gap-2 mb-2">
                  <div className="flex-grow-1 fw-semibold">{nameById[entry.employeeId] || entry.employeeId}</div>
                  <FormSelect
                    value={entry.projectRole}
                    style={{ maxWidth: 140 }}
                    disabled={saving}
                    onChange={(event) => {
                      field.onChange(assigned.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, projectRole: event.target.value } : item
                      ))
                    }}
                  >
                    {PROJECT_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                  </FormSelect>
                  <Button
                    type="button"
                    size="sm"
                    variant="soft-danger"
                    disabled={saving}
                    onClick={() => field.onChange(assigned.filter((_, itemIndex) => itemIndex !== index))}
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
        <Button type="button" variant="light" onClick={previousStep} disabled={saving}>Back</Button>
        <Button type="button" variant="primary" onClick={goNext} disabled={saving}>Next</Button>
      </div>
    </div>
  )
}

const StepPlanning = ({ hasCommercialStep, saving, isEdit }) => {
  const { previousStep, nextStep } = useWizard()
  const {
    control,
    register,
    getValues,
    setError,
    watch,
    formState: { errors },
  } = useFormContext()
  const notesLength = watch('notes')?.length || 0

  const continueOrSubmit = () => {
    if (!applyStepErrors(stepSchemas[2].safeParse(getValues()), setError)) return
    if (hasCommercialStep) nextStep()
  }

  return (
    <div className="pt-1">
      <Form.Group className="mb-3" controlId="projectPlanningMode">
        <FormLabel>Planning style</FormLabel>
        <div className="d-grid gap-2">
          <Form.Check
            type="radio"
            value="continuous"
            {...register('planningMode')}
            label="Continuous flow — move work whenever it is ready"
            disabled={saving}
            isInvalid={Boolean(errors.planningMode)}
          />
          <Form.Check
            type="radio"
            value="cycles"
            {...register('planningMode')}
            label="Cycles — plan Deliverables into fixed working periods"
            disabled={saving}
            isInvalid={Boolean(errors.planningMode)}
          />
        </div>
        {errors.planningMode && <div className="text-danger fs-sm mt-1">{errors.planningMode.message}</div>}
      </Form.Group>

      <Form.Group className="mb-3" controlId="projectTagsGroup">
        <FormLabel>Tags</FormLabel>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <ProjectTagsSelect
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={saving}
              isInvalid={Boolean(errors.tags)}
              ariaDescribedBy="projectTagsError"
            />
          )}
        />
        <Form.Text className="text-muted">Up to 20 tags, 40 characters each.</Form.Text>
        {errors.tags && <div id="projectTagsError" className="text-danger fs-sm mt-1">{errors.tags.message}</div>}
      </Form.Group>

      <Form.Group className="mb-3" controlId="projectNotes">
        <div className="d-flex justify-content-between align-items-center">
          <FormLabel>
            Notes
            <FieldTip text="Internal notes about this project. They are separate from the team-facing description." />
          </FormLabel>
          <span className="text-muted fs-xs">{notesLength} / 1000</span>
        </div>
        <FormControl
          as="textarea"
          rows={3}
          maxLength={1000}
          {...register('notes')}
          isInvalid={Boolean(errors.notes)}
          disabled={saving}
        />
        <Form.Control.Feedback type="invalid">{errors.notes?.message}</Form.Control.Feedback>
      </Form.Group>

      <div className="d-flex justify-content-between">
        <Button type="button" variant="light" onClick={previousStep} disabled={saving}>Back</Button>
        <Button
          type={hasCommercialStep ? 'button' : 'submit'}
          variant="primary"
          onClick={hasCommercialStep ? continueOrSubmit : undefined}
          disabled={saving}
        >
          {hasCommercialStep ? 'Next' : saving ? 'Saving…' : isEdit ? 'Save project' : 'Create project'}
        </Button>
      </div>
    </div>
  )
}

const StepCommercial = ({ saving, isEdit }) => {
  const { previousStep } = useWizard()
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext()
  const currency = watch('currency') || 'INR'

  return (
    <div className="pt-1">
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3" controlId="projectCurrency">
            <FormLabel>Currency</FormLabel>
            <FormSelect {...register('currency')} isInvalid={Boolean(errors.currency)} disabled={saving}>
              {PROJECT_CURRENCIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </FormSelect>
            <Form.Control.Feedback type="invalid">{errors.currency?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3" controlId="projectBillingModel">
            <FormLabel>Billing model</FormLabel>
            <FormSelect {...register('budgetType')} isInvalid={Boolean(errors.budgetType)} disabled={saving}>
              <option value="fixed">Fixed price</option>
              <option value="hourly">Hourly</option>
            </FormSelect>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="projectInternalBudget">
            <FormLabel>Internal budget ({currency})</FormLabel>
            <FormControl
              type="number"
              min="0"
              step="0.01"
              {...register('estimatedBudget')}
              isInvalid={Boolean(errors.estimatedBudget)}
              disabled={saving}
            />
            <Form.Control.Feedback type="invalid">{errors.estimatedBudget?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="projectClientBilling">
            <FormLabel>Client billing ({currency})</FormLabel>
            <FormControl
              type="number"
              min="0"
              step="0.01"
              {...register('billingAmount')}
              isInvalid={Boolean(errors.billingAmount)}
              disabled={saving}
            />
            <Form.Control.Feedback type="invalid">{errors.billingAmount?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <div className="d-flex justify-content-between">
        <Button type="button" variant="light" onClick={previousStep} disabled={saving}>Back</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save project' : 'Create project'}
        </Button>
      </div>
    </div>
  )
}

const ProjectWizardModal = ({ show, onHide, projectId, onSaved }) => {
  const { user } = useAuth()
  const { showNotification } = useNotificationContext()
  const [clients, setClients] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addingClient, setAddingClient] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const isEdit = Boolean(projectId)
  const canEditFinance = hasPermission(user, 'budgetAndFinance', 'editBudget')
  const canQuickAdd = hasPermission(user, 'clientManagement', 'create')
  const busy = saving || addingClient

  const methods = useForm({
    defaultValues: emptyProjectForm,
    resolver: zodResolver(projectFormSchema),
    mode: 'onBlur',
  })

  const steps = useMemo(() => [
    { title: 'Basics', hint: 'Scope and dates' },
    { title: 'Team', hint: 'Leads and members' },
    { title: 'Planning', hint: 'Flow and labels' },
    ...(canEditFinance ? [{ title: 'Commercial', hint: 'Currency and budget' }] : []),
  ], [canEditFinance])

  useEffect(() => {
    if (!show) return undefined
    let alive = true
    ;(async () => {
      setLoading(true)
      setLoadError(null)
      setSaveError(null)
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
      } catch (error) {
        if (alive) setLoadError(error.message || 'Could not load project form')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [show, projectId, reloadToken, methods])

  const handleQuickAddClient = async (name) => {
    try {
      setAddingClient(true)
      const json = await clientService.create({ name })
      const created = json?.data
      if (created) {
        setClients((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
        methods.setValue('clientId', created.id, { shouldDirty: true, shouldValidate: true })
        if (!isEdit && !methods.getFieldState('currency').isDirty) {
          methods.setValue('currency', created.currency || 'INR', { shouldDirty: false })
        }
        showNotification({ title: 'Client', message: 'Client added', variant: 'success' })
      }
      return created
    } catch (error) {
      showNotification({ title: 'Client', message: error.message || 'Could not add client', variant: 'danger' })
      return null
    } finally {
      setAddingClient(false)
    }
  }

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      setSaving(true)
      setSaveError(null)
      const payload = toApiPayload(values, { includeFinance: canEditFinance })
      if (isEdit) {
        await projectService.update(projectId, payload)
        onSaved?.()
      } else {
        const created = await projectService.create(payload)
        onSaved?.(created?.data)
      }
      showNotification({
        title: 'Project',
        message: isEdit ? 'Project updated' : 'Project created',
        variant: 'success',
      })
      onHide()
    } catch (error) {
      const mapped = mapApiErrors(error, methods.setError)
      setSaveError({
        conflict: error.status === 409,
        message: error.message || 'Could not save the project',
      })
      if (!mapped && error.status !== 409) {
        showNotification({ title: 'Project', message: error.message || 'Save failed', variant: 'danger' })
      }
    } finally {
      setSaving(false)
    }
  })

  const closeModal = () => {
    if (busy) return
    setSaveError(null)
    onHide()
  }

  return (
    <Modal show={show} onHide={closeModal} size="lg" backdrop="static" keyboard={false} centered scrollable>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit} noValidate>
          <Modal.Header closeButton={!busy}>
            <Modal.Title>{isEdit ? 'Edit project' : 'Create project'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loading && <div className="text-center py-4"><Spinner animation="border" /></div>}

            {loadError && (
              <Alert variant="danger" className="d-flex justify-content-between align-items-center gap-3">
                <span>{loadError}</span>
                <Button size="sm" variant="outline-danger" onClick={() => setReloadToken((value) => value + 1)}>
                  Retry
                </Button>
              </Alert>
            )}

            {saveError && (
              <Alert variant={saveError.conflict ? 'warning' : 'danger'} className="d-flex justify-content-between align-items-center gap-3">
                <span>
                  {saveError.message}
                  {saveError.conflict && ' Your unsaved values are still here.'}
                </span>
                {saveError.conflict && (
                  <Button size="sm" variant="outline-warning" disabled={saving} onClick={() => setReloadToken((value) => value + 1)}>
                    Reload project
                  </Button>
                )}
              </Alert>
            )}

            {!loading && !loadError && (
              <Wizard header={<WizardHeader steps={steps} disabled={busy} />}>
                <StepBasics
                  clients={clients}
                  onQuickAddClient={handleQuickAddClient}
                  addingClient={addingClient}
                  canQuickAdd={canQuickAdd}
                  isEdit={isEdit}
                  saving={saving}
                />
                <StepTeam members={members} saving={saving} />
                <StepPlanning hasCommercialStep={canEditFinance} saving={saving} isEdit={isEdit} />
                {canEditFinance && <StepCommercial saving={saving} isEdit={isEdit} />}
              </Wizard>
            )}
          </Modal.Body>
        </Form>
      </FormProvider>
    </Modal>
  )
}

export default ProjectWizardModal
