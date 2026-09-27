import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuth } from '@/hooks/useAuth'
import { roleService } from '@/services/roleService'
import { userService } from '@/services/userService'
import { hasPermission } from '@/utils/permissions'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Badge, Button, Card, CardBody, Col, FormControl, FormSelect, Row, Spinner } from 'react-bootstrap'
import { Link, useNavigate, useSearchParams } from 'react-router'

const PAGE_SIZES = [5, 10, 15, 25]
const initials = (name = '') => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?'

const UsersPage = () => {
  const { user } = useAuth()
  const { showNotification } = useNotificationContext()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const mayView = hasPermission(user, 'userManagement', 'view')
  const mayInvite = hasPermission(user, 'userManagement', 'invite')
  const mayEdit = hasPermission(user, 'userManagement', 'edit') || hasPermission(user, 'userManagement', 'changeRole')
  const [items, setItems] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [search, setSearch] = useState(params.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const requestId = useRef(0)

  const page = Math.max(1, Number(params.get('page')) || 1)
  const limit = PAGE_SIZES.includes(Number(params.get('limit'))) ? Number(params.get('limit')) : 10
  const status = params.get('status') || 'all'
  const roleId = params.get('roleId') || 'all'
  const department = params.get('department') || ''

  const updateParams = useCallback((changes) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || value === 'all' || (key === 'page' && value === 1) || (key === 'limit' && value === 10)) next.delete(key)
        else next.set(key, String(value))
      })
      return next
    })
  }, [setParams])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      updateParams({ search: search.trim(), page: 1 })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search, updateParams])

  useEffect(() => {
    if (!mayView) return
    roleService.list({ page: 1, limit: 50, type: 'all' })
      .then((json) => setRoles(json?.data?.items || []))
      .catch(() => setRoles([]))
  }, [mayView])

  const loadUsers = useCallback(async () => {
    if (!mayView) return
    const currentRequest = ++requestId.current
    await Promise.resolve()
    setLoading(true)
    setError('')
    try {
      const json = await userService.list({ page, limit, search: debouncedSearch, status, roleId, department })
      if (currentRequest !== requestId.current) return
      setItems(json?.data?.items || [])
      setMeta(json?.data?.meta || { page, limit, total: 0, totalPages: 1 })
      setDepartments(json?.data?.facets?.departments || [])
    } catch (requestError) {
      if (currentRequest !== requestId.current) return
      setError(requestError.message || 'Could not load users')
      setItems([])
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }, [mayView, page, limit, debouncedSearch, status, roleId, department])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUsers(), 0)
    return () => window.clearTimeout(timer)
  }, [loadUsers])

  const listQuery = params.toString()
  const detailUrl = (id) => `/app/users/${id}${listQuery ? `?return=${encodeURIComponent(listQuery)}` : ''}`
  const editUrl = (id) => `/app/users/${id}/edit${listQuery ? `?return=${encodeURIComponent(listQuery)}` : ''}`
  const resend = async (id) => {
    try {
      const json = await userService.resendInvite(id)
      showNotification({ title: 'Users', message: json?.data?.emailSent ? 'Invitation sent' : 'User is pending, but email delivery failed', variant: json?.data?.emailSent ? 'success' : 'warning' })
      loadUsers()
    } catch (requestError) {
      showNotification({ title: 'Users', message: requestError.message || 'Could not resend invitation', variant: 'danger' })
    }
  }

  if (!mayView) {
    return <Card><CardBody className="text-center py-5"><Icon icon="shield-alert" className="fs-1 text-muted mb-3" /><h3>Users are not available to your account</h3><p className="text-muted">Ask an administrator for user-management access.</p><Button as={Link} to="/app/dashboard" variant="outline-primary">Return to dashboard</Button></CardBody></Card>
  }

  const start = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1
  const end = Math.min(meta.page * meta.limit, meta.total)
  const filtered = Boolean(debouncedSearch || status !== 'all' || roleId !== 'all' || department)

  return (
    <>
      <PageBreadcrumb title="Users" subtitle="Team management" />
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
        <div><h3 className="mb-1">Users</h3><p className="text-muted mb-0">Manage company access, roles, and invitations.</p></div>
        {mayInvite && <div className="d-flex gap-2"><Button as={Link} to="/app/users/bulk" variant="outline-primary"><Icon icon="users-round" className="me-1" />Bulk add</Button><Button as={Link} to="/app/users/new"><Icon icon="user-plus" className="me-1" />Add user</Button></div>}
      </div>

      <Card className="mb-3"><CardBody><Row className="g-2">
        <Col xl={5}><div className="app-search"><FormControl type="search" maxLength={100} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, designation, or department…" aria-label="Search users" /><Icon icon="search" className="app-search-icon text-muted" /></div></Col>
        <Col sm={4} xl><FormSelect value={status} onChange={(event) => updateParams({ status: event.target.value, page: 1 })} aria-label="Filter users by status"><option value="all">All statuses</option><option value="active">Active</option><option value="pending">Pending invite</option></FormSelect></Col>
        <Col sm={4} xl><FormSelect value={roleId} onChange={(event) => updateParams({ roleId: event.target.value, page: 1 })} aria-label="Filter users by role"><option value="all">All roles</option><option value="admin">Administrator</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</FormSelect></Col>
        <Col sm={4} xl><FormSelect value={department} onChange={(event) => updateParams({ department: event.target.value, page: 1 })} aria-label="Filter users by department"><option value="">All departments</option>{departments.map((item) => <option key={item} value={item}>{item}</option>)}</FormSelect></Col>
      </Row></CardBody></Card>

      {loading ? <div className="text-center py-5"><Spinner animation="border" /><div className="text-muted mt-2">Loading users…</div></div> : error ? (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center gap-2"><span>{error}</span><Button size="sm" variant="outline-danger" onClick={loadUsers}>Try again</Button></Alert>
      ) : items.length === 0 ? (
        <Card><CardBody className="text-center py-5"><Icon icon={filtered ? 'search-x' : 'users'} className="fs-1 text-muted mb-3" /><h4>{filtered ? 'No users match these filters' : 'No users yet'}</h4><p className="text-muted">{filtered ? 'Change or clear the filters to see more users.' : 'Invite your first teammate to begin collaborating.'}</p>{filtered ? <Button variant="outline-primary" onClick={() => { setSearch(''); setParams({}) }}>Clear filters</Button> : mayInvite && <Button as={Link} to="/app/users/new">Add first user</Button>}</CardBody></Card>
      ) : <>
        <Row className="g-3">{items.map((member) => <Col xxl={3} xl={4} md={6} key={member.id}>
          <Card className="h-100"><CardBody className="p-3 d-flex flex-column">
            <div className="d-flex align-items-start gap-3 mb-3"><div className="avatar-md rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-semibold flex-shrink-0">{initials(member.fullName)}</div><div className="min-w-0 flex-grow-1"><div className="d-flex align-items-start justify-content-between gap-2"><h5 className="mb-1 text-truncate">{member.fullName}</h5><Badge bg={member.status === 'active' ? 'success-subtle' : 'warning-subtle'} text={member.status === 'active' ? 'success' : 'warning'}>{member.status === 'active' ? 'Active' : 'Pending'}</Badge></div><div className="text-muted fs-sm text-truncate">{member.email}</div></div></div>
            <div className="vstack gap-2 text-muted fs-sm flex-grow-1"><div><Icon icon="shield" className="me-2" />{member.roleName || 'No role'}</div><div><Icon icon="briefcase-business" className="me-2" />{member.designation || 'No designation'}</div><div><Icon icon="building" className="me-2" />{member.department || 'No department'}</div></div>
            <div className="d-flex flex-wrap justify-content-end gap-2 mt-3 pt-3 border-top">
              {member.status === 'pending' && member.membershipType !== 'admin' && mayInvite && <Button size="sm" variant="soft-warning" onClick={() => resend(member.id)}>Resend invite</Button>}
              <Button size="sm" variant="outline-secondary" onClick={() => navigate(detailUrl(member.id))}>View</Button>
              {member.membershipType !== 'admin' && mayEdit && <Button size="sm" variant="soft-primary" as={Link} to={editUrl(member.id)}>Edit</Button>}
            </div>
          </CardBody></Card>
        </Col>)}</Row>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">
          <div className="d-flex align-items-center gap-2 text-muted"><span>Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{meta.total}</strong></span><FormSelect size="sm" value={limit} onChange={(event) => updateParams({ limit: Number(event.target.value), page: 1 })} style={{ width: 'auto' }} aria-label="Users per page">{PAGE_SIZES.map((size) => <option key={size} value={size}>{size} / page</option>)}</FormSelect></div>
          <div className="d-flex align-items-center gap-2"><Button size="sm" variant="outline-secondary" disabled={meta.page <= 1} onClick={() => updateParams({ page: meta.page - 1 })} aria-label="Previous page"><Icon icon="chevron-left" /></Button><span className="text-muted fs-sm">Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong></span><Button size="sm" variant="outline-secondary" disabled={meta.page >= meta.totalPages} onClick={() => updateParams({ page: meta.page + 1 })} aria-label="Next page"><Icon icon="chevron-right" /></Button></div>
        </div>
      </>}
    </>
  )
}

export default UsersPage
