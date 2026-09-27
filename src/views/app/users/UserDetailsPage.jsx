import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import { hasPermission } from '@/utils/permissions'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap'
import { Link, useParams, useSearchParams } from 'react-router'

const formatDate = (value, includeTime = false) => value ? dayjs(value).format(includeTime ? 'MMM D, YYYY [at] h:mm A' : 'MMM D, YYYY') : 'Not available'
const initials = (name = '') => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?'

const Detail = ({ label, value }) => <div><div className="text-muted fs-sm mb-1">{label}</div><div className="fw-medium">{value ?? 'Not provided'}</div></div>

const UserDetailsPage = () => {
  const { userId } = useParams()
  const [query] = useSearchParams()
  const { user } = useAuth()
  const { showNotification } = useNotificationContext()
  const mayView = hasPermission(user, 'userManagement', 'view')
  const mayEdit = hasPermission(user, 'userManagement', 'edit') || hasPermission(user, 'userManagement', 'changeRole')
  const mayInvite = hasPermission(user, 'userManagement', 'invite')
  const [member, setMember] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const returnQuery = query.get('return') || ''
  const listUrl = `/app/users${returnQuery ? `?${returnQuery}` : ''}`
  const editUrl = `/app/users/${userId}/edit${returnQuery ? `?return=${encodeURIComponent(returnQuery)}` : ''}`

  const load = useCallback(async () => {
    if (!mayView) return
    try {
      setLoading(true)
      setError('')
      const [memberJson, catalogJson] = await Promise.all([userService.get(userId), userService.permissionCatalog()])
      setMember(memberJson?.data || null)
      setCatalog(catalogJson?.data?.modules || [])
    } catch (requestError) {
      setError(requestError.message || 'Could not load this user')
    } finally {
      setLoading(false)
    }
  }, [mayView, userId])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const resend = async () => {
    try {
      const json = await userService.resendInvite(userId)
      showNotification({ title: 'Users', message: json?.data?.emailSent ? 'Invitation sent' : 'Invitation email could not be delivered', variant: json?.data?.emailSent ? 'success' : 'warning' })
      await load()
    } catch (requestError) {
      showNotification({ title: 'Users', message: requestError.message || 'Could not resend invitation', variant: 'danger' })
    }
  }

  if (!mayView) return <Card><CardBody className="text-center py-5"><Icon icon="shield-alert" className="fs-1 text-muted mb-3" /><h3>You cannot view users</h3><Button as={Link} to="/app/dashboard" variant="outline-primary">Return to dashboard</Button></CardBody></Card>
  if (loading) return <div className="text-center py-5"><Spinner animation="border" /><div className="text-muted mt-2">Loading user details…</div></div>
  if (error || !member) return <Alert variant="danger" className="d-flex justify-content-between align-items-center"><span>{error || 'User not found'}</span><Button as={Link} to={listUrl} variant="outline-danger" size="sm">Back to users</Button></Alert>

  const isReadOnly = member.membershipType === 'admin'
  const enabledPermissions = catalog.flatMap((module) => module.actions
    .filter((action) => member.permissions?.[module.key]?.[action.key])
    .map((action) => `${module.label}: ${action.label}`))

  return <>
    <PageBreadcrumb title="User Details" subtitle="Team management" />
    <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
      <div className="d-flex align-items-center gap-3"><div className="avatar-lg rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-semibold fs-3">{initials(member.fullName)}</div><div><div className="d-flex align-items-center gap-2"><h3 className="mb-0">{member.fullName}</h3>{isReadOnly && <Badge bg="secondary-subtle" text="secondary">Read-only administrator</Badge>}</div><p className="text-muted mb-0">{member.email}</p></div></div>
      <div className="d-flex gap-2"><Button as={Link} to={listUrl} variant="outline-secondary"><Icon icon="arrow-left" className="me-1" />Back</Button>{!isReadOnly && mayEdit && <Button as={Link} to={editUrl}><Icon icon="pencil" className="me-1" />Edit</Button>}</div>
    </div>
    <Row className="g-3">
      <Col xl={7}>
        <Card className="mb-3"><CardBody><div className="d-flex justify-content-between align-items-center mb-3"><h5 className="mb-0">Account</h5><Badge bg={member.status === 'active' ? 'success-subtle' : 'warning-subtle'} text={member.status === 'active' ? 'success' : 'warning'}>{member.status === 'active' ? 'Active' : 'Pending invite'}</Badge></div><Row className="g-4"><Col sm={6}><Detail label="Email verified" value={member.isEmailVerified ? 'Yes' : 'No'} /></Col><Col sm={6}><Detail label="Last sign-in" value={formatDate(member.lastLoginAt, true)} /></Col><Col sm={6}><Detail label="Added" value={formatDate(member.createdAt)} /></Col><Col sm={6}><Detail label="Last updated" value={formatDate(member.updatedAt, true)} /></Col></Row>{member.invitation && <Alert variant={member.invitation.status === 'pending' ? 'warning' : 'danger'} className="mt-4 mb-0 d-flex flex-wrap justify-content-between align-items-center gap-2"><span>Invitation {member.invitation.status}. {member.invitation.expiresAt && `Expires ${formatDate(member.invitation.expiresAt, true)}.`}</span>{mayInvite && <Button size="sm" variant="outline-warning" onClick={resend}>Resend invite</Button>}</Alert>}</CardBody></Card>
        <Card><CardBody><h5 className="mb-3">Employment</h5><Row className="g-4"><Col sm={6}><Detail label="Designation" value={member.designation} /></Col><Col sm={6}><Detail label="Department" value={member.department} /></Col><Col sm={6}><Detail label="Joining date" value={formatDate(member.joiningDate)} /></Col><Col sm={6}><Detail label="Role" value={member.roleName} /></Col>{user?.membershipType === 'admin' && <><Col sm={6}><Detail label="Salary" value={member.salary == null ? 'Not provided' : Number(member.salary).toLocaleString()} /></Col><Col sm={6}><Detail label="Daily cost rate" value={member.costRate == null ? 'Not available' : Number(member.costRate).toLocaleString()} /></Col></>}</Row></CardBody></Card>
      </Col>
      <Col xl={5}><Card><CardBody><h5 className="mb-1">Effective permissions</h5><p className="text-muted fs-sm">This is the access snapshot assigned to the membership.</p>{isReadOnly ? <Alert variant="info" className="mb-0">Administrators have full access automatically.</Alert> : enabledPermissions.length ? <div className="d-flex flex-wrap gap-2">{enabledPermissions.map((permission) => <Badge key={permission} bg="primary-subtle" text="primary" className="fw-normal p-2">{permission}</Badge>)}</div> : <div className="text-muted border rounded p-3">No permissions are enabled.</div>}</CardBody></Card></Col>
    </Row>
  </>
}

export default UserDetailsPage
