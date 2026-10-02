import Icon from '@/components/wrappers/Icon'
import { projectService } from '@/services/projectService'
import { workService } from '@/services/workService'
import DeliverableDrawer from '@/views/app/project-workspace/components/DeliverableDrawer'
import IssueDrawer from '@/views/app/project-workspace/components/IssueDrawer'
import { titleCase } from '@/views/app/project-workspace/workspaceUtils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap'
import { Link, useSearchParams } from 'react-router'

const dueGroup = (value) => {
  if (!value) return 'upcoming'
  const due = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (due < today) return 'overdue'
  if (due < tomorrow) return 'today'
  return 'upcoming'
}

const formatDue = (value) => value
  ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
  : 'No due date'

const MyWork = () => {
  const [data, setData] = useState({ tasks: [], issues: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drawerProject, setDrawerProject] = useState(null)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeBucket = searchParams.get('bucket') || 'all'
  const deliverableId = searchParams.get('deliverable')
  const taskId = searchParams.get('task')
  const issueId = searchParams.get('issue')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await workService.myWork()
      setData(response.data || { tasks: [], issues: [] })
    } catch (requestError) {
      setError(requestError.message || 'Your work could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const openItems = useMemo(() => ({
    tasks: (data.tasks || []).filter((task) => !['completed', 'cancelled'].includes(task.status)),
    issues: (data.issues || []).filter((issue) => !['resolved', 'closed', 'rejected'].includes(issue.status)),
  }), [data])
  const counts = useMemo(() => ({
    all: openItems.tasks.length,
    today: openItems.tasks.filter((task) => dueGroup(task.dueDate) === 'today').length,
    overdue: openItems.tasks.filter((task) => dueGroup(task.dueDate) === 'overdue').length,
    upcoming: openItems.tasks.filter((task) => dueGroup(task.dueDate) === 'upcoming').length,
  }), [openItems.tasks])
  const visibleTasks = activeBucket === 'all' ? openItems.tasks : openItems.tasks.filter((task) => dueGroup(task.dueDate) === activeBucket)

  const setQuery = (updates) => setSearchParams((current) => {
    const next = new URLSearchParams(current)
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key))
    return next
  }, { replace: true })

  const loadProject = useCallback(async (projectId) => {
    if (!projectId) return
    setDrawerLoading(true)
    try {
      const response = await projectService.getById(projectId)
      setDrawerProject(response.data)
    } catch (requestError) {
      setError(requestError.message || 'The related project could not be loaded.')
    } finally {
      setDrawerLoading(false)
    }
  }, [])

  const openTask = async (task) => {
    await loadProject(task.project?._id)
    setQuery({ deliverable: task.deliverableId?._id, task: task._id, issue: '' })
  }
  const openIssue = async (issue) => {
    await loadProject(issue.project?._id)
    setQuery({ issue: issue._id, deliverable: '', task: '' })
  }

  const selectedTask = data.tasks?.find((task) => task._id === taskId)
  const selectedIssue = data.issues?.find((issue) => issue._id === issueId)

  useEffect(() => {
    const selected = selectedTask || selectedIssue
    if (!selected || drawerProject) return undefined
    const timer = window.setTimeout(() => loadProject(selected.project?._id), 0)
    return () => window.clearTimeout(timer)
  }, [drawerProject, loadProject, selectedIssue, selectedTask])

  return <div className="my-work-page">
    <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4"><div><h2 className="mb-1">My Work</h2><p className="text-muted mb-0">Tasks and Issues assigned to you across every project.</p></div><Button as={Link} to="/app/projects" variant="outline-primary">Browse projects</Button></div>
    {error && <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-2"><span>{error}</span><Button size="sm" variant="outline-danger" onClick={load}>Try again</Button></Alert>}
    {loading ? <div className="text-center py-5" role="status"><Spinner animation="border" /><div className="text-muted mt-2">Loading your assigned work…</div></div> : <>
      <Row className="row-cols-xl-4 row-cols-sm-2 row-cols-1 g-3 mb-4">
        {[['all', 'Assigned Tasks', 'list-checks'], ['today', 'Due today', 'calendar-clock'], ['overdue', 'Overdue', 'triangle-alert'], ['upcoming', 'Upcoming', 'calendar-days']].map(([bucket, label, icon]) => <Col key={bucket}><button type="button" className={`card w-100 h-100 text-start ${activeBucket === bucket ? 'border-primary' : ''}`} onClick={() => setQuery({ bucket: bucket === 'all' ? '' : bucket })}><CardBody className="d-flex align-items-center justify-content-between gap-3"><div><div className="text-muted">{label}</div><div className="fs-2 fw-semibold">{counts[bucket]}</div></div><Icon icon={icon} className={`fs-3 ${bucket === 'overdue' ? 'text-danger' : 'text-primary'}`} /></CardBody></button></Col>)}
      </Row>
      <Row className="g-4">
        <Col xl={8}>
          <div className="section-heading"><h4>{activeBucket === 'all' ? 'Assigned Tasks' : titleCase(activeBucket)}</h4><Badge bg="primary">{visibleTasks.length}</Badge></div>
          {visibleTasks.length === 0 ? <div className="workspace-empty"><div><h4>Nothing waiting here</h4><p>Change the date group or enjoy the breathing room.</p></div></div> : visibleTasks.map((task) => <Card className="my-work-item mb-2" key={task._id}><CardBody><div className="d-flex flex-wrap align-items-center gap-3"><div className={`due-marker ${dueGroup(task.dueDate)}`} /><div className="flex-grow-1 min-w-0"><div className="d-flex align-items-center gap-2"><span className="reference">{task.reference}</span><Badge bg="light" text="dark">{titleCase(task.priority)}</Badge></div><h5 className="mt-1 mb-1 text-break">{task.title}</h5><span className="text-muted fs-sm">{task.project?.name} · {task.deliverableId?.title} · {formatDue(task.dueDate)}</span></div><Button variant="outline-primary" size="sm" onClick={() => openTask(task)}>Open Task</Button></div></CardBody></Card>)}
        </Col>
        <Col xl={4}>
          <div className="section-heading"><h4>Assigned Issues</h4><Badge bg="danger">{openItems.issues.length}</Badge></div>
          <Card><CardBody>{openItems.issues.length === 0 ? <div className="text-center py-4"><Icon icon="circle-check" className="fs-2 text-success mb-2" /><p className="text-muted mb-0">No open Issues assigned to you.</p></div> : openItems.issues.map((issue) => <button type="button" className="issue-compact text-start w-100 bg-transparent" key={issue._id} onClick={() => openIssue(issue)}><div className="min-w-0"><span className="reference">{issue.reference}</span><strong className="text-break">{issue.title}</strong><small>{issue.project?.name} · {titleCase(issue.severity)}</small></div><Icon icon="chevron-right" /></button>)}</CardBody></Card>
        </Col>
      </Row>
    </>}
    {drawerLoading && <div className="position-fixed bottom-0 end-0 m-3 p-3 bg-body border rounded shadow" role="status"><Spinner size="sm" className="me-2" />Opening details…</div>}
    {drawerProject && <DeliverableDrawer id={deliverableId} taskId={taskId} project={drawerProject} onClose={() => { setQuery({ deliverable: '', task: '' }); setDrawerProject(null) }} onOpenTask={(id) => setQuery({ task: id })} onCloseTask={() => setQuery({ task: '' })} onChanged={load} />}
    {drawerProject && <IssueDrawer issue={selectedIssue} project={drawerProject} show={Boolean(issueId && selectedIssue)} onClose={() => { setQuery({ issue: '' }); setDrawerProject(null) }} onChanged={load} />}
  </div>
}

export default MyWork
