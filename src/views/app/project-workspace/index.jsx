import Icon from '@/components/wrappers/Icon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuth } from '@/hooks/useAuth'
import { projectService } from '@/services/projectService'
import { workService } from '@/services/workService'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert, Badge, Button, Card, CardBody, Col, FormControl, FormSelect,
  Modal, Nav, ProgressBar, Row, Spinner, Table,
} from 'react-bootstrap'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { z } from 'zod'
import ProjectWizardModal from '../projects/components/ProjectWizardModal'
import DeliverableDrawer from './components/DeliverableDrawer'
import EntityModal from './components/EntityModal'
import IssueDrawer from './components/IssueDrawer'
import { can, formatCurrency, formatDate, memberOptions, titleCase, toDateInput } from './workspaceUtils'

const priorities = ['low', 'medium', 'high', 'critical']
const deliverableStatuses = ['backlog', 'ready', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled']
const issueStatuses = ['open', 'triaged', 'in_progress', 'blocked', 'resolved', 'closed', 'rejected']

const optionalText = (max) => z.string().trim().max(max)
const workstreamSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(150),
  description: optionalText(1000), ownerId: z.string(), status: z.enum(['planned', 'active', 'on_hold', 'completed', 'cancelled']),
  priority: z.enum(priorities), color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Choose a valid color'), startDate: z.string(), targetDate: z.string(),
})
const deliverableSchema = z.object({
  title: z.string().trim().min(2, 'Enter at least 2 characters').max(200), description: optionalText(3000),
  workstreamId: z.string(), priority: z.enum(priorities), estimatedHours: z.union([z.literal(''), z.coerce.number().min(0)]),
})
const cycleSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(150), goal: optionalText(1000), startDate: z.string().min(1, 'Choose a start date'),
  endDate: z.string().min(1, 'Choose an end date'), capacityHours: z.coerce.number().min(0),
}).refine((value) => value.endDate > value.startDate, { path: ['endDate'], message: 'End date must be after the start date' })
const issueSchema = z.object({
  title: z.string().trim().min(2, 'Enter at least 2 characters').max(200), description: z.string().trim().min(2, 'Describe the issue').max(5000),
  type: z.enum(['bug', 'change_request', 'risk', 'question']), severity: z.enum(priorities),
})
const milestoneSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(150), description: optionalText(1000),
  dueDate: z.string().min(1, 'Choose a due date'), status: z.enum(['upcoming', 'at_risk', 'completed', 'missed', 'cancelled']), isContractual: z.boolean(),
})

const LoadingState = ({ label }) => <div className="text-center py-5" role="status"><Spinner animation="border" /><div className="text-muted mt-2">{label}</div></div>
const ErrorState = ({ message, retry }) => <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-2"><span>{message}</span><Button size="sm" variant="outline-danger" onClick={retry}>Try again</Button></Alert>

const tabDefinitions = (user, project) => [
  ['overview', 'Overview', true],
  ['work', 'Work', can(user, 'workManagement', 'view')],
  ['cycles', 'Cycles', project.planningMode === 'cycles' && can(user, 'cycleManagement', 'view')],
  ['issues', 'Issues', can(user, 'issueManagement', 'view')],
  ['timeline', 'Timeline', can(user, 'milestoneManagement', 'view')],
  ['team', 'Team', can(user, 'projectManagement', 'view')],
  ['costs', 'Costs', ['viewBudget', 'viewCost', 'viewProfit'].some((action) => can(user, 'budgetAndFinance', action))],
  ['activity', 'Activity', can(user, 'workManagement', 'view')],
  ['settings', 'Settings', can(user, 'settings', 'view') || can(user, 'projectManagement', 'edit')],
].filter(([, , allowed]) => allowed)

const WorkspaceHeader = ({ project, tabs }) => {
  const location = useLocation()
  return (
    <div className="workspace-header mb-4">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
        <div className="min-w-0">
          <Link to="/app/projects" className="text-muted fs-sm"><Icon icon="arrow-left" className="me-1" />All projects</Link>
          <div className="d-flex align-items-center gap-2 mt-2">
            <span className="project-key">{project.key}</span>
            <Badge bg={project.health === 'on_track' ? 'success' : project.health === 'at_risk' ? 'warning' : 'danger'}>{titleCase(project.health || 'not_set')}</Badge>
          </div>
          <h2 className="mt-2 mb-1 text-break">{project.name}</h2>
          <p className="text-muted mb-0">{project.client?.name || 'No client'} · {project.planningMode === 'cycles' ? 'Cycle planning' : 'Continuous flow'}</p>
        </div>
        <div className="workspace-progress">
          <div className="d-flex justify-content-between fs-sm mb-1"><span>Project progress</span><strong>{project.completionPercentage || 0}%</strong></div>
          <ProgressBar now={project.completionPercentage || 0} />
        </div>
      </div>
      <Nav className="workspace-tabs flex-nowrap overflow-auto" aria-label="Project sections">
        {tabs.map(([slug, label]) => <Nav.Item key={slug}><Nav.Link as={Link} active={location.pathname.includes(`/projects/${project.id}/${slug}`)} to={`/app/projects/${project.id}/${slug}`}>{label}</Nav.Link></Nav.Item>)}
      </Nav>
    </div>
  )
}

