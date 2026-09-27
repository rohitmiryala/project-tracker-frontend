import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { useAuth } from '@/hooks/useAuth'
import { roleService } from '@/services/roleService'
import { hasAnyPermission, hasPermission } from '@/utils/permissions'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Badge, Button, Card, CardBody, CardFooter, Col, FormCheck, FormControl, FormSelect, Row, Spinner } from 'react-bootstrap'
import { Link } from 'react-router'
import RoleModal from './components/RoleModal'

const PAGE_SIZES = [5, 10, 15, 25]
const roleAccess = [
  ['userManagement', 'view'],
  ['userManagement', 'invite'],
  ['userManagement', 'changeRole'],
]
const RolesPage = () => {
  const { user } = useAuth()
  const mayView = hasAnyPermission(user, roleAccess)
  const mayCreate = hasAnyPermission(user, [
    ['userManagement', 'invite'],
    ['userManagement', 'changeRole'],
  ])
  const mayEdit = hasPermission(user, 'userManagement', 'changeRole')
  const [roles, setRoles] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showSystemRoles, setShowSystemRoles] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalRole, setModalRole] = useState(undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const requestId = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadRoles = useCallback(async () => {
    if (!mayView) return
    const currentRequest = ++requestId.current
    await Promise.resolve()
    setLoading(true)
    setError('')
    try {
      const json = await roleService.list({
        page,
        limit: pageSize,
        search: debouncedSearch,
        type: showSystemRoles ? 'all' : 'custom',
      })
      if (currentRequest !== requestId.current) return
      setRoles(json?.data?.items || [])
      setMeta(json?.data?.meta || { page, limit: pageSize, total: 0, totalPages: 1 })
    } catch (requestError) {
      if (currentRequest !== requestId.current) return
      setError(requestError.message || 'Could not load roles')
      setRoles([])
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }, [mayView, page, pageSize, debouncedSearch, showSystemRoles])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRoles(), 0)
    return () => window.clearTimeout(timer)
  }, [loadRoles])

  const openCreate = () => {
    setModalRole(undefined)
    setModalOpen(true)
  }
  const openEdit = (role) => {
    setModalRole(role)
    setModalOpen(true)
  }
  const roleSaved = () => {
    if (page === 1) loadRoles()
    else setPage(1)
  }
  const changeSystemRoleVisibility = (checked) => {
    setShowSystemRoles(checked)
    setPage(1)
  }
  const changePageSize = (value) => {
    setPageSize(Number(value))
    setPage(1)
  }

  if (!mayView) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Icon icon="shield-alert" className="text-muted fs-1 mb-3" />
          <h3>Roles are not available to your account</h3>
          <p className="text-muted">Ask an administrator for user-management access if you need to view this page.</p>
          <Button as={Link} to="/app/dashboard" variant="outline-primary">Return to dashboard</Button>
        </CardBody>
      </Card>
    )
  }

  const start = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const end = Math.min(meta.page * meta.limit, meta.total)
  const filtered = Boolean(debouncedSearch)

  return (
    <>
      <PageBreadcrumb title="Roles" subtitle="Team management" />
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
        <div>
          <h3 className="mb-1">Roles</h3>
          <p className="text-muted mb-0">Maintain the role names used when organizing employees.</p>
        </div>
        {mayCreate && <Button onClick={openCreate}><Icon icon="plus" className="me-1" />Add Role</Button>}
      </div>

      <Card className="mb-3">
        <CardBody>
          <Row className="g-2 align-items-center">
            <Col lg={8}>
              <div className="app-search" style={{ maxWidth: 420 }}>
                <FormControl
                  type="search"
                  maxLength={100}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search role name or description…"
                  aria-label="Search roles"
                />
                <Icon icon="search" className="app-search-icon text-muted" />
              </div>
            </Col>
            <Col lg={4} className="d-flex align-items-center justify-content-lg-end">
              <FormCheck
                id="show-system-roles"
                type="checkbox"
                checked={showSystemRoles}
                onChange={(event) => changeSystemRoleVisibility(event.target.checked)}
                label="Show system roles"
              />
            </Col>
          </Row>
        </CardBody>
      </Card>

      {loading ? (
        <Card>
          <CardBody className="text-center py-5"><Spinner animation="border" /><div className="text-muted mt-2">Loading roles…</div></CardBody>
        </Card>
      ) : error ? (
        <Alert variant="danger" className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>{error}</span>
          <Button size="sm" variant="outline-danger" onClick={loadRoles}>Try again</Button>
        </Alert>
      ) : roles.length === 0 ? (
        <Card>
          <CardBody className="text-center py-5">
            <Icon icon={filtered ? 'search-x' : 'users-round'} className="text-muted fs-1 mb-3" />
            <h4>{filtered ? 'No roles match your search' : showSystemRoles ? 'No roles yet' : 'No custom roles yet'}</h4>
            <p className="text-muted mb-3">{filtered ? 'Try a different role name or description.' : 'Add a role to create a clear label for employees.'}</p>
            {filtered ? <Button variant="outline-primary" onClick={() => setSearch('')}>Clear search</Button> : mayCreate && <Button onClick={openCreate}>Add first role</Button>}
          </CardBody>
        </Card>
      ) : (
        <>
          <Row className="g-3">
            {roles.map((role) => (
              <Col xxl={3} xl={4} md={6} key={role.id}>
                <Card className="h-100">
                  <CardBody className="d-flex flex-column p-3">
                    <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                      <div>
                        <h5 className="mb-1">{role.name}</h5>
                        <span className="text-muted fs-xs">
                          {role.isSystem ? 'Managed by Velorak' : 'Created for your company'}
                        </span>
                      </div>
                      <Badge
                        bg={role.isSystem ? 'primary-subtle' : 'success-subtle'}
                        text={role.isSystem ? 'primary' : 'secondary'}
                      >
                        {role.isSystem ? 'System' : 'Custom'}
                      </Badge>
                    </div>
                    <p className="text-muted fs-sm mb-0 flex-grow-1">
                      {role.description || 'No description provided.'}
                    </p>
                  </CardBody>
                  <CardFooter className="bg-transparent d-flex justify-content-end align-items-center px-3 py-2">
                    {!role.isSystem && mayEdit ? (
                      <Button
                        size="sm"
                        variant="soft-secondary"
                        onClick={() => openEdit(role)}
                        aria-label={`Edit ${role.name}`}
                      >
                        <Icon icon="pencil" className="me-1" />Edit
                      </Button>
                    ) : (
                      <span className="text-muted fs-xs"><Icon icon="lock-keyhole" className="me-1" />Read only</span>
                    )}
                  </CardFooter>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">
            <div className="d-flex flex-wrap align-items-center gap-2 text-muted">
              <span>Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{meta.total}</strong> roles</span>
              <FormSelect size="sm" value={pageSize} onChange={(event) => changePageSize(event.target.value)} style={{ width: 'auto' }} aria-label="Roles per page">
                {PAGE_SIZES.map((size) => <option key={size} value={size}>{size} / page</option>)}
              </FormSelect>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Button size="sm" variant="outline-secondary" disabled={meta.page <= 1} onClick={() => setPage((value) => value - 1)} aria-label="Previous page"><Icon icon="chevron-left" /></Button>
              <span className="text-muted fs-sm">Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong></span>
              <Button size="sm" variant="outline-secondary" disabled={meta.page >= meta.totalPages} onClick={() => setPage((value) => value + 1)} aria-label="Next page"><Icon icon="chevron-right" /></Button>
            </div>
          </div>
        </>
      )}

      <RoleModal show={modalOpen} role={modalRole} onHide={() => setModalOpen(false)} onSaved={roleSaved} />
    </>
  )
}

export default RolesPage
