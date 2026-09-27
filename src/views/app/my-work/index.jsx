import Icon from '@/components/wrappers/Icon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { workService } from '@/services/workService'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, CardBody, Col, FormSelect, Row, Spinner } from 'react-bootstrap'
import { Link } from 'react-router'

const titleCase = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())
const dueGroup = (value) => {
  if (!value) return 'upcoming'
  const due = new Date(value); const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  if (due < today) return 'overdue'
  if (due < tomorrow) return 'today'
  return 'upcoming'
}

const MyWork = () => {
  const { showNotification } = useNotificationContext()
  const [data, setData] = useState(null), [filter, setFilter] = useState('all')
  const load = useCallback(() => workService.myWork().then((json) => setData(json.data)), [])
  useEffect(() => { load() }, [load])
  const tasks = useMemo(() => (data?.tasks || []).filter((task) => filter === 'all' || dueGroup(task.dueDate) === filter), [data, filter])
  const update = async (task, status) => {
    try { await workService.updateTask(task._id, { status, version: task.version }); showNotification({ title: 'My Work', message: 'Task updated', variant: 'success' }); load() }
    catch (error) { showNotification({ title: 'My Work', message: error.message, variant: 'danger' }) }
  }
  if (!data) return <div className="text-center py-5"><Spinner animation="border" /></div>
  return <div className="my-work-page">
    <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4"><div><h2>My Work</h2><p className="text-muted mb-0">The tasks and issues that need your attention across every project.</p></div><div className="work-filter">{['all', 'today', 'overdue', 'upcoming'].map((item) => <Button key={item} size="sm" variant={filter === item ? 'primary' : 'light'} onClick={() => setFilter(item)}>{titleCase(item)}</Button>)}</div></div>
    <Row className="g-4"><Col xl={8}><div className="section-heading"><h4>Assigned Tasks</h4><Badge bg="primary">{tasks.length}</Badge></div>{tasks.length === 0 ? <div className="workspace-empty"><div><h4>Nothing waiting here</h4><p>Change the filter or enjoy the breathing room.</p></div></div> : tasks.map((task) => <Card className="my-work-item mb-2" key={task._id}><CardBody><div className="d-flex flex-wrap align-items-center gap-3"><div className={`due-marker ${dueGroup(task.dueDate)}`} /><div className="flex-grow-1"><div className="d-flex align-items-center gap-2"><span className="reference">{task.reference}</span><Badge bg="light" text="dark">{titleCase(task.priority)}</Badge></div><h5 className="mt-1 mb-1">{task.title}</h5><Link to={`/app/projects/${task.project?._id}/work?deliverable=${task.deliverableId?._id}`} className="text-muted fs-sm">{task.project?.name} · {task.deliverableId?.title}</Link></div><FormSelect value={task.status} onChange={(e) => update(task, e.target.value)} className="my-work-status"><option value="to_do">To do</option><option value="in_progress">In progress</option><option value="in_review">In review</option><option value="blocked">Blocked</option><option value="completed">Completed</option></FormSelect></div></CardBody></Card>)}</Col>
      <Col xl={4}><div className="section-heading"><h4>Assigned Issues</h4><Badge bg="danger">{data.issues.length}</Badge></div><Card><CardBody>{data.issues.length === 0 ? <p className="text-muted mb-0">No open Issues assigned to you.</p> : data.issues.map((issue) => <div className="issue-compact" key={issue._id}><div><span className="reference">{issue.reference}</span><strong>{issue.title}</strong><small>{issue.project?.name} · {titleCase(issue.severity)}</small></div><Icon icon="chevron-right" /></div>)}</CardBody></Card></Col></Row>
  </div>
}

export default MyWork