const OverviewView = ({ project }) => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setError('')
    try { const response = await workService.overview(project.id); setData(response.data) }
    catch (requestError) { setError(requestError.message || 'Project overview could not be loaded.') }
  }, [project.id])
  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])
  if (error) return <ErrorState message={error} retry={load} />
  if (!data) return <LoadingState label="Loading project overview…" />
  const stats = [
    ['Deliverables', data.counts.deliverables, 'package-check'], ['Tasks done', `${data.counts.completedTasks}/${data.counts.tasks}`, 'list-checks'],
    ['Open issues', data.counts.openIssues, 'circle-alert'], ['Workstreams', data.counts.workstreams, 'layers-3'],
  ]
  return <>
    {project.isSample && <Alert variant="primary" className="d-flex align-items-start gap-3 mb-4">
      <Icon icon="sparkles" className="fs-4 flex-shrink-0 mt-1" aria-hidden="true" />
      <div>
        <strong className="d-block mb-1">Explore a complete project workflow</strong>
        <span>This is editable sample data. Try moving Deliverables, updating Tasks, resolving Issues, or logging time. Delete the sample when your team no longer needs it.</span>
      </div>
    </Alert>}
    {data.counts.deliverables === 0 && <div className="workspace-empty mb-4"><div><h4>Shape the first piece of work</h4><p>Start with a Deliverable. Add a Workstream only when the project needs another layer of organization.</p></div>{can(user, 'workManagement', 'create') && <div className="d-flex flex-wrap gap-2"><Button as={Link} to={`/app/projects/${project.id}/work?create=deliverable`}><Icon icon="plus" className="me-1" />Create first Deliverable</Button><Button as={Link} to={`/app/projects/${project.id}/work?create=workstream`} variant="outline-primary">Add Workstream</Button>{project.planningMode === 'cycles' && can(user, 'cycleManagement', 'create') && <Button as={Link} to={`/app/projects/${project.id}/cycles`} variant="outline-primary">Plan a Cycle</Button>}</div>}</div>}
    <Row className="g-3 mb-4">{stats.map(([label, value, icon]) => <Col lg={3} sm={6} key={label}><Card className="h-100"><CardBody><Icon icon={icon} className="text-primary fs-3" /><div className="fs-2 fw-semibold mt-3">{value}</div><div className="text-muted">{label}</div></CardBody></Card></Col>)}</Row>
    <Row className="g-3">
      <Col lg={7}><Card className="h-100"><CardBody><h5>Delivery pulse</h5><div className="d-flex justify-content-between mt-4"><span>Overall completion</span><strong>{project.completionPercentage || 0}%</strong></div><ProgressBar now={project.completionPercentage || 0} className="mt-2" /><div className="d-flex justify-content-between mt-4 text-muted"><span>Target finish</span><span>{formatDate(project.estimatedEndDate)}</span></div></CardBody></Card></Col>
      <Col lg={5}><Card className="h-100"><CardBody><h5>{data.activeCycle ? 'Active Cycle' : 'Next milestone'}</h5>{data.activeCycle ? <><h4 className="mt-3">{data.activeCycle.name}</h4><p className="text-muted">{data.activeCycle.goal || 'No Cycle goal added.'}</p><span>{formatDate(data.activeCycle.startDate)} – {formatDate(data.activeCycle.endDate)}</span></> : data.milestones?.[0] ? <><h4 className="mt-3">{data.milestones[0].name}</h4><p className="text-muted mb-0">Due {formatDate(data.milestones[0].dueDate)}</p></> : <p className="text-muted mt-3">No milestone planned yet.</p>}</CardBody></Card></Col>
    </Row>
  </>
}

