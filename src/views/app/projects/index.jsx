import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { projectService } from '@/services/projectService'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Button,
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

const statusClass = {
  active: 'bg-success-subtle text-success',
  on_hold: 'bg-warning-subtle text-warning',
  completed: 'bg-info-subtle text-info',
  cancelled: 'bg-secondary-subtle text-secondary',
}

const statusLabel = (status) => PROJECT_STATUSES.find((item) => item.value === status)?.label || status

const Page = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotificationContext()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    try {
      const json = await projectService.list({
        search: query.trim() || undefined,
        status,
        limit: 50,
      })
      setProjects(json?.data || [])
    } catch (err) {
      showNotification({ title: 'Projects', message: err.message || 'Could not load projects', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }, [query, showNotification, status])

  useEffect(() => {
    const timer = setTimeout(loadProjects, 250)
    return () => clearTimeout(timer)
  }, [loadProjects])

  const openCreate = () => {
    setEditId(null)
    setModalOpen(true)
  }

  const openEdit = (id) => {
    setEditId(id)
    setModalOpen(true)
  }

  const handleArchive = async (id, version) => {
    if (!window.confirm('Archive this project? It will be marked cancelled.')) return
    try {
      await projectService.archive(id, version)
      showNotification({ title: 'Projects', message: 'Project archived', variant: 'success' })
      loadProjects()
    } catch (err) {
      showNotification({ title: 'Projects', message: err.message || 'Archive failed', variant: 'danger' })
    }
  }

  const handleDelete = async (id, version) => {
    if (!window.confirm('Delete this project? This hides it from the list.')) return
    try {
      await projectService.remove(id, version)
      showNotification({ title: 'Projects', message: 'Project deleted', variant: 'success' })
      loadProjects()
    } catch (err) {
      showNotification({ title: 'Projects', message: err.message || 'Delete failed', variant: 'danger' })
    }
  }

  return (
    <>
      <PageBreadcrumb title="Projects" subtitle="Velorak" />

      <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="app-search" style={{ width: 260 }}>
            <FormControl
              type="search"
              placeholder="Search projects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Icon icon="search" className="app-search-icon text-muted" />
          </div>
          <FormSelect style={{ width: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {PROJECT_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </FormSelect>
        </div>
        <Button variant="primary" className="text-nowrap" onClick={openCreate}>
          <Icon icon="plus" className="me-1" /> Create Project
        </Button>
      </div>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {!loading && projects.length === 0 && <p className="text-muted">No projects yet. Create one to get started.</p>}

      <Row className="g-3">
        {!loading &&
          projects.map((project) => (
            <Col xl={4} md={6} key={project.id}>
              <Card className="h-100 project-card" role="button" tabIndex={0} onClick={() => navigate(`/app/projects/${project.id}/overview`)} onKeyDown={(event) => event.key === 'Enter' && navigate(`/app/projects/${project.id}/overview`)}>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="text-uppercase text-muted fs-xxs fw-semibold mb-1">{project.key}</div>
                      <h5 className="mb-1">{project.name}</h5>
                      <span className={`badge ${statusClass[project.status] || 'bg-light'}`}>{statusLabel(project.status)}</span>
                    </div>
                    <Dropdown align="end" onClick={(event) => event.stopPropagation()}>
                      <DropdownToggle as="button" className="btn btn-sm btn-soft-secondary drop-arrow-none">
                        <Icon icon="ellipsis" />
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem onClick={() => navigate(`/app/projects/${project.id}/overview`)}>View project</DropdownItem>
                        <DropdownItem onClick={() => openEdit(project.id)}>Edit project</DropdownItem>
                        <DropdownItem onClick={() => handleArchive(project.id, project.version)}>Archive project</DropdownItem>
                        <DropdownItem className="text-danger" onClick={() => handleDelete(project.id, project.version)}>
                          Delete project
                        </DropdownItem>
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

      <ProjectWizardModal
        show={modalOpen}
        projectId={editId}
        onHide={() => setModalOpen(false)}
        onSaved={(created) => created?.id ? navigate(`/app/projects/${created.id}/overview`) : loadProjects()}
      />
    </>
  )
}

export default Page
