import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuth } from '@/hooks/useAuth'
import { roleService } from '@/services/roleService'
import { userService } from '@/services/userService'
import { hasPermission } from '@/utils/permissions'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, FormControl, FormSelect, Row, Spinner } from 'react-bootstrap'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import PermissionMatrix from './components/PermissionMatrix'
import EmploymentCreatableSelect from './components/EmploymentCreatableSelect'
import { buildUserPayload, clonePermissions, emptyUser, fieldRules, mapApiErrors, mergeEmploymentOptions } from './userFormUtils'
import './users.scss'

const UserFormPage = () => {
  const { userId } = useParams()
  const [query] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showNotification } = useNotificationContext()
  const isEdit = Boolean(userId)
  const isAdmin = user?.membershipType === 'admin'
  const mayInvite = hasPermission(user, 'userManagement', 'invite')
  const mayEditProfile = hasPermission(user, 'userManagement', 'edit')
  const mayChangeRole = hasPermission(user, 'userManagement', 'changeRole')
  const allowed = isEdit ? mayEditProfile || mayChangeRole : mayInvite
  const [roles, setRoles] = useState([])
  const [catalog, setCatalog] = useState([])
  const [employmentOptions, setEmploymentOptions] = useState({ departments: [], designations: [] })
  const [permissions, setPermissions] = useState({})
  const [permissionsDirty, setPermissionsDirty] = useState(false)
  const [version, setVersion] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const returnQuery = query.get('return') || ''
  const listUrl = `/app/users${returnQuery ? `?${returnQuery}` : ''}`
  const {
    register,
    reset,
    setError,
    setValue,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: emptyUser, mode: 'onTouched' })
  const selectedRoleId = useWatch({ control, name: 'roleId' })

  useEffect(() => {
    if (!allowed) return
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        const [rolesJson, catalogJson, optionsJson, memberJson] = await Promise.all([
          roleService.list({ page: 1, limit: 50, type: 'all' }),
          userService.permissionCatalog(),
          userService.employmentOptions(),
          isEdit ? userService.get(userId) : Promise.resolve(null),
        ])
        if (!active) return
        const nextRoles = rolesJson?.data?.items || []
        setRoles(nextRoles)
        setCatalog(catalogJson?.data?.modules || [])
        setEmploymentOptions({
          departments: optionsJson?.data?.departments || [],
          designations: optionsJson?.data?.designations || [],
        })
        if (isEdit) {
          const member = memberJson?.data
          if (member?.membershipType === 'admin') throw new Error('Administrator accounts are read-only')
          reset({
            fullName: member?.fullName || '',
            email: member?.email || '',
            designation: member?.designation || '',
            department: member?.department || '',
            salary: member?.salary ?? '',
            joiningDate: member?.joiningDate ? member.joiningDate.slice(0, 10) : '',
            roleId: member?.roleId || '',
          })
          setPermissions(clonePermissions(member?.permissions))
          setVersion(member?.version || 1)
        }
      } catch (requestError) {
        if (active) setLoadError(requestError.message || 'Could not load the user form')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [allowed, isEdit, reset, userId])

  const roleById = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles])
  const selectRole = (event) => {
    const nextId = event.target.value
    if (permissionsDirty && !window.confirm('Changing the role will reset customized permissions. Continue?')) {
      event.target.value = selectedRoleId
      return
    }
    setValue('roleId', nextId, { shouldValidate: true, shouldDirty: true })
    setPermissions(clonePermissions(roleById.get(nextId)?.defaultPermissions || {}))
    setPermissionsDirty(false)
  }
  const changePermissions = (next) => {
    setPermissions(next)
    setPermissionsDirty(true)
  }
  const addEmploymentOption = (type, value) => {
    setEmploymentOptions((current) => ({
      ...current,
      [type]: mergeEmploymentOptions(current[type], [value]),
    }))
  }

  const submit = handleSubmit(async (values) => {
    try {
      setSaving(true)
      if (isEdit) {
        const payload = { version }
        if (isAdmin || mayEditProfile) {
          payload.designation = values.designation.trim() || null
          payload.department = values.department.trim() || null
          payload.joiningDate = values.joiningDate || null
        }
        if (isAdmin) payload.salary = values.salary === '' ? null : Number(values.salary)
        if (isAdmin || mayChangeRole) {
          payload.roleId = values.roleId
          payload.permissions = clonePermissions(permissions)
        }
        await userService.update(userId, payload)
        showNotification({ title: 'Users', message: 'User updated successfully', variant: 'success' })
        navigate(`/app/users/${userId}${returnQuery ? `?return=${encodeURIComponent(returnQuery)}` : ''}`)
      } else {
        await userService.create(buildUserPayload(values, permissions, { includeSalary: isAdmin }))
        showNotification({ title: 'Users', message: 'User invited successfully', variant: 'success' })
        navigate('/app/users')
      }
    } catch (requestError) {
      if (!mapApiErrors(requestError, setError)) showNotification({ title: 'Users', message: requestError.message || 'Could not save user', variant: 'danger' })
    } finally {
      setSaving(false)
    }
  })

  if (!allowed) return <Card><CardBody className="text-center py-5"><Icon icon="shield-alert" className="fs-1 text-muted mb-3" /><h3>You cannot {isEdit ? 'edit' : 'add'} users</h3><Button as={Link} to={listUrl} variant="outline-primary">Back to users</Button></CardBody></Card>
  if (loading) return <div className="text-center py-5"><Spinner animation="border" /><div className="text-muted mt-2">Loading user form…</div></div>
  if (loadError) return <Alert variant="danger">{loadError}</Alert>

  const profileDisabled = isEdit || saving
  const employmentDisabled = saving || (isEdit && !isAdmin && !mayEditProfile)
  const accessDisabled = saving || (isEdit && !isAdmin && !mayChangeRole)

  return (
    <>
      <PageBreadcrumb title={isEdit ? 'Edit User' : 'Add User'} subtitle="Team management" />
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3"><div><h3 className="mb-1">{isEdit ? 'Edit user' : 'Add user'}</h3><p className="text-muted mb-0">{isEdit ? 'Update employment details, role, and effective permissions.' : 'Invite a teammate and define their access.'}</p></div><Button as={Link} to={listUrl} variant="outline-secondary"><Icon icon="arrow-left" className="me-1" />Back</Button></div>
      <Form onSubmit={submit} noValidate>
        <Row className="g-3">
          <Col xl={5}>
            <Card className="mb-3"><CardBody><h5 className="mb-3">Profile</h5><Row className="g-3">
              <Col xs={12}><Form.Group controlId="userFullName"><Form.Label>Full name <span className="text-danger">*</span></Form.Label><FormControl maxLength={100} disabled={profileDisabled} isInvalid={Boolean(errors.fullName)} {...register('fullName', fieldRules.fullName)} /><Form.Control.Feedback type="invalid">{errors.fullName?.message}</Form.Control.Feedback>{isEdit && <Form.Text>Name is part of the account identity and cannot be edited.</Form.Text>}</Form.Group></Col>
              <Col xs={12}><Form.Group controlId="userEmail"><Form.Label>Email <span className="text-danger">*</span></Form.Label><FormControl type="email" maxLength={254} disabled={profileDisabled} isInvalid={Boolean(errors.email)} {...register('email', fieldRules.email)} /><Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>{isEdit && <Form.Text>Email is part of the account identity and cannot be edited.</Form.Text>}</Form.Group></Col>
            </Row></CardBody></Card>
            <Card><CardBody><h5 className="mb-3">Employment</h5><Row className="g-3">
              <Col md={6}><Form.Group controlId="userDesignation"><Form.Label>Designation</Form.Label><Controller name="designation" control={control} rules={fieldRules.optionalText} render={({ field }) => <EmploymentCreatableSelect inputId="userDesignation" name={field.name} value={field.value} options={employmentOptions.designations} onChange={field.onChange} onBlur={field.onBlur} onCreateValue={(value) => addEmploymentOption('designations', value)} disabled={employmentDisabled} isInvalid={Boolean(errors.designation)} placeholder="Select or create designation" ariaDescribedBy="userDesignationError" />} /><Form.Control.Feedback id="userDesignationError" type="invalid">{errors.designation?.message}</Form.Control.Feedback></Form.Group></Col>
              <Col md={6}><Form.Group controlId="userDepartment"><Form.Label>Department</Form.Label><Controller name="department" control={control} rules={fieldRules.optionalText} render={({ field }) => <EmploymentCreatableSelect inputId="userDepartment" name={field.name} value={field.value} options={employmentOptions.departments} onChange={field.onChange} onBlur={field.onBlur} onCreateValue={(value) => addEmploymentOption('departments', value)} disabled={employmentDisabled} isInvalid={Boolean(errors.department)} placeholder="Select or create department" ariaDescribedBy="userDepartmentError" />} /><Form.Control.Feedback id="userDepartmentError" type="invalid">{errors.department?.message}</Form.Control.Feedback></Form.Group></Col>
              <Col md={6}><Form.Group controlId="userJoiningDate"><Form.Label>Joining date</Form.Label><FormControl type="date" disabled={employmentDisabled} isInvalid={Boolean(errors.joiningDate)} {...register('joiningDate')} /><Form.Control.Feedback type="invalid">{errors.joiningDate?.message}</Form.Control.Feedback></Form.Group></Col>
              {isAdmin && <Col md={6}><Form.Group controlId="userSalary"><Form.Label>Monthly salary</Form.Label><FormControl type="number" step="0.01" disabled={saving} isInvalid={Boolean(errors.salary)} {...register('salary', fieldRules.salary)} /><Form.Control.Feedback type="invalid">{errors.salary?.message}</Form.Control.Feedback></Form.Group></Col>}
            </Row></CardBody></Card>
          </Col>
          <Col xl={7}>
            <Card className="mb-3"><CardBody><h5 className="mb-3">Role</h5><Form.Group controlId="userRole"><Form.Label>Role <span className="text-danger">*</span></Form.Label><Controller name="roleId" control={control} rules={{ required: 'Please select a role' }} render={({ field }) => <FormSelect {...field} value={selectedRoleId || ''} onChange={selectRole} disabled={accessDisabled} isInvalid={Boolean(errors.roleId)}><option value="">Select a role</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</FormSelect>} /><Form.Control.Feedback type="invalid">{errors.roleId?.message}</Form.Control.Feedback><Form.Text>Selecting a role loads its default permissions.</Form.Text></Form.Group></CardBody></Card>
            <Card><CardHeader className="border-bottom"><h5 className="mb-1">Permissions</h5><p className="text-muted mb-0">These checkboxes are the user’s effective access snapshot.</p></CardHeader><CardBody><div className="user-permissions-scroll" tabIndex={0} aria-label="Effective permissions"><PermissionMatrix catalog={catalog} value={permissions} onChange={changePermissions} disabled={accessDisabled} /></div></CardBody></Card>
          </Col>
        </Row>
        <div className="d-flex justify-content-end gap-2 mt-3"><Button as={Link} to={listUrl} variant="light" disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <Spinner size="sm" className="me-2" />}{saving ? 'Saving…' : isEdit ? 'Save changes' : 'Send invitation'}</Button></div>
      </Form>
    </>
  )
}

export default UserFormPage