const WorkView = ({ project }) => {
  const { user } = useAuth()
  const { showNotification } = useNotificationContext()
  const [workstreams, setWorkstreams] = useState([])
  const [deliverables, setDeliverables] = useState([])
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [editingWorkstream, setEditingWorkstream] = useState(null)
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', workstreamId: '', cycleId: '', ownerId: '' })
  const [searchParams, setSearchParams] = useSearchParams()
  const deliverableId = searchParams.get('deliverable')
  const taskId = searchParams.get('task')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [workstreamResponse, deliverableResponse, cycleResponse] = await Promise.all([
        workService.workstreams(project.id), workService.deliverables(project.id, filters),
        project.planningMode === 'cycles' ? workService.cycles(project.id) : Promise.resolve({ data: [] }),
      ])
      setWorkstreams(workstreamResponse.data || []); setDeliverables(deliverableResponse.data || []); setCycles(cycleResponse.data || [])
    } catch (requestError) { setError(requestError.message || 'Project work could not be loaded.') }
    finally { setLoading(false) }
  }, [filters, project.id, project.planningMode])
  useEffect(() => { const timer = setTimeout(load, 300); return () => clearTimeout(timer) }, [load])

  useEffect(() => {
    const createAction = searchParams.get('create')
    if (!['deliverable', 'workstream'].includes(createAction)) return undefined
    const timer = window.setTimeout(() => {
      setEditingWorkstream(null)
      setModal(createAction)
      setSearchParams((current) => { const next = new URLSearchParams(current); next.delete('create'); return next }, { replace: true })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [searchParams, setSearchParams])

  const updateQuery = (updates) => setSearchParams((current) => { const next = new URLSearchParams(current); Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key)); return next }, { replace: true })
  const groups = useMemo(() => [
    ...workstreams.map((stream) => ({ ...stream, items: deliverables.filter((item) => (item.workstreamId?._id || item.workstreamId) === stream._id) })),
    { _id: 'unassigned', name: 'Unassigned', description: 'Deliverables without a Workstream', items: deliverables.filter((item) => !item.workstreamId) },
  ].filter((group) => group.items.length > 0 || group._id !== 'unassigned' || deliverables.length === 0), [deliverables, workstreams])

  const saveWorkstream = async (values) => {
    const payload = { ...values, description: values.description || null, ownerId: values.ownerId || null, startDate: values.startDate || null, targetDate: values.targetDate || null }
    if (editingWorkstream) await workService.updateWorkstream(editingWorkstream._id, { ...payload, version: editingWorkstream.version })
    else await workService.createWorkstream(project.id, payload)
    showNotification({ title: 'Work', message: editingWorkstream ? 'Workstream updated' : 'Workstream created', variant: 'success' }); await load()
  }
  const createDeliverable = async (values) => {
    await workService.createDeliverable(project.id, { ...values, description: values.description || null, workstreamId: values.workstreamId || null, estimatedHours: values.estimatedHours === '' ? null : Number(values.estimatedHours) })
    showNotification({ title: 'Work', message: 'Deliverable created', variant: 'success' }); await load()
  }
  const workstreamDefaults = editingWorkstream ? {
    name: editingWorkstream.name || '', description: editingWorkstream.description || '', ownerId: editingWorkstream.ownerId?._id || editingWorkstream.ownerId || '',
    status: editingWorkstream.status || 'planned', priority: editingWorkstream.priority || 'medium', color: editingWorkstream.color || '#5b5bd6',
    startDate: toDateInput(editingWorkstream.startDate), targetDate: toDateInput(editingWorkstream.targetDate),
  } : { name: '', description: '', ownerId: '', status: 'planned', priority: 'medium', color: '#5b5bd6', startDate: '', targetDate: '' }

  return <>
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
      <div><h4 className="mb-1">Deliverables</h4><p className="text-muted mb-0">Outcomes grouped by the Workstream they support.</p></div>
      {can(user, 'workManagement', 'create') && <div className="d-flex gap-2"><Button variant="outline-primary" onClick={() => { setEditingWorkstream(null); setModal('workstream') }}>Add Workstream</Button><Button onClick={() => setModal('deliverable')}><Icon icon="plus" className="me-1" />Add Deliverable</Button></div>}
    </div>
    <Card className="mb-4"><CardBody><Row className="g-2"><Col xl={project.planningMode === 'cycles' ? 3 : 4} lg={4}><FormControl aria-label="Search Deliverables" placeholder="Search Deliverables" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} /></Col><Col sm={6} lg={2}><FormSelect aria-label="Filter by status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">All statuses</option>{deliverableStatuses.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}</FormSelect></Col><Col sm={6} lg={2}><FormSelect aria-label="Filter by priority" value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}><option value="">All priorities</option>{priorities.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}</FormSelect></Col><Col sm={6} lg={2}><FormSelect aria-label="Filter by Workstream" value={filters.workstreamId} onChange={(event) => setFilters((current) => ({ ...current, workstreamId: event.target.value }))}><option value="">All Workstreams</option>{workstreams.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</FormSelect></Col>{project.planningMode === 'cycles' && <Col sm={6} lg={2}><FormSelect aria-label="Filter by Cycle" value={filters.cycleId} onChange={(event) => setFilters((current) => ({ ...current, cycleId: event.target.value }))}><option value="">All Cycles</option>{cycles.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</FormSelect></Col>}<Col sm={6} lg={2}><FormSelect aria-label="Filter by owner" value={filters.ownerId} onChange={(event) => setFilters((current) => ({ ...current, ownerId: event.target.value }))}><option value="">All owners</option>{memberOptions(project).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</FormSelect></Col></Row></CardBody></Card>
    {error && <ErrorState message={error} retry={load} />}
    {loading ? <LoadingState label="Loading Deliverables…" /> : deliverables.length === 0 && !Object.values(filters).some(Boolean) ? <div className="workspace-empty"><div><h4>No Deliverables yet</h4><p>Define the first outcome this project must produce.</p></div>{can(user, 'workManagement', 'create') && <Button onClick={() => setModal('deliverable')}>Create Deliverable</Button>}</div> : deliverables.length === 0 ? <div className="text-center py-5 border rounded"><h5>No matching Deliverables</h5><p className="text-muted mb-0">Clear or change the filters to see more work.</p></div> : <div className="vstack gap-4">{groups.map((group) => <section key={group._id} className="workstream-section"><div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3"><div className="d-flex align-items-start gap-2"><span className="workstream-color mt-1" style={{ backgroundColor: group.color || 'var(--bs-secondary)' }} /><div><h5 className="mb-1">{group.name} <Badge bg="light" text="dark">{group.items.length}</Badge></h5>{group.description && <p className="text-muted fs-sm mb-0">{group.description}</p>}</div></div>{group._id !== 'unassigned' && can(user, 'workManagement', 'edit') && <Button size="sm" variant="link" onClick={() => { setEditingWorkstream(group); setModal('workstream') }}>Edit Workstream</Button>}</div><div className="deliverable-grid">{group.items.map((item) => <button type="button" className="deliverable-card mb-0" key={item._id} onClick={() => updateQuery({ deliverable: item._id, task: '' })}><div className="d-flex justify-content-between gap-2"><span className="reference">{item.reference}</span><span className={`priority priority-${item.priority}`}>{item.priority}</span></div><strong className="text-break">{item.title}</strong><small>{titleCase(item.status)} · {item.totalTasks || 0} Tasks</small><ProgressBar now={item.completionPercentage || 0} /></button>)}</div></section>)}</div>}
    <EntityModal show={modal === 'workstream'} title={editingWorkstream ? 'Edit Workstream' : 'New Workstream'} fields={[{ name: 'name', label: 'Name', required: true, maxLength: 150 }, { name: 'description', label: 'Description', type: 'textarea', maxLength: 1000 }, { name: 'ownerId', label: 'Owner', type: 'select', options: memberOptions(project) }, { name: 'status', label: 'Status', type: 'select', allowEmpty: false, options: ['planned', 'active', 'on_hold', 'completed', 'cancelled'].map((value) => ({ value, label: titleCase(value) })) }, { name: 'priority', label: 'Priority', type: 'select', allowEmpty: false, options: priorities.map((value) => ({ value, label: titleCase(value) })) }, { name: 'color', label: 'Color', type: 'color' }, { name: 'startDate', label: 'Start date', type: 'date' }, { name: 'targetDate', label: 'Target date', type: 'date' }]} schema={workstreamSchema} defaultValues={workstreamDefaults} onClose={() => { setModal(null); setEditingWorkstream(null) }} onSubmit={saveWorkstream} />
    <EntityModal show={modal === 'deliverable'} title="New Deliverable" submitLabel="Create Deliverable" fields={[{ name: 'title', label: 'Outcome to deliver', required: true, maxLength: 200 }, { name: 'description', label: 'Description', type: 'textarea', maxLength: 3000 }, { name: 'workstreamId', label: 'Workstream', type: 'select', options: workstreams.map((item) => ({ value: item._id, label: item.name })) }, { name: 'priority', label: 'Priority', type: 'select', allowEmpty: false, options: priorities.map((value) => ({ value, label: titleCase(value) })) }, { name: 'estimatedHours', label: 'Estimated hours', type: 'number', min: 0, step: 0.5 }]} schema={deliverableSchema} defaultValues={{ title: '', description: '', workstreamId: '', priority: 'medium', estimatedHours: '' }} onClose={() => setModal(null)} onSubmit={createDeliverable} />
    <DeliverableDrawer id={deliverableId} taskId={taskId} project={project} onClose={() => updateQuery({ deliverable: '', task: '' })} onOpenTask={(id) => updateQuery({ task: id })} onCloseTask={() => updateQuery({ task: '' })} onChanged={load} />
  </>
}

const CyclesView = ({ project }) => {
  const { user } = useAuth(); const { showNotification } = useNotificationContext(); const navigate = useNavigate(); const { cycleId } = useParams()
  const [cycles, setCycles] = useState([]); const [deliverables, setDeliverables] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const [modal, setModal] = useState(null); const [editing, setEditing] = useState(null); const [closeCycle, setCloseCycle] = useState(null); const [destination, setDestination] = useState('backlog'); const [moving, setMoving] = useState('')
  const load = useCallback(async () => { setLoading(true); setError(''); try { const [cycleResponse, deliverableResponse] = await Promise.all([workService.cycles(project.id), workService.deliverables(project.id)]); setCycles(cycleResponse.data || []); setDeliverables(deliverableResponse.data || []) } catch (requestError) { setError(requestError.message || 'Cycles could not be loaded.') } finally { setLoading(false) } }, [project.id])
  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])
  const selected = cycles.find((cycle) => cycle._id === cycleId) || cycles.find((cycle) => cycle.status === 'active') || cycles.find((cycle) => cycle.status === 'planned') || cycles[0]
  useEffect(() => { if (!cycleId && selected?._id) navigate(`/app/projects/${project.id}/cycles/${selected._id}`, { replace: true }) }, [cycleId, navigate, project.id, selected?._id])
  const backlog = deliverables.filter((item) => !item.cycleId); const scheduled = selected ? deliverables.filter((item) => (item.cycleId?._id || item.cycleId) === selected._id) : []
  const plannedHours = scheduled.reduce((total, item) => total + Number(item.estimatedHours || 0), 0)
  const run = async (action, message) => { try { await action(); showNotification({ title: 'Cycles', message, variant: 'success' }); await load() } catch (requestError) { setError(requestError.message); throw requestError } }
  const move = async (item, cycle) => { if (!can(user, 'workManagement', 'move')) return; setMoving(item._id); try { await run(() => workService.moveDeliverable(item._id, { cycleId: cycle?._id || null, version: item.version }), cycle ? 'Deliverable scheduled' : 'Deliverable returned to backlog') } finally { setMoving('') } }
  const saveCycle = async (values) => { const payload = { ...values, capacityHours: Number(values.capacityHours || 0) }; if (editing) await run(() => workService.updateCycle(editing._id, { ...payload, version: editing.version }), 'Cycle updated'); else await run(() => workService.createCycle(project.id, payload), 'Cycle created') }
  const closeSelectedCycle = async () => { const body = { version: closeCycle.version, ...(destination === 'backlog' ? { returnToBacklog: true } : { destinationCycleId: destination }) }; await run(() => workService.cycleAction(closeCycle._id, 'close', body), 'Cycle closed'); setCloseCycle(null) }
  if (error && !cycles.length) return <ErrorState message={error} retry={load} />
  if (loading && !cycles.length) return <LoadingState label="Loading Cycles…" />
  return <>
    {error && <Alert variant="warning" dismissible onClose={() => setError('')}>{error}</Alert>}
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3"><div><h4 className="mb-1">Cycle planning</h4><p className="text-muted mb-0">Plan Deliverables as outcomes; their Tasks follow automatically.</p></div>{can(user, 'cycleManagement', 'create') && <Button onClick={() => { setEditing(null); setModal('cycle') }}>Create Cycle</Button>}</div>
    {cycles.length === 0 ? <div className="workspace-empty"><div><h4>No Cycles planned</h4><p>Create a time-boxed planning window and move Deliverables from the backlog.</p></div>{can(user, 'cycleManagement', 'create') && <Button onClick={() => setModal('cycle')}>Create Cycle</Button>}</div> : <>
      <div className="d-flex gap-2 overflow-auto pb-2 mb-3">{cycles.map((cycle) => <Button key={cycle._id} variant={selected?._id === cycle._id ? 'primary' : 'outline-secondary'} className="text-nowrap" onClick={() => navigate(`/app/projects/${project.id}/cycles/${cycle._id}`)}>{cycle.name} <Badge bg={cycle.status === 'active' ? 'success' : 'light'} text={cycle.status === 'active' ? undefined : 'dark'} className="ms-1">{titleCase(cycle.status)}</Badge></Button>)}</div>
      {selected && <Card className="mb-3"><CardBody><div className="d-flex flex-wrap justify-content-between gap-3"><div><h4 className="mb-1">{selected.name}</h4><p className="text-muted mb-1">{selected.goal || 'No goal set.'}</p><span className="fs-sm">{formatDate(selected.startDate)} – {formatDate(selected.endDate)}</span></div><div className="text-end"><div className="fs-4 fw-semibold">{plannedHours}/{selected.capacityHours || 0}h</div><div className="text-muted fs-sm">planned capacity</div></div></div><ProgressBar className="mt-3" variant={plannedHours > Number(selected.capacityHours || 0) ? 'warning' : 'primary'} now={selected.capacityHours ? Math.min(100, (plannedHours / selected.capacityHours) * 100) : 0} /><div className="d-flex flex-wrap gap-2 mt-3">{selected.status !== 'completed' && can(user, 'cycleManagement', 'edit') && <Button size="sm" variant="outline-secondary" onClick={() => { setEditing(selected); setModal('cycle') }}>Edit</Button>}{selected.status === 'planned' && can(user, 'cycleManagement', 'start') && <Button size="sm" onClick={() => run(() => workService.cycleAction(selected._id, 'start', { version: selected.version }), 'Cycle started')}>Start Cycle</Button>}{selected.status === 'active' && can(user, 'cycleManagement', 'close') && <Button size="sm" variant="outline-primary" onClick={() => { setDestination('backlog'); setCloseCycle(selected) }}>Close Cycle</Button>}{selected.status === 'completed' && can(user, 'cycleManagement', 'close') && <Button size="sm" variant="outline-primary" onClick={() => run(() => workService.cycleAction(selected._id, 'reopen', { version: selected.version }), 'Cycle reopened')}>Reopen Cycle</Button>}</div></CardBody></Card>}
      <div className="cycle-planner-grid">
        <section className="planning-panel" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const item = deliverables.find((entry) => entry._id === event.dataTransfer.getData('text/plain')); if (item) move(item, null) }}><div className="planning-panel__header"><div><h5>Project backlog</h5><p>{backlog.length} unscheduled Deliverables</p></div></div>{backlog.length === 0 ? <p className="text-muted p-3">The backlog is empty.</p> : backlog.map((item) => <div className="planning-card" draggable={can(user, 'workManagement', 'move')} onDragStart={(event) => event.dataTransfer.setData('text/plain', item._id)} key={item._id}><div><span className="reference">{item.reference}</span><strong>{item.title}</strong><small>{item.estimatedHours || 0}h · {titleCase(item.priority)}</small></div>{can(user, 'workManagement', 'move') && selected?.status !== 'completed' && <Button size="sm" variant="outline-primary" disabled={moving === item._id} onClick={() => move(item, selected)}>Add</Button>}</div>)}</section>
        <section className="planning-panel" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const item = deliverables.find((entry) => entry._id === event.dataTransfer.getData('text/plain')); if (item && selected?.status !== 'completed') move(item, selected) }}><div className="planning-panel__header"><div><h5>{selected?.name || 'Selected Cycle'}</h5><p>{scheduled.length} scheduled Deliverables</p></div></div>{scheduled.length === 0 ? <p className="text-muted p-3">Move Deliverables here to plan the Cycle.</p> : scheduled.map((item) => <div className="planning-card" draggable={can(user, 'workManagement', 'move') && selected?.status !== 'completed'} onDragStart={(event) => event.dataTransfer.setData('text/plain', item._id)} key={item._id}><div><span className="reference">{item.reference}</span><strong>{item.title}</strong><small>{item.estimatedHours || 0}h · {titleCase(item.status)}</small></div>{can(user, 'workManagement', 'move') && selected?.status !== 'completed' && <Button size="sm" variant="outline-secondary" disabled={moving === item._id} onClick={() => move(item, null)}>Backlog</Button>}</div>)}</section>
      </div>
    </>}
    <EntityModal show={modal === 'cycle'} title={editing ? 'Edit Cycle' : 'Create Cycle'} submitLabel={editing ? 'Save Cycle' : 'Create Cycle'} fields={[{ name: 'name', label: 'Name', required: true, maxLength: 150 }, { name: 'goal', label: 'Goal', type: 'textarea', maxLength: 1000 }, { name: 'startDate', label: 'Start date', type: 'date', required: true }, { name: 'endDate', label: 'End date', type: 'date', required: true }, { name: 'capacityHours', label: 'Team capacity (hours)', type: 'number', min: 0, step: 0.5 }]} schema={cycleSchema} defaultValues={editing ? { name: editing.name, goal: editing.goal || '', startDate: toDateInput(editing.startDate), endDate: toDateInput(editing.endDate), capacityHours: editing.capacityHours || 0 } : { name: '', goal: '', startDate: '', endDate: '', capacityHours: 0 }} onClose={() => { setModal(null); setEditing(null) }} onSubmit={saveCycle} />
    <Modal show={Boolean(closeCycle)} onHide={() => setCloseCycle(null)} centered><Modal.Header closeButton><Modal.Title>Close {closeCycle?.name}</Modal.Title></Modal.Header><Modal.Body><p>Choose where unfinished Deliverables should go.</p><FormSelect value={destination} onChange={(event) => setDestination(event.target.value)}><option value="backlog">Return to project backlog</option>{cycles.filter((cycle) => cycle.status === 'planned' && cycle._id !== closeCycle?._id).map((cycle) => <option value={cycle._id} key={cycle._id}>Move to {cycle.name}</option>)}</FormSelect></Modal.Body><Modal.Footer><Button variant="light" onClick={() => setCloseCycle(null)}>Cancel</Button><Button onClick={closeSelectedCycle}>Close Cycle</Button></Modal.Footer></Modal>
  </>
}

