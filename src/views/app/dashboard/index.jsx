import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { useAuth } from '@/hooks/useAuth'
import { projectService } from '@/services/projectService'
import { workService } from '@/services/workService'
import { hasAnyPermission, hasPermission } from '@/utils/permissions'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, CardBody, Col, ProgressBar, Row, Spinner } from 'react-bootstrap'
import { Link } from 'react-router'

const titleCase = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

const dueBucket = (value) => {
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

const formatDueDate = (value) => value
  ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(value))
  : 'No due date'

const Dashboard = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [work, setWork] = useState({ tasks: [], issues: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const mayViewProjects = hasPermission(user, 'projectManagement', 'view')
  const mayViewWork = hasAnyPermission(user, [
    ['workManagement', 'view'],
    ['projectManagement', 'view'],
  ])
  const showPortfolio = hasAnyPermission(user, [
    ['projectManagement', 'create'],
    ['projectManagement', 'edit'],
  ])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [projectResult, workResult] = await Promise.all([
        mayViewProjects ? projectService.list({ page: 1, limit: 6 }) : Promise.resolve(null),
        mayViewWork ? workService.myWork() : Promise.resolve(null),
      ])
      setProjects(projectResult?.data?.items || [])
      setWork(workResult?.data || { tasks: [], issues: [] })
    } catch (requestError) {
      setError(requestError.message || 'Your workspace summary could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [mayViewProjects, mayViewWork])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const openTasks = useMemo(
    () => (work.tasks || []).filter((task) => !['completed', 'cancelled'].includes(task.status)),
    [work.tasks],
  )
  const openIssues = useMemo(
    () => (work.issues || []).filter((issue) => !['closed', 'rejected', 'resolved'].includes(issue.status)),
    [work.issues],
  )
  const stats = [
    { label: 'Assigned tasks', value: openTasks.length, icon: 'list-checks', tone: 'primary' },
    { label: 'Due today', value: openTasks.filter((task) => dueBucket(task.dueDate) === 'today').length, icon: 'calendar-clock', tone: 'info' },
    { label: 'Overdue', value: openTasks.filter((task) => dueBucket(task.dueDate) === 'overdue').length, icon: 'triangle-alert', tone: 'danger' },
    { label: 'Open issues', value: openIssues.length, icon: 'circle-alert', tone: 'warning' },
  ]

  return (
    <>
      <PageBreadcrumb title="Dashboard" subtitle="Workspace" />
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <h2 className="mb-1">Work that needs attention</h2>
          <p className="text-muted mb-0">A live view of your assignments and the projects you manage.</p>
        </div>
        <Button as={Link} to="/app/my-work" variant="outline-primary">
          Open My Work <Icon icon="arrow-right" className="ms-1" />
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>{error}</span>
          <Button size="sm" variant="outline-danger" onClick={load}>Try again</Button>
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5" role="status">
          <Spinner animation="border" />
          <div className="text-muted mt-2">Loading your workspace…</div>
        </div>
      ) : (
        <>
          <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1 g-3 mb-4">
            {stats.map((stat) => (
              <Col key={stat.label}>
                <Card className="h-100">
                  <CardBody className="d-flex align-items-center justify-content-between gap-3">
                    <div>
                      <div className="text-muted mb-1">{stat.label}</div>
                      <div className="fs-2 fw-semibold lh-1">{stat.value}</div>
                    </div>
                    <span className={`avatar avatar-md avatar-title rounded bg-${stat.tone}-subtle text-${stat.tone}`}>
                      <Icon icon={stat.icon} className="fs-4" />
                    </span>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4">
            <Col xl={showPortfolio ? 7 : 12}>
              <Card className="h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="mb-1">Next assigned work</h4>
                      <p className="text-muted mb-0">Ordered by due date across your projects.</p>
                    </div>
                    <Badge bg="primary-subtle" text="primary">{openTasks.length}</Badge>
                  </div>
                  {openTasks.length === 0 ? (
                    <div className="text-center py-5 border rounded">
                      <Icon icon="circle-check-big" className="fs-1 text-success mb-2" />
                      <h5>No assigned tasks are waiting</h5>
                      <p className="text-muted mb-0">New assignments will appear here.</p>
                    </div>
                  ) : (
                    <div className="vstack gap-2">
                      {openTasks.slice(0, 6).map((task) => (
                        <Link
                          key={task._id}
                          to={`/app/projects/${task.project?._id}/work?deliverable=${task.deliverableId?._id}&task=${task._id}`}
                          className="d-flex align-items-center gap-3 p-3 border rounded text-reset text-decoration-none"
                        >
                          <span className={`avatar avatar-sm avatar-title rounded bg-${dueBucket(task.dueDate) === 'overdue' ? 'danger' : 'primary'}-subtle text-${dueBucket(task.dueDate) === 'overdue' ? 'danger' : 'primary'}`}>
                            <Icon icon="check-square" />
                          </span>
                          <span className="flex-grow-1 min-w-0">
                            <span className="d-block fw-semibold text-truncate">{task.title}</span>
                            <span className="text-muted fs-sm">{task.project?.name} · {task.reference}</span>
                          </span>
                          <span className={`fs-sm ${dueBucket(task.dueDate) === 'overdue' ? 'text-danger' : 'text-muted'}`}>{formatDueDate(task.dueDate)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>

            {showPortfolio && (
              <Col xl={5}>
                <Card className="h-100">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h4 className="mb-1">Project portfolio</h4>
                        <p className="text-muted mb-0">Recently updated project progress.</p>
                      </div>
                      <Button as={Link} to="/app/projects" size="sm" variant="link">View all</Button>
                    </div>
                    {projects.length === 0 ? (
                      <div className="text-center py-5 border rounded">
                        <h5>No projects yet</h5>
                        <p className="text-muted mb-0">Create a project to begin planning work.</p>
                      </div>
                    ) : (
                      <div className="vstack gap-3">
                        {projects.map((project) => (
                          <Link key={project.id} to={`/app/projects/${project.id}/overview`} className="text-reset text-decoration-none">
                            <div className="d-flex justify-content-between gap-3 mb-2">
                              <div className="min-w-0">
                                <div className="fw-semibold text-truncate">{project.name}</div>
                                <div className="text-muted fs-sm">{project.key} · {titleCase(project.health || 'not_set')}</div>
                              </div>
                              <span className="fw-semibold">{project.completionPercentage || 0}%</span>
                            </div>
                            <ProgressBar now={project.completionPercentage || 0} style={{ height: 6 }} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>
            )}
          </Row>
        </>
      )}
    </>
  )
}

export default Dashboard
