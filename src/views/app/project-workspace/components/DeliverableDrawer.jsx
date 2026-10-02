import Icon from '@/components/wrappers/Icon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuth } from '@/hooks/useAuth'
import { workService } from '@/services/workService'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge, Button, Col, Form, FormControl, FormSelect, Offcanvas, ProgressBar, Row, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { can, isConflict, memberOptions, setApiFieldErrors, titleCase, toDateInput } from '../workspaceUtils'
import { ConflictAlert, DrawerError, DrawerLoading } from './DrawerState'
import TaskDrawer from './TaskDrawer'

const schema = z.object({
  title: z.string().trim().min(2, 'Enter at least 2 characters').max(200),
  description: z.string().trim().max(3000),
  acceptanceCriteria: z.string().trim().max(3000),
  status: z.enum(['backlog', 'ready', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  workstreamId: z.string(), cycleId: z.string(), milestoneId: z.string(), ownerId: z.string(),
  assignedEmployeeIds: z.array(z.string()),
  estimatedHours: z.union([z.literal(''), z.coerce.number().min(0)]),
  storyPoints: z.union([z.literal(''), z.coerce.number().min(0)]),
  startDate: z.string(), dueDate: z.string(),
}).refine((value) => !value.startDate || !value.dueDate || value.dueDate >= value.startDate, {
  path: ['dueDate'], message: 'Due date must be on or after the start date',
})

const DeliverableDrawer = ({ id, taskId, project, onClose, onOpenTask, onCloseTask, onChanged }) => {
  const { user } = useAuth()
  const { showNotification } = useNotificationContext()
  const [item, setItem] = useState(null)
  const [options, setOptions] = useState({ workstreams: [], cycles: [], milestones: [] })
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [conflict, setConflict] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [creatingTask, setCreatingTask] = useState(false)
  const [comment, setComment] = useState('')
  const editable = can(user, 'workManagement', 'edit')
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setLoadError('')
    try {
      const [detail, workstreams, cycles, milestones] = await Promise.all([
        workService.deliverable(id),
        workService.workstreams(project.id),
        project.planningMode === 'cycles' ? workService.cycles(project.id) : Promise.resolve({ data: [] }),
        workService.milestones(project.id),
      ])
      setItem(detail.data)
      setOptions({ workstreams: workstreams.data || [], cycles: cycles.data || [], milestones: milestones.data || [] })
    } catch (error) {
      setLoadError(error.message || 'Deliverable details could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [id, project.id, project.planningMode])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])
  useEffect(() => {
    if (!item) return
    const timer = window.setTimeout(() => {
      reset({
        title: item.title || '', description: item.description || '', acceptanceCriteria: item.acceptanceCriteria || '',
        status: item.status || 'backlog', priority: item.priority || 'medium',
        workstreamId: item.workstreamId?._id || item.workstreamId || '', cycleId: item.cycleId?._id || item.cycleId || '',
        milestoneId: item.milestoneId?._id || item.milestoneId || '', ownerId: item.ownerId?._id || item.ownerId || '',
        assignedEmployeeIds: (item.assignedEmployeeIds || []).map((member) => member?._id || member),
        estimatedHours: item.estimatedHours ?? '', storyPoints: item.storyPoints ?? '',
        startDate: toDateInput(item.startDate), dueDate: toDateInput(item.dueDate),
      })
      setConflict(false)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [item, reset])

  const refresh = async () => {
    await load()
    await onChanged?.()
  }

  const save = handleSubmit(async (values) => {
    try {
      await workService.updateDeliverable(item._id, {
        ...values,
        description: values.description || null,
        acceptanceCriteria: values.acceptanceCriteria || null,
        workstreamId: values.workstreamId || null,
        cycleId: values.cycleId || null,
        milestoneId: values.milestoneId || null,
        ownerId: values.ownerId || null,
        estimatedHours: values.estimatedHours === '' ? null : Number(values.estimatedHours),
        storyPoints: values.storyPoints === '' ? null : Number(values.storyPoints),
        startDate: values.startDate || null,
        dueDate: values.dueDate || null,
        version: item.version,
      })
      showNotification({ title: 'Deliverable', message: 'Deliverable updated', variant: 'success' })
      await refresh()
    } catch (error) {
      if (isConflict(error)) setConflict(true)
      if (!setApiFieldErrors(error, setError)) showNotification({ title: 'Deliverable', message: error.message, variant: 'danger' })
    }
  })

  const createTask = async () => {
    if (taskTitle.trim().length < 2) return
    setCreatingTask(true)
    try {
      await workService.createTask(project.id, { deliverableId: item._id, title: taskTitle.trim() })
      setTaskTitle('')
      await refresh()
      showNotification({ title: 'Task', message: 'Task created', variant: 'success' })
    } catch (error) {
      showNotification({ title: 'Task', message: error.message, variant: 'danger' })
    } finally {
      setCreatingTask(false)
    }
  }

  const addComment = async () => {
    if (!comment.trim()) return
    try {
      await workService.addComment({ projectId: project.id, entityType: 'deliverable', entityId: item._id, body: comment.trim() })
      setComment('')
      await load()
    } catch (error) {
      showNotification({ title: 'Comment', message: error.message, variant: 'danger' })
    }
  }

  const selectedTask = useMemo(() => {
    const selected = item?.tasks?.find((task) => task._id === taskId)
    return selected ? { ...selected, reference: `${project.key}-T${selected.referenceNumber}` } : null
  }, [item?.tasks, project.key, taskId])

  return (
    <>
      <Offcanvas show={Boolean(id)} onHide={onClose} placement="end" className="work-drawer" restoreFocus>
        <Offcanvas.Header closeButton><Offcanvas.Title>{item?.reference || 'Deliverable'}</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body>
          {loading && !item ? <DrawerLoading label="Loading Deliverable…" /> : loadError ? <DrawerError message={loadError} onRetry={load} /> : item && (
            <>
              {conflict && <ConflictAlert onReload={load} />}
              <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                <Badge bg="primary-subtle" text="primary">{item.reference}</Badge>
                <span className="text-muted fs-sm">{item.completedTasks || 0}/{item.totalTasks || 0} tasks complete</span>
              </div>
              <ProgressBar now={item.completionPercentage || 0} className="mb-4" style={{ height: 6 }} />
              <Form onSubmit={save} noValidate>
                <Form.Group className="mb-3" controlId="deliverableTitle"><Form.Label>Title</Form.Label><FormControl {...register('title')} disabled={!editable} isInvalid={Boolean(errors.title)} /><Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback></Form.Group>
                <Form.Group className="mb-3" controlId="deliverableDescription"><Form.Label>Description</Form.Label><FormControl as="textarea" rows={3} {...register('description')} disabled={!editable} isInvalid={Boolean(errors.description)} /><Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback></Form.Group>
                <Form.Group className="mb-3" controlId="deliverableAcceptance"><Form.Label>Acceptance criteria</Form.Label><FormControl as="textarea" rows={3} {...register('acceptanceCriteria')} disabled={!editable} isInvalid={Boolean(errors.acceptanceCriteria)} /><Form.Control.Feedback type="invalid">{errors.acceptanceCriteria?.message}</Form.Control.Feedback></Form.Group>
                <Row className="g-3">
                  <Col sm={6}><Form.Group controlId="deliverableStatus"><Form.Label>Status</Form.Label><FormSelect {...register('status')} disabled={!editable}>{['backlog', 'ready', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'].map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}</FormSelect></Form.Group></Col>
                  <Col sm={6}><Form.Group controlId="deliverablePriority"><Form.Label>Priority</Form.Label><FormSelect {...register('priority')} disabled={!editable}>{['low', 'medium', 'high', 'critical'].map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}</FormSelect></Form.Group></Col>
                  <Col sm={6}><Form.Group controlId="deliverableWorkstream"><Form.Label>Workstream</Form.Label><FormSelect {...register('workstreamId')} disabled={!editable}><option value="">Unassigned</option>{options.workstreams.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}</FormSelect></Form.Group></Col>
                  {project.planningMode === 'cycles' && <Col sm={6}><Form.Group controlId="deliverableCycle"><Form.Label>Cycle</Form.Label><FormSelect {...register('cycleId')} disabled={!editable}><option value="">Backlog</option>{options.cycles.filter((entry) => entry.status !== 'completed').map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}</FormSelect></Form.Group></Col>}
                  <Col sm={6}><Form.Group controlId="deliverableMilestone"><Form.Label>Milestone</Form.Label><FormSelect {...register('milestoneId')} disabled={!editable}><option value="">None</option>{options.milestones.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}</FormSelect></Form.Group></Col>
                  <Col sm={6}><Form.Group controlId="deliverableOwner"><Form.Label>Owner</Form.Label><FormSelect {...register('ownerId')} disabled={!can(user, 'workManagement', 'assign')}><option value="">Unassigned</option>{memberOptions(project).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</FormSelect></Form.Group></Col>
                  <Col xs={12}><Form.Group controlId="deliverableAssignees"><Form.Label>Assignees</Form.Label><FormSelect multiple {...register('assignedEmployeeIds')} disabled={!can(user, 'workManagement', 'assign')} style={{ minHeight: 110 }}>{memberOptions(project).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</FormSelect><Form.Text>Use Ctrl or Command to select multiple people.</Form.Text></Form.Group></Col>
                  <Col sm={6}><Form.Group controlId="deliverableEstimate"><Form.Label>Estimated hours</Form.Label><FormControl type="number" min="0" step="0.5" {...register('estimatedHours')} disabled={!editable} /></Form.Group></Col>
                  <Col sm={6}><Form.Group controlId="deliverablePoints"><Form.Label>Story points</Form.Label><FormControl type="number" min="0" step="1" {...register('storyPoints')} disabled={!editable} /></Form.Group></Col>
                  <Col sm={6}><Form.Group controlId="deliverableStart"><Form.Label>Start date</Form.Label><FormControl type="date" {...register('startDate')} disabled={!editable} /></Form.Group></Col>
                  <Col sm={6}><Form.Group controlId="deliverableDue"><Form.Label>Due date</Form.Label><FormControl type="date" {...register('dueDate')} disabled={!editable} isInvalid={Boolean(errors.dueDate)} /><Form.Control.Feedback type="invalid">{errors.dueDate?.message}</Form.Control.Feedback></Form.Group></Col>
                </Row>
                {editable && <div className="d-flex justify-content-end mt-4"><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner size="sm" className="me-2" />}Save Deliverable</Button></div>}
              </Form>

              <section className="border-top mt-4 pt-4" aria-labelledby="deliverable-tasks-heading">
                <div className="d-flex justify-content-between align-items-center"><h5 id="deliverable-tasks-heading">Tasks</h5><Badge bg="light" text="dark">{item.tasks?.length || 0}</Badge></div>
                <div className="vstack gap-2">
                  {(item.tasks || []).map((task) => (
                    <button type="button" className="work-row text-start w-100" key={task._id} onClick={() => onOpenTask(task._id)}>
                      <span className="flex-grow-1 min-w-0"><strong className="d-block text-truncate">{task.title}</strong><span className="text-muted fs-xs">{titleCase(task.status)} · {task.actualHours || 0}h logged</span></span>
                      <Icon icon="chevron-right" />
                    </button>
                  ))}
                  {(item.tasks || []).length === 0 && <p className="text-muted">No Tasks yet.</p>}
                </div>
                {can(user, 'workManagement', 'create') && <div className="d-flex gap-2 mt-3"><FormControl maxLength={200} value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Add a concrete Task" aria-label="New Task title" /><Button type="button" disabled={creatingTask || taskTitle.trim().length < 2} onClick={createTask}><Icon icon="plus" /></Button></div>}
              </section>

              <section className="border-top mt-4 pt-4" aria-labelledby="deliverable-comments-heading">
                <h5 id="deliverable-comments-heading">Comments</h5>
                {(item.comments || []).length === 0 && <p className="text-muted">No comments yet.</p>}
                {(item.comments || []).map((entry) => <div className="comment" key={entry._id}><strong>{entry.authorId?.userId?.fullName || 'Team member'}</strong><p className="text-break mb-1">{entry.body}</p></div>)}
                {can(user, 'collaboration', 'comment') && <div className="d-flex gap-2"><FormControl as="textarea" rows={2} maxLength={5000} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment" aria-label="Deliverable comment" /><Button type="button" disabled={!comment.trim()} onClick={addComment}>Send</Button></div>}
              </section>

              {(item.activity || []).length > 0 && <section className="border-top mt-4 pt-4"><h5>Recent activity</h5>{item.activity.slice(0, 8).map((entry) => <div className="text-muted fs-sm mb-2" key={entry._id}>{entry.action.replaceAll('.', ' ')}</div>)}</section>}
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
      <TaskDrawer task={selectedTask} project={project} show={Boolean(taskId && selectedTask)} onClose={onCloseTask} onChanged={refresh} />
    </>
  )
}

export default DeliverableDrawer