const IssuesView = ({ project }) => {
  const { user } = useAuth(); const { showNotification } = useNotificationContext(); const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [showCreate, setShowCreate] = useState(false); const [filters, setFilters] = useState({ search: '', status: '', severity: '', type: '', assignedTo: '' })
  const load = useCallback(async () => { setLoading(true); setError(''); try { const response = await workService.issues(project.id, filters); setItems(response.data || []) } catch (requestError) { setError(requestError.message || 'Issues could not be loaded.') } finally { setLoading(false) } }, [filters, project.id])
  useEffect(() => { const timer = setTimeout(load, 300); return () => clearTimeout(timer) }, [load])
  const filtered = items.filter((item) => !filters.search.trim() || `${item.title} ${item.description}`.toLowerCase().includes(filters.search.trim().toLowerCase()))
  const issueId = searchParams.get('issue'); const selected = items.find((item) => item._id === issueId)
  const openIssue = (id) => setSearchParams((current) => { const next = new URLSearchParams(current); next.set('issue', id); return next }, { replace: true })
  const closeIssue = () => setSearchParams((current) => { const next = new URLSearchParams(current); next.delete('issue'); return next }, { replace: true })
  const create = async (values) => { await workService.createIssue(project.id, values); showNotification({ title: 'Issues', message: 'Issue reported', variant: 'success' }); await load() }
  return <>
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3"><div><h4 className="mb-1">Issues</h4><p className="text-muted mb-0">Triage bugs, risks, questions, and change requests.</p></div>{can(user, 'issueManagement', 'create') && <Button onClick={() => setShowCreate(true)}>Report Issue</Button>}</div>
    <Card className="mb-3"><CardBody><Row className="g-2"><Col lg={4}><FormControl aria-label="Search Issues" placeholder="Search Issues" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} /></Col><Col sm={6} lg={2}><FormSelect aria-label="Issue status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">All statuses</option>{issueStatuses.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}</FormSelect></Col><Col sm={6} lg={2}><FormSelect aria-label="Issue severity" value={filters.severity} onChange={(event) => setFilters((current) => ({ ...current, severity: event.target.value }))}><option value="">All severities</option>{priorities.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}</FormSelect></Col><Col sm={6} lg={2}><FormSelect aria-label="Issue type" value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}><option value="">All types</option>{['bug', 'change_request', 'risk', 'question'].map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}</FormSelect></Col><Col sm={6} lg={2}><FormSelect aria-label="Issue assignee" value={filters.assignedTo} onChange={(event) => setFilters((current) => ({ ...current, assignedTo: event.target.value }))}><option value="">All assignees</option>{memberOptions(project).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</FormSelect></Col></Row></CardBody></Card>
    {error && <ErrorState message={error} retry={load} />}{loading ? <LoadingState label="Loading Issues…" /> : filtered.length === 0 ? <div className="text-center py-5 border rounded"><h5>{items.length ? 'No matching Issues' : 'No Issues reported'}</h5><p className="text-muted mb-0">{items.length ? 'Change the filters to see more results.' : 'New bugs, risks, and questions will appear here.'}</p></div> : <Card><Table responsive hover className="mb-0 align-middle"><thead><tr><th>Reference</th><th>Issue</th><th>Type</th><th>Severity</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item._id}><td className="reference">{item.reference}</td><td><strong>{item.title}</strong><div className="text-muted fs-xs text-truncate" style={{ maxWidth: 360 }}>{item.description}</div></td><td>{titleCase(item.type)}</td><td><span className={`priority priority-${item.severity}`}>{item.severity}</span></td><td>{titleCase(item.status)}</td><td className="text-end"><Button size="sm" variant="outline-secondary" onClick={() => openIssue(item._id)}>View</Button></td></tr>)}</tbody></Table></Card>}
    <EntityModal show={showCreate} title="Report Issue" submitLabel="Report Issue" fields={[{ name: 'title', label: 'Summary', required: true, maxLength: 200 }, { name: 'description', label: 'What happened or changed?', type: 'textarea', required: true, maxLength: 5000 }, { name: 'type', label: 'Type', type: 'select', allowEmpty: false, options: ['bug', 'change_request', 'risk', 'question'].map((value) => ({ value, label: titleCase(value) })) }, { name: 'severity', label: 'Severity', type: 'select', allowEmpty: false, options: priorities.map((value) => ({ value, label: titleCase(value) })) }]} schema={issueSchema} defaultValues={{ title: '', description: '', type: 'bug', severity: 'medium' }} onClose={() => setShowCreate(false)} onSubmit={create} />
    <IssueDrawer issue={selected} project={project} show={Boolean(issueId && selected)} onClose={closeIssue} onChanged={load} />
  </>
}

