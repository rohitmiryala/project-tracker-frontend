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

const issueSchema = z.object({
  title: z.string().trim().min(2, 'Enter at least 2 characters').max(200),
  description: z.string().trim().min(2, 'Describe the issue').max(5000),
  type: z.enum(['bug', 'change_request', 'risk', 'question']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['open', 'triaged', 'in_progress', 'blocked', 'resolved', 'closed', 'rejected']),
  assignedTo: z.string(),
  dueDate: z.string(),
  relatedDeliverableId: z.string(),
  relatedTaskId: z.string(),
  resolution: z.string().trim().max(3000),
})

const IssueDrawer = ({ issue, project, show, onClose, onChanged }) => {
  const { user } = useAuth()
  const { showNotification } = useNotificationContext()
  const [deliverables, setDeliverables] = useState([])
  const [tasks, setTasks] = useState([])
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [error, setErrorMessage] = useState('')
  const [conflict, setConflict] = useState(false)
  const [converting, setConverting] = useState(false)
  const editable = can(user, 'issueManagement', 'edit') || can(user, 'issueManagement', 'resolve')

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(issueSchema) })

  const loadRelated = useCallback(async () => {
    if (!show || !issue?._id) return
    try {
      const [deliverableResponse, taskResponse, commentResponse] = await Promise.all([
        workService.deliverables(project.id),
        workService.tasks(project.id),
        workService.comments({ projectId: project.id, entityType: 'issue', entityId: issue._id }),
      ])
      setDeliverables(deliverableResponse?.data || [])
      setTasks(taskResponse?.data || [])
      setComments(commentResponse?.data || [])
      setErrorMessage('')
    } catch (requestError) {
      setErrorMessage(requestError.message || 'Related issue information could not be loaded.')
    }
  }, [issue, project.id, show])

  useEffect(() => {
    if (!issue) return
    const timer = window.setTimeout(() => {
      reset({
        title: issue.title || '', description: issue.description || '', type: issue.type || 'bug',
        severity: issue.severity || 'medium', status: issue.status || 'open',
        assignedTo: issue.assignedTo?._id || issue.assignedTo || '', dueDate: toDateInput(issue.dueDate),
        relatedDeliverableId: issue.relatedDeliverableId?._id || issue.relatedDeliverableId || '',
        relatedTaskId: issue.relatedTaskId?._id || issue.relatedTaskId || '', resolution: issue.resolution || '',
      })
      setConflict(false)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [issue, reset])
  useEffect(() => {
    const timer = window.setTimeout(loadRelated, 0)
    return () => window.clearTimeout(timer)
  }, [loadRelated])

  const save = handleSubmit(async (values) => {
    try {
      await workService.updateIssue(issue._id, {
        ...values,
        assignedTo: values.assignedTo || null,
        dueDate: values.dueDate || null,
        relatedDeliverableId: values.relatedDeliverableId || null,
        relatedTaskId: values.relatedTaskId || null,
        resolution: values.resolution || null,
        version: issue.version,
      })
      setConflict(false)
      showNotification({ title: 'Issue', message: 'Issue updated', variant: 'success' })
      await onChanged?.()
    } catch (requestError) {
      if (isConflict(requestError)) setConflict(true)
      if (!setApiFieldErrors(requestError, setError)) showNotification({ title: 'Issue', message: requestError.message, variant: 'danger' })
    }
  })

  const addComment = async () => {
    if (!comment.trim()) return
    try {
      await workService.addComment({ projectId: project.id, entityType: 'issue', entityId: issue._id, body: comment.trim() })
      setComment('')
      await loadRelated()
    } catch (requestError) {
      setErrorMessage(requestError.message || 'Comment could not be added.')
    }
  }

  const convert = async () => {
    setConverting(true)
    try {
      await workService.issueToDeliverable(issue._id)
      showNotification({ title: 'Issue', message: 'Deliverable created from issue', variant: 'success' })
      await onChanged?.()
    } catch (requestError) {
      showNotification({ title: 'Issue', message: requestError.message, variant: 'danger' })
    } finally {
      setConverting(false)
    }
  }

  return (
    <Offcanvas show={show} onHide={onClose} placement="end" className="work-drawer" restoreFocus>
      <Offcanvas.Header closeButton><Offcanvas.Title>{issue?.reference || 'Issue details'}</Offcanvas.Title></Offcanvas.Header>
      <Offcanvas.Body>
        {!issue ? <p className="text-muted">Issue details are unavailable.</p> : (
          <>
            {conflict && <ConflictAlert onReload={() => onChanged?.()} />}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={save} noValidate>
              <Form.Group className="mb-3" controlId="issueTitle"><Form.Label>Title</Form.Label><FormControl {...register('title')} disabled={!editable} isInvalid={Boolean(errors.title)} /><Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback></Form.Group>
              <Form.Group className="mb-3" controlId="issueDescription"><Form.Label>Description</Form.Label><FormControl as="textarea" rows={4} {...register('description')} disabled={!editable} isInvalid={Boolean(errors.description)} /><Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback></Form.Group>
              <Row className="g-3">
                <Col sm={6}><Form.Group controlId="issueType"><Form.Label>Type</Form.Label><FormSelect {...register('type')} disabled={!editable}>{['bug', 'change_request', 'risk', 'question'].map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</FormSelect></Form.Group></Col>
                <Col sm={6}><Form.Group controlId="issueSeverity"><Form.Label>Severity</Form.Label><FormSelect {...register('severity')} disabled={!editable}>{['low', 'medium', 'high', 'critical'].map((value) => <option key={value} value={value}>{value}</option>)}</FormSelect></Form.Group></Col>
                <Col sm={6}><Form.Group controlId="issueStatus"><Form.Label>Status</Form.Label><FormSelect {...register('status')} disabled={!editable}>{['open', 'triaged', 'in_progress', 'blocked', 'resolved', 'closed', 'rejected'].map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</FormSelect></Form.Group></Col>
                <Col sm={6}><Form.Group controlId="issueAssignee"><Form.Label>Assignee</Form.Label><FormSelect {...register('assignedTo')} disabled={!can(user, 'issueManagement', 'assign')}><option value="">Unassigned</option>{memberOptions(project).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</FormSelect></Form.Group></Col>
                <Col sm={6}><Form.Group controlId="issueDue"><Form.Label>Due date</Form.Label><FormControl type="date" {...register('dueDate')} disabled={!editable} /></Form.Group></Col>
                <Col sm={6}><Form.Group controlId="issueDeliverable"><Form.Label>Related Deliverable</Form.Label><FormSelect {...register('relatedDeliverableId')} disabled={!editable}><option value="">None</option>{deliverables.map((item) => <option key={item._id} value={item._id}>{item.reference} · {item.title}</option>)}</FormSelect></Form.Group></Col>
                <Col xs={12}><Form.Group controlId="issueTask"><Form.Label>Related Task</Form.Label><FormSelect {...register('relatedTaskId')} disabled={!editable}><option value="">None</option>{tasks.map((item) => <option key={item._id} value={item._id}>{item.reference} · {item.title}</option>)}</FormSelect></Form.Group></Col>
                <Col xs={12}><Form.Group controlId="issueResolution"><Form.Label>Resolution</Form.Label><FormControl as="textarea" rows={3} {...register('resolution')} disabled={!editable} isInvalid={Boolean(errors.resolution)} /><Form.Control.Feedback type="invalid">{errors.resolution?.message}</Form.Control.Feedback></Form.Group></Col>
              </Row>
              <div className="d-flex flex-wrap justify-content-between gap-2 mt-4">
                {!issue.generatedDeliverableId && can(user, 'issueManagement', 'edit') && can(user, 'workManagement', 'create') && <Button type="button" variant="outline-primary" disabled={converting} onClick={convert}>{converting ? 'Creating…' : 'Create Deliverable'}</Button>}
                {issue.generatedDeliverableId && <span className="text-success fs-sm">A Deliverable has already been created for this issue.</span>}
                {editable && <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner size="sm" className="me-2" />}Save issue</Button>}
              </div>
            </Form>

            <section className="border-top mt-4 pt-4" aria-labelledby="issue-comments-heading">
              <h5 id="issue-comments-heading">Comments</h5>
              {comments.length === 0 && <p className="text-muted">No comments yet.</p>}
              {comments.map((entry) => <div className="comment" key={entry._id}><strong>{entry.authorId?.userId?.fullName || 'Team member'}</strong><p className="text-break mb-1">{entry.body}</p></div>)}
              {can(user, 'collaboration', 'comment') && <div className="d-flex gap-2"><FormControl as="textarea" rows={2} maxLength={5000} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment" aria-label="Issue comment" /><Button type="button" disabled={!comment.trim()} onClick={addComment}>Send</Button></div>}
            </section>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  )
}

export default IssueDrawer
