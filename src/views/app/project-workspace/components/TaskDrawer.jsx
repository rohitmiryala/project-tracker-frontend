import Icon from '@/components/wrappers/Icon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuth } from '@/hooks/useAuth'
import { workService } from '@/services/workService'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Col, Form, FormControl, FormSelect, Offcanvas, Row, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { can, isConflict, memberOptions, setApiFieldErrors, toDateInput } from '../workspaceUtils'
import { ConflictAlert } from './DrawerState'

const taskSchema = z.object({
  title: z.string().trim().min(2, 'Enter at least 2 characters').max(200),
  description: z.string().trim().max(3000),
  status: z.enum(['to_do', 'in_progress', 'in_review', 'blocked', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assignedTo: z.string(),
  estimatedHours: z.union([z.literal(''), z.coerce.number().min(0)]),
  startDate: z.string(),
  dueDate: z.string(),
}).refine((value) => !value.startDate || !value.dueDate || value.dueDate >= value.startDate, {
  path: ['dueDate'], message: 'Due date must be on or after the start date',
})

const TaskDrawer = ({ task, project, show, onClose, onChanged }) => {
  const { user } = useAuth()
  const { showNotification } = useNotificationContext()
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [checklist, setChecklist] = useState([])
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [conflict, setConflict] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [logging, setLogging] = useState(false)
  const [hours, setHours] = useState('')
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [logNote, setLogNote] = useState('')
  const editable = can(user, 'workManagement', 'edit')

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(taskSchema),
  })

  const resetForm = useCallback(() => {
    if (!task) return
    reset({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'to_do',
      priority: task.priority || 'medium',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
      estimatedHours: task.estimatedHours ?? '',
      startDate: toDateInput(task.startDate),
      dueDate: toDateInput(task.dueDate),
    })
    setChecklist((task.checklist || []).map((item) => ({ title: item.title, isCompleted: Boolean(item.isCompleted) })))
    setConflict(false)
  }, [reset, task])

  const loadComments = useCallback(async () => {
    if (!show || !task?._id) return
    try {
      const response = await workService.comments({ projectId: project.id, entityType: 'task', entityId: task._id })
      setComments(response?.data || [])
      setCommentError('')
    } catch (error) {
      setCommentError(error.message || 'Comments could not be loaded.')
    }
  }, [project.id, show, task])

  useEffect(() => {
    const timer = window.setTimeout(resetForm, 0)
    return () => window.clearTimeout(timer)
  }, [resetForm])
  useEffect(() => {
    const timer = window.setTimeout(loadComments, 0)
    return () => window.clearTimeout(timer)
  }, [loadComments])

  const save = handleSubmit(async (values) => {
    try {
      await workService.updateTask(task._id, {
        ...values,
        description: values.description || null,
        assignedTo: values.assignedTo || null,
        estimatedHours: values.estimatedHours === '' ? null : Number(values.estimatedHours),
        startDate: values.startDate || null,
        dueDate: values.dueDate || null,
        checklist,
        version: task.version,
      })
      showNotification({ title: 'Task', message: 'Task updated', variant: 'success' })
      setConflict(false)
      await onChanged?.()
    } catch (error) {
      if (isConflict(error)) setConflict(true)
      if (!setApiFieldErrors(error, setError)) {
        showNotification({ title: 'Task', message: error.message, variant: 'danger' })
      }
    }
  })

  const addComment = async () => {
    if (!comment.trim()) return
    try {
      await workService.addComment({ projectId: project.id, entityType: 'task', entityId: task._id, body: comment.trim() })
      setComment('')
      await loadComments()
    } catch (error) {
      setCommentError(error.message || 'Comment could not be added.')
    }
  }

  const logTime = async () => {
    setLogging(true)
    try {
      await workService.logTime({ taskId: task._id, hoursLogged: Number(hours), date: logDate, note: logNote.trim() || null })
      setHours('')
      setLogNote('')
      showNotification({ title: 'Time log', message: 'Time logged successfully', variant: 'success' })
      await onChanged?.()
    } catch (error) {
      showNotification({ title: 'Time log', message: error.message, variant: 'danger' })
    } finally {
      setLogging(false)
    }
  }

  return (
    <Offcanvas show={show} onHide={onClose} placement="end" className="work-drawer" restoreFocus>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{task?.reference || 'Task details'}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {!task ? <p className="text-muted">Task details are unavailable.</p> : (
          <>
            {conflict && <ConflictAlert onReload={() => onChanged?.()} />}
            <Form onSubmit={save} noValidate>
              <Form.Group className="mb-3" controlId="taskTitle">
                <Form.Label>Title</Form.Label>
                <FormControl {...register('title')} disabled={!editable} isInvalid={Boolean(errors.title)} />
                <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="taskDescription">
                <Form.Label>Description</Form.Label>
                <FormControl as="textarea" rows={3} {...register('description')} disabled={!editable} isInvalid={Boolean(errors.description)} />
                <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
              </Form.Group>
              <Row className="g-3">
                <Col sm={6}><Form.Group controlId="taskStatus"><Form.Label>Status</Form.Label><FormSelect {...register('status')} disabled={!editable}>{['to_do', 'in_progress', 'in_review', 'blocked', 'completed', 'cancelled'].map((value) => <option value={value} key={value}>{value.replaceAll('_', ' ')}</option>)}</FormSelect></Form.Group></Col>
                <Col sm={6}><Form.Group controlId="taskPriority"><Form.Label>Priority</Form.Label><FormSelect {...register('priority')} disabled={!editable}>{['low', 'medium', 'high', 'critical'].map((value) => <option value={value} key={value}>{value}</option>)}</FormSelect></Form.Group></Col>
                <Col sm={6}><Form.Group controlId="taskAssignee"><Form.Label>Assignee</Form.Label><FormSelect {...register('assignedTo')} disabled={!can(user, 'workManagement', 'assign')}><option value="">Unassigned</option>{memberOptions(project).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</FormSelect></Form.Group></Col>
                <Col sm={6}><Form.Group controlId="taskEstimate"><Form.Label>Estimated hours</Form.Label><FormControl type="number" min="0" step="0.5" {...register('estimatedHours')} disabled={!editable} isInvalid={Boolean(errors.estimatedHours)} /><Form.Control.Feedback type="invalid">{errors.estimatedHours?.message}</Form.Control.Feedback></Form.Group></Col>
                <Col sm={6}><Form.Group controlId="taskStart"><Form.Label>Start date</Form.Label><FormControl type="date" {...register('startDate')} disabled={!editable} /></Form.Group></Col>
                <Col sm={6}><Form.Group controlId="taskDue"><Form.Label>Due date</Form.Label><FormControl type="date" {...register('dueDate')} disabled={!editable} isInvalid={Boolean(errors.dueDate)} /><Form.Control.Feedback type="invalid">{errors.dueDate?.message}</Form.Control.Feedback></Form.Group></Col>
              </Row>

              <div className="mt-4">
                <h5>Checklist</h5>
                <div className="vstack gap-2">
                  {checklist.map((item, index) => (
                    <div className="d-flex align-items-center gap-2" key={`${item.title}-${index}`}>
                      <Form.Check checked={item.isCompleted} disabled={!editable} aria-label={`Mark ${item.title} complete`} onChange={(event) => setChecklist((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, isCompleted: event.target.checked } : entry))} />
                      <span className={`flex-grow-1 ${item.isCompleted ? 'text-decoration-line-through text-muted' : ''}`}>{item.title}</span>
                      {editable && <Button type="button" variant="link" className="text-danger p-1" aria-label={`Remove ${item.title}`} onClick={() => setChecklist((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Icon icon="x" /></Button>}
                    </div>
                  ))}
                  {editable && (
                    <div className="d-flex gap-2">
                      <FormControl value={newChecklistItem} maxLength={200} onChange={(event) => setNewChecklistItem(event.target.value)} placeholder="Add checklist item" />
                      <Button type="button" variant="outline-primary" disabled={!newChecklistItem.trim()} onClick={() => { setChecklist((current) => [...current, { title: newChecklistItem.trim(), isCompleted: false }]); setNewChecklistItem('') }}>Add</Button>
                    </div>
                  )}
                </div>
              </div>
              {editable && <div className="d-flex justify-content-end mt-4"><Button type="submit" disabled={isSubmitting || (!isDirty && JSON.stringify(checklist) === JSON.stringify(task.checklist || []))}>{isSubmitting && <Spinner size="sm" className="me-2" />}Save task</Button></div>}
            </Form>

            {can(user, 'timeLogs', 'create') && (
              <section className="border-top mt-4 pt-4" aria-labelledby="task-time-heading">
                <h5 id="task-time-heading">Log time</h5>
                <Row className="g-2">
                  <Col sm={4}><FormControl aria-label="Hours logged" type="number" min="0.5" max="24" step="0.5" value={hours} onChange={(event) => setHours(event.target.value)} placeholder="Hours" /></Col>
                  <Col sm={8}><FormControl aria-label="Work date" type="date" value={logDate} onChange={(event) => setLogDate(event.target.value)} /></Col>
                  <Col xs={12}><FormControl aria-label="Time log note" maxLength={300} value={logNote} onChange={(event) => setLogNote(event.target.value)} placeholder="What did you work on?" /></Col>
                </Row>
                <Button type="button" variant="outline-primary" className="mt-2" disabled={logging || !hours || Number(hours) < 0.5} onClick={logTime}>{logging ? 'Logging…' : 'Log time'}</Button>
              </section>
            )}

            <section className="border-top mt-4 pt-4" aria-labelledby="task-comments-heading">
              <h5 id="task-comments-heading">Comments</h5>
              {commentError && <Alert variant="danger" className="py-2">{commentError}</Alert>}
              {comments.length === 0 && !commentError && <p className="text-muted">No comments yet.</p>}
              {comments.map((entry) => <div className="comment" key={entry._id}><strong>{entry.authorId?.userId?.fullName || 'Team member'}</strong><p className="text-break mb-1">{entry.body}</p></div>)}
              {can(user, 'collaboration', 'comment') && <div className="d-flex gap-2"><FormControl as="textarea" rows={2} maxLength={5000} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment" aria-label="Task comment" /><Button type="button" disabled={!comment.trim()} onClick={addComment}>Send</Button></div>}
            </section>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  )
}

export default TaskDrawer