const TimelineView = ({ project }) => {
  const { user } = useAuth(); const { showNotification } = useNotificationContext(); const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [editing, setEditing] = useState(null); const [show, setShow] = useState(false)
  const load = useCallback(async () => { setLoading(true); setError(''); try { const response = await workService.milestones(project.id); setItems(response.data || []) } catch (requestError) { setError(requestError.message || 'Milestones could not be loaded.') } finally { setLoading(false) } }, [project.id])
  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])
  const save = async (values) => { const payload = { ...values, description: values.description || null }; if (editing) await workService.updateMilestone(editing._id, { ...payload, version: editing.version }); else await workService.createMilestone(project.id, payload); showNotification({ title: 'Timeline', message: editing ? 'Milestone updated' : 'Milestone created', variant: 'success' }); await load() }
  const defaults = editing ? { name: editing.name, description: editing.description || '', dueDate: toDateInput(editing.dueDate), status: editing.status, isContractual: Boolean(editing.isContractual) } : { name: '', description: '', dueDate: '', status: 'upcoming', isContractual: false }
  return <><div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3"><div><h4 className="mb-1">Milestones</h4><p className="text-muted mb-0">Keep contractual dates distinct from internal Cycles.</p></div>{can(user, 'milestoneManagement', 'create') && <Button onClick={() => { setEditing(null); setShow(true) }}>Add Milestone</Button>}</div>{error && <ErrorState message={error} retry={load} />}{loading ? <LoadingState label="Loading Milestones…" /> : items.length === 0 ? <div className="workspace-empty"><div><h4>No Milestones yet</h4><p>Add meaningful delivery or contractual dates when the project needs them.</p></div></div> : <div className="milestone-line">{items.map((item) => { const overdue = new Date(item.dueDate) < new Date() && !['completed', 'cancelled'].includes(item.status); return <div className="milestone-item" key={item._id}><span className={`milestone-dot ${overdue ? 'missed' : item.status}`} /><div className="flex-grow-1"><div className="d-flex flex-wrap align-items-center gap-2"><strong>{item.name}</strong>{item.isContractual && <Badge bg="warning-subtle" text="warning">Contractual</Badge>}{overdue && <Badge bg="danger-subtle" text="danger">Past due</Badge>}</div><div className="text-muted">{formatDate(item.dueDate)} · {titleCase(item.status)}</div>{item.description && <p className="mb-1">{item.description}</p>}{can(user, 'milestoneManagement', 'edit') && <Button size="sm" variant="link" className="px-0" onClick={() => { setEditing(item); setShow(true) }}>Edit Milestone</Button>}</div></div> })}</div>}<EntityModal show={show} title={editing ? 'Edit Milestone' : 'New Milestone'} fields={[{ name: 'name', label: 'Name', required: true, maxLength: 150 }, { name: 'description', label: 'Description', type: 'textarea', maxLength: 1000 }, { name: 'dueDate', label: 'Due date', type: 'date', required: true }, { name: 'status', label: 'Status', type: 'select', allowEmpty: false, options: ['upcoming', 'at_risk', 'completed', 'missed', 'cancelled'].map((value) => ({ value, label: titleCase(value) })) }, { name: 'isContractual', label: 'Contractual milestone', type: 'checkbox', checkboxLabel: 'This date is a client or contract commitment' }]} schema={milestoneSchema} defaultValues={defaults} onClose={() => { setShow(false); setEditing(null) }} onSubmit={save} /></>
}

