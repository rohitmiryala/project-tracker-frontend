import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuth } from '@/hooks/useAuth'
import { projectService } from '@/services/projectService'
import { hasPermission } from '@/utils/permissions'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Button,
  Alert,
  Card,
  CardBody,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormControl,
  FormSelect,
  ProgressBar,
  Row,
  Spinner,
} from 'react-bootstrap'
import ProjectWizardModal from './components/ProjectWizardModal'
import { PROJECT_STATUSES } from './projectFormSchema'
import {
  DEFAULT_PROJECT_PAGE_SIZE,
  getProjectPaginationItems,
  normalizeProjectListResponse,
  PROJECT_PAGE_SIZES,
} from './projectListUtils'

const statusClass = {
  active: 'bg-success-subtle text-success',
  on_hold: 'bg-warning-subtle text-warning',
  completed: 'bg-info-subtle text-info',
  cancelled: 'bg-secondary-subtle text-secondary',
}

const statusLabel = (status) => PROJECT_STATUSES.find((item) => item.value === status)?.label || status

const Page = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showNotification } = useNotificationContext()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PROJECT_PAGE_SIZE)
  const [meta, setMeta] = useState({ page: 1, limit: DEFAULT_PROJECT_PAGE_SIZE, total: 0, totalPages: 1 })
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const requestId = useRef(0)

  const loadProjects = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const json = await projectService.list({
        search: query.trim() || undefined,
        status,
        page,
        limit: pageSize,
      })
      if (currentRequest !== requestId.current) return

      const result = normalizeProjectListResponse(json, { page, limit: pageSize })
      if (page > result.meta.totalPages) {
        setPage(result.meta.totalPages)
        return
      }

      setProjects(result.items)
      setMeta(result.meta)
    } catch (err) {
      if (currentRequest !== requestId.current) return
      setError(err.message || 'Could not load projects')
      setProjects([])
      showNotification({ title: 'Projects', message: err.message || 'Could not load projects', variant: 'danger' })
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }, [page, pageSize, query, showNotification, status])

  useEffect(() => {
    const timer = setTimeout(loadProjects, 250)
    return () => clearTimeout(timer)
  }, [loadProjects])

  const canCreate = hasPermission(user, 'projectManagement', 'create')
  const canEdit = hasPermission(user, 'projectManagement', 'edit')
  const canDelete = hasPermission(user, 'projectManagement', 'delete')
  const start = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const end = Math.min(meta.page * meta.limit, meta.total)
  const paginationItems = getProjectPaginationItems(meta.page, meta.totalPages)

  const openCreate = () => {
    setEditId(null)
    setModalOpen(true)
  }

  const openEdit = (id) => {
    setEditId(id)
    setModalOpen(true)
  }

  const handleMutationError = (action, err) => {
    if (err.status === 409) {
      showNotification({
        title: 'Project changed',
        message: `${err.message || 'This project changed elsewhere.'} The list has been reloaded.`,
        variant: 'warning',
      })
      loadProjects()
      return
    }
    showNotification({ title: 'Projects', message: err.message || `${action} failed`, variant: 'danger' })
  }

  const handleArchive = async (id, version) => {
    if (!window.confirm('Archive this project? It will be marked cancelled.')) return
    try {
      await projectService.archive(id, version)
      showNotification({ title: 'Projects', message: 'Project archived', variant: 'success' })
      loadProjects()
    } catch (err) {
      handleMutationError('Archive', err)
    }
  }

  const handleDelete = async (id, version) => {
    if (!window.confirm('Delete this project? This hides it from the list.')) return
    try {
      await projectService.remove(id, version)
      showNotification({ title: 'Projects', message: 'Project deleted', variant: 'success' })
      loadProjects()
    } catch (err) {
      handleMutationError('Delete', err)
    }
  }

  return (
    <>
      <PageBreadcrumb title="Projects" subtitle="Velorak" />

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
          <div className="app-search flex-grow-1" style={{ minWidth: 220, maxWidth: 360 }}>
            <FormControl
              type="search"
              placeholder="Search projects..."
              maxLength={100}
              aria-label="Search projects"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            />
            <Icon icon="search" className="app-search-icon text-muted" />
          </div>
          <FormSelect style={{ width: 170 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} aria-label="Filter projects by status">
            <option value="all">All statuses</option>
            {PROJECT_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </FormSelect>
        </div>
        {canCreate && (
          <Button variant="primary" className="text-nowrap" onClick={openCreate}>
            <Icon icon="plus" className="me-1" /> Create Project
          </Button>
        )}
      </div>

      {error && <Alert variant="danger" className="d-flex justify-content-between align-items-center"><span>{error}</span><Button size="sm" variant="outline-danger" onClick={loadProjects}>Retry</Button></Alert>}

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <div className="text-muted mt-2">Loading projects...</div>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <Card>
          <CardBody className="text-center py-5">
            <Icon icon={query.trim() || status !== 'all' ? 'search-x' : 'folder-kanban'} className="fs-1 text-muted mb-3" />
            <h4>{query.trim() || status !== 'all' ? 'No projects match these filters' : 'No projects yet'}</h4>
            <p className="text-muted mb-3">
              {query.trim() || status !== 'all'
                ? 'Try another search or clear the status filter.'
                : canCreate
                  ? 'Create your first project to start planning deliverables and tasks.'
                  : 'No projects are available to your account.'}
            </p>
            {query.trim() || status !== 'all' ? (
              <Button variant="outline-primary" onClick={() => { setQuery(''); setStatus('all'); setPage(1) }}>Clear filters</Button>
            ) : canCreate ? (
              <Button onClick={openCreate}><Icon icon="plus" className="me-1" />Create first project</Button>
            ) : null}
          </CardBody>
        </Card>
      )}

      <Row className="g-3">
        {!loading &&
          projects.map((project) => (
            <Col xl={4} md={6} key={project.id}>
              <Card className="h-100 project-card" role="button" tabIndex={0} onClick={() => navigate(`/app/projects/${project.id}/overview`)} onKeyDown={(event) => event.key === 'Enter' && navigate(`/app/projects/${project.id}/overview`)}>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="text-uppercase text-muted fs-xxs fw-semibold">{project.key}</span>
                        {project.isSample && <span className="badge bg-primary-subtle text-primary">Sample</span>}
                      </div>
                      <h5 className="mb-1">{project.name}</h5>
                      <span className={`badge ${statusClass[project.status] || 'bg-light'}`}>{statusLabel(project.status)}</span>
                    </div>
                    <Dropdown align="end" onClick={(event) => event.stopPropagation()}>
                      <DropdownToggle as="button" className="btn btn-sm btn-soft-secondary drop-arrow-none">
                        <Icon icon="ellipsis" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem onClick={() => navigate(`/app/projects/${project.id}/overview`)}>View project</DropdownItem>
                        {canEdit && <DropdownItem onClick={() => openEdit(project.id)}>Edit project</DropdownItem>}
                        {canEdit && <DropdownItem onClick={() => handleArchive(project.id, project.version)}>Archive project</DropdownItem>}
                        {canDelete && <DropdownItem className="text-danger" onClick={() => handleDelete(project.id, project.version)}>Delete project</DropdownItem>}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <p className="text-muted mb-1">{project.client?.name || 'No client'}</p>
                  <p className="text-muted mb-3">
                    Lead:{' '}
                    {project.leads?.length
                      ? project.leads.map((lead) => lead.fullName).join(', ')
                      : 'None'}
                  </p>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted fs-xs">Progress</span>
                    <span className="fs-xs">{project.completionPercentage || 0}%</span>
                  </div>
                  <ProgressBar now={project.completionPercentage || 0} style={{ height: 6 }} className="mb-3" />
                  <div className="text-muted fs-sm">
                    <Icon icon="users" className="me-1" />
                    {project.memberCount || 0} members
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
      </Row>

      {!loading && !error && projects.length > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
          <div className="d-flex flex-wrap align-items-center gap-2 text-muted">
            <span>Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{meta.total}</strong> projects</span>
            <FormSelect
              size="sm"
              value={pageSize}
              onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}
              style={{ width: 'auto' }}
              aria-label="Projects per page"
            >
              {PROJECT_PAGE_SIZES.map((size) => <option key={size} value={size}>{size} / page</option>)}
            </FormSelect>
          </div>
          <nav className="d-flex align-items-center gap-1" aria-label="Project pages">
            <Button variant="outline-secondary" size="sm" disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)} aria-label="Previous page">
              <Icon icon="chevron-left" />
            </Button>
            {paginationItems.map((item) => typeof item === 'number' ? (
              <Button
                key={item}
                size="sm"
                variant={item === meta.page ? 'primary' : 'outline-secondary'}
                onClick={() => setPage(item)}
                aria-label={`Page ${item}`}
                aria-current={item === meta.page ? 'page' : undefined}
                style={{ minWidth: 34 }}
              >
                {item}
              </Button>
            ) : (
              <span key={item} className="px-1 text-muted" aria-hidden="true">…</span>
            ))}
            <Button variant="outline-secondary" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage(meta.page + 1)} aria-label="Next page">
              <Icon icon="chevron-right" />
            </Button>
          </nav>
        </div>
      )}

      {(canCreate || canEdit) && <ProjectWizardModal
          show={modalOpen}
          projectId={editId}
          onHide={() => setModalOpen(false)}
          onSaved={(created) => created?.id ? navigate(`/app/projects/${created.id}/overview`) : loadProjects()}
        />}
    </>
  )
}

export default Page