const TeamView = ({ project }) => <>{(project.assignedEmployees || []).length === 0 ? <div className="workspace-empty"><div><h4>No project members</h4><p>Add members through the project editor.</p></div></div> : <Row className="g-3">{project.assignedEmployees.map((member) => <Col lg={4} md={6} key={member.id}><Card className="h-100"><CardBody><div className="d-flex align-items-center gap-3"><div className="member-avatar">{member.fullName?.[0]?.toUpperCase() || '?'}</div><div className="min-w-0"><h5 className="mb-1 text-truncate">{member.fullName}</h5><span className="text-muted">{titleCase(member.projectRole)}</span></div></div></CardBody></Card></Col>)}</Row>}</>

const CostsBreakdown = ({ title, rows, label, canViewCost, currency, memberName }) => (
  <Card className="h-100"><CardBody><h5>{title}</h5>{rows.length === 0
    ? <p className="text-muted mb-0">No time has been logged for this breakdown.</p>
    : <Table responsive className="mb-0"><thead><tr><th>{label}</th><th>Hours</th>{canViewCost && <th className="text-end">Cost</th>}</tr></thead><tbody>{rows.map((row) => <tr key={String(row._id)}><td>{row.title || row.name || memberName(row._id)}</td><td>{row.hours || 0}h</td>{canViewCost && <td className="text-end">{formatCurrency(row.cost, currency)}</td>}</tr>)}</tbody></Table>}
  </CardBody></Card>
)

const CostsView = ({ project }) => {
  const { user } = useAuth(); const [data, setData] = useState(null); const [error, setError] = useState('')
  const load = useCallback(async () => { setError(''); try { const response = await workService.costs(project.id); setData(response.data) } catch (requestError) { setError(requestError.message || 'Project costs could not be loaded.') } }, [project.id])
  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])
  if (error) return <ErrorState message={error} retry={load} />; if (!data) return <LoadingState label="Loading project costs…" />
  const budget = data.budget || {}; const canViewCost = can(user, 'budgetAndFinance', 'viewCost'); const canViewProfit = can(user, 'budgetAndFinance', 'viewProfit')
  const stats = [['Internal budget', budget.estimatedBudget, can(user, 'budgetAndFinance', 'viewBudget')], ['Actual cost', budget.totalActualCost, canViewCost], ['Client billing', budget.billingAmount, canViewProfit], ['Profit', budget.profitAmount, canViewProfit]]
  const memberName = (id) => project.assignedEmployees?.find((member) => member.id === String(id))?.fullName || 'Team member'
  const breakdownProps = { canViewCost, currency: project.currency, memberName }
  return <><Row className="g-3 mb-4">{stats.filter(([, , visible]) => visible).map(([label, value]) => <Col lg={3} sm={6} key={label}><Card className="h-100"><CardBody><span className="text-muted">{label}</span><h3 className="mt-2 mb-0">{formatCurrency(value, project.currency)}</h3></CardBody></Card></Col>)}</Row><Row className="g-3"><Col xl={6}><CostsBreakdown title="By Deliverable" label="Deliverable" rows={data.byDeliverable || []} {...breakdownProps} /></Col><Col xl={6}><CostsBreakdown title="By Workstream" label="Workstream" rows={data.byWorkstream || []} {...breakdownProps} /></Col><Col xs={12}><CostsBreakdown title="By employee" label="Employee" rows={data.byEmployee || []} {...breakdownProps} /></Col></Row></>
}

const ActivityView = ({ project }) => {
  const [items, setItems] = useState([]); const [entityType, setEntityType] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const load = useCallback(async () => { setLoading(true); setError(''); try { const response = await workService.activity(project.id, { entityType }); setItems(response.data || []) } catch (requestError) { setError(requestError.message || 'Activity could not be loaded.') } finally { setLoading(false) } }, [entityType, project.id])
  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])
  return <><div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3"><div><h4 className="mb-1">Project activity</h4><p className="text-muted mb-0">The latest changes across project work.</p></div><FormSelect aria-label="Filter activity by entity" value={entityType} onChange={(event) => setEntityType(event.target.value)} style={{ maxWidth: 220 }}><option value="">All activity</option>{['project', 'workstream', 'deliverable', 'task', 'cycle', 'milestone', 'issue'].map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}</FormSelect></div>{error && <ErrorState message={error} retry={load} />}{loading ? <LoadingState label="Loading project activity…" /> : items.length === 0 ? <div className="text-center py-5 border rounded"><Icon icon="history" className="fs-1 text-muted mb-2" /><h5>No activity yet</h5><p className="text-muted mb-0">Changes to project work will appear here.</p></div> : <Card><CardBody><div className="activity-list">{items.map((item) => <div key={item._id} className="activity-row"><div className="activity-icon"><Icon icon="history" /></div><div><strong>{item.actorId?.userId?.fullName || 'A teammate'}</strong> {item.action.replaceAll('.', ' ')}<div className="text-muted fs-xs">{formatDate(item.createdAt, { hour: 'numeric', minute: '2-digit' })}</div></div></div>)}</div></CardBody></Card>}</>
}

const SettingsView = ({ project, onProjectChanged }) => {
  const { user } = useAuth(); const [editing, setEditing] = useState(false)
  return <><Card><CardBody><div className="d-flex flex-wrap justify-content-between align-items-start gap-3"><div><h4>Project settings</h4><p className="text-muted">Planning mode, schedule, team, and commercial terms are managed in the project editor.</p></div>{can(user, 'projectManagement', 'edit') && <Button onClick={() => setEditing(true)}>Edit project</Button>}</div><dl className="row mt-4 mb-0"><dt className="col-sm-3">Project key</dt><dd className="col-sm-9">{project.key}</dd><dt className="col-sm-3">Planning</dt><dd className="col-sm-9">{titleCase(project.planningMode)}</dd><dt className="col-sm-3">Status</dt><dd className="col-sm-9">{titleCase(project.status)}</dd><dt className="col-sm-3">Schedule</dt><dd className="col-sm-9">{formatDate(project.startDate)} – {formatDate(project.estimatedEndDate)}</dd></dl>{project.planningMode === 'cycles' && <Alert variant="info" className="mt-4 mb-0">Close the active Cycle before changing this project to continuous flow.</Alert>}</CardBody></Card><ProjectWizardModal show={editing} projectId={project.id} onHide={() => setEditing(false)} onSaved={async () => { setEditing(false); await onProjectChanged() }} /></>
}

const ProjectWorkspace = () => {
  const { projectId } = useParams(); const { user } = useAuth(); const location = useLocation(); const navigate = useNavigate()
  const [project, setProject] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const load = useCallback(async () => { setLoading(true); setError(''); try { const response = await projectService.getById(projectId); setProject(response.data) } catch (requestError) { setError(requestError.message || 'Project could not be loaded.') } finally { setLoading(false) } }, [projectId])
  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    return () => window.clearTimeout(timer)
  }, [load])
  const activeTab = location.pathname.split('/')[4] || 'overview'
  const tabs = useMemo(() => project ? tabDefinitions(user, project) : [], [project, user])
  useEffect(() => { if (project && tabs.length && !tabs.some(([slug]) => slug === activeTab)) navigate(`/app/projects/${project.id}/${tabs[0][0]}`, { replace: true }) }, [activeTab, navigate, project, tabs])
  if (loading) return <LoadingState label="Loading project workspace…" />
  if (error) return <ErrorState message={error} retry={load} />
  if (!project) return null
  const views = {
    overview: <OverviewView project={project} />, work: <WorkView project={project} />, cycles: <CyclesView project={project} />,
    issues: <IssuesView project={project} />, timeline: <TimelineView project={project} />, team: <TeamView project={project} />,
    costs: <CostsView project={project} />, activity: <ActivityView project={project} />, settings: <SettingsView project={project} onProjectChanged={load} />,
  }
  return <><WorkspaceHeader project={project} tabs={tabs} />{views[activeTab] || views.overview}</>
}

export default ProjectWorkspace
