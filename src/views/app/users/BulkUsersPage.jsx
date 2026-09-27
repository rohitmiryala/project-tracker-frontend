import PageBreadcrumb from '@/components/PageBreadcrumb'
import Icon from '@/components/wrappers/Icon'
import { useAuth } from '@/hooks/useAuth'
import { roleService } from '@/services/roleService'
import { userService } from '@/services/userService'
import { hasPermission } from '@/utils/permissions'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, CardBody, Col, Collapse, Form, FormControl, FormSelect, Row, Spinner } from 'react-bootstrap'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import PermissionMatrix from './components/PermissionMatrix'
import EmploymentCreatableSelect from './components/EmploymentCreatableSelect'
import { buildUserPayload, clonePermissions, emptyUser, fieldRules, mapApiErrors, mergeEmploymentOptions } from './userFormUtils'
import './users.scss'

const freshRow = () => ({ ...emptyUser, joiningDate: new Date().toISOString().slice(0, 10) })

const BulkUsersPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.membershipType === 'admin'
  const mayInvite = hasPermission(user, 'userManagement', 'invite')
  const [roles, setRoles] = useState([])
  const [catalog, setCatalog] = useState([])
  const [employmentOptions, setEmploymentOptions] = useState({ departments: [], designations: [] })
  const [permissions, setPermissions] = useState([{}])
  const [permissionsCustomized, setPermissionsCustomized] = useState([false])
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resendingId, setResendingId] = useState('')
  const [loadError, setLoadError] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [result, setResult] = useState(null)
  const { register, control, setValue, setError, getValues, trigger, handleSubmit, formState: { errors } } = useForm({ defaultValues: { users: [freshRow()] }, mode: 'onTouched' })
  const { fields, append, remove } = useFieldArray({ control, name: 'users' })

  useEffect(() => {
    if (!mayInvite) return
    let active = true
    Promise.all([roleService.list({ page: 1, limit: 50, type: 'all' }), userService.permissionCatalog(), userService.employmentOptions()])
      .then(([rolesJson, catalogJson, optionsJson]) => {
        if (!active) return
        setRoles(rolesJson?.data?.items || [])
        setCatalog(catalogJson?.data?.modules || [])
        setEmploymentOptions({
          departments: optionsJson?.data?.departments || [],
          designations: optionsJson?.data?.designations || [],
        })
      })
      .catch((error) => { if (active) setLoadError(error.message || 'Could not load bulk user form') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [mayInvite])

  const roleById = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles])
  const matchesRoleDefaults = (index, nextPermissions) => {
    const defaults = roleById.get(getValues(`users.${index}.roleId`))?.defaultPermissions || {}
    return catalog.every((module) => module.actions.every((action) =>
      Boolean(nextPermissions?.[module.key]?.[action.key]) === Boolean(defaults?.[module.key]?.[action.key])))
  }
  const chooseRole = (index, roleId) => {
    if (permissionsCustomized[index] && !window.confirm('Changing this role will reset the customized permissions for this user. Continue?')) return false
    setValue(`users.${index}.roleId`, roleId, { shouldDirty: true, shouldValidate: true })
    setPermissions((current) => current.map((value, itemIndex) => itemIndex === index ? clonePermissions(roleById.get(roleId)?.defaultPermissions || {}) : value))
    setPermissionsCustomized((current) => current.map((value, itemIndex) => itemIndex === index ? false : value))
    return true
  }
  const addEmploymentOption = (type, value) => {
    setEmploymentOptions((current) => ({
      ...current,
      [type]: mergeEmploymentOptions(current[type], [value]),
    }))
  }
  const addRow = () => {
    if (fields.length >= 25) return
    append(freshRow())
    setPermissions((current) => [...current, {}])
    setPermissionsCustomized((current) => [...current, false])
  }
  const removeRow = (index) => {
    remove(index)
    setPermissions((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setPermissionsCustomized((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setExpanded({})
  }
  const openReview = handleSubmit(() => {
    setReviewing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
  const submit = async () => {
    if (!(await trigger())) {
      setReviewing(false)
      return
    }
    try {
      setSaving(true)
      const payload = getValues('users').map((values, index) => buildUserPayload(values, permissions[index], { includeSalary: isAdmin }))
      const json = await userService.bulkCreate(payload)
      setResult(json?.data || null)
      setReviewing(false)
    } catch (requestError) {
      if (mapApiErrors(requestError, setError)) setReviewing(false)
      else setLoadError(requestError.message || 'Could not add users')
    } finally {
      setSaving(false)
    }
  }

  const resend = async (id) => {
    try {
      setResendingId(id)
      const json = await userService.resendInvite(id)
      setResult((current) => ({
        ...current,
        items: current.items.map((item) => item.id === id ? { ...item, emailSent: Boolean(json?.data?.emailSent) } : item),
        summary: {
          ...current.summary,
          inviteSent: current.items.filter((item) => item.id === id ? json?.data?.emailSent : item.emailSent).length,
          inviteFailed: current.items.filter((item) => !(item.id === id ? json?.data?.emailSent : item.emailSent)).length,
        },
      }))
    } catch (requestError) {
      setLoadError(requestError.message || 'Could not resend invitation')
    } finally {
      setResendingId('')
    }
  }

  if (!mayInvite) return <Card><CardBody className="text-center py-5"><Icon icon="shield-alert" className="fs-1 text-muted mb-3" /><h3>You cannot add users</h3><Button as={Link} to="/app/users" variant="outline-primary">Back to users</Button></CardBody></Card>
  if (loading) return <div className="text-center py-5"><Spinner animation="border" /><div className="text-muted mt-2">Loading bulk user form…</div></div>

  if (result) return <>
    <PageBreadcrumb title="Bulk Add Complete" subtitle="Team management" />
    <Card><CardBody className="text-center py-5"><div className="avatar-lg rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mb-3"><Icon icon="check" className="fs-2" /></div><h3>{result.summary?.created || 0} users created</h3><p className="text-muted mb-4">{result.summary?.inviteSent || 0} invitations sent · {result.summary?.inviteFailed || 0} delivery failures</p>{loadError && <Alert variant="danger" className="mx-auto" style={{ maxWidth: 560 }}>{loadError}</Alert>}<div className="d-flex flex-column gap-2 mx-auto text-start" style={{ maxWidth: 560 }}>{result.items?.map((item) => <div key={item.id} className="border rounded p-3 d-flex justify-content-between align-items-center gap-3"><div><div className="fw-semibold">{item.fullName}</div><div className="text-muted fs-sm">{item.email}</div></div>{item.emailSent ? <Badge bg="success-subtle" text="success">Invite sent</Badge> : <Button size="sm" variant="outline-danger" disabled={resendingId === item.id} onClick={() => resend(item.id)}>{resendingId === item.id && <Spinner size="sm" className="me-1" />}Resend</Button>}</div>)}</div><div className="d-flex justify-content-center gap-2 mt-4"><Button variant="outline-primary" onClick={() => navigate('/app/users')}>View users</Button><Button onClick={() => window.location.reload()}>Add another batch</Button></div></CardBody></Card>
  </>

  if (reviewing) {
    const rows = getValues('users')
    return <>
      <PageBreadcrumb title="Review Users" subtitle="Team management" />
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3"><div><h3 className="mb-1">Review {rows.length} {rows.length === 1 ? 'user' : 'users'}</h3><p className="text-muted mb-0">Confirm these invitations before creating the memberships.</p></div><Button variant="outline-secondary" onClick={() => setReviewing(false)} disabled={saving}><Icon icon="arrow-left" className="me-1" />Continue editing</Button></div>
      <Row className="g-3">{rows.map((row, index) => <Col lg={6} key={`${row.email}-${index}`}><Card className="h-100"><CardBody className="p-3"><div className="d-flex justify-content-between gap-2"><div><h5 className="mb-1">{row.fullName}</h5><div className="text-muted fs-sm">{row.email}</div></div><div className="d-flex flex-column align-items-end gap-1"><Badge bg="primary-subtle" text="primary">{roleById.get(row.roleId)?.name || 'Role'}</Badge>{permissionsCustomized[index] && <Badge bg="info-subtle" text="info">Customized</Badge>}</div></div><hr /><div className="text-muted fs-sm">{[row.designation, row.department].filter(Boolean).join(' · ') || 'No employment details'}</div><div className="text-muted fs-sm mt-2">{catalog.reduce((total, module) => total + module.actions.filter((action) => permissions[index]?.[module.key]?.[action.key]).length, 0)} permissions enabled</div></CardBody></Card></Col>)}</Row>
      <div className="d-flex justify-content-end gap-2 mt-3"><Button variant="outline-secondary" onClick={() => setReviewing(false)} disabled={saving}>Back</Button><Button onClick={submit} disabled={saving}>{saving && <Spinner size="sm" className="me-2" />}Create users and send invites</Button></div>
    </>
  }

  return <>
    <PageBreadcrumb title="Bulk Add Users" subtitle="Team management" />
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3"><div><h3 className="mb-1">Bulk add users</h3><p className="text-muted mb-0">Prepare up to 25 invitations, each with its own role and permissions.</p></div><Button as={Link} to="/app/users" variant="outline-secondary"><Icon icon="arrow-left" className="me-1" />Back</Button></div>
    {loadError && <Alert variant="danger">{loadError}</Alert>}
    <Form onSubmit={openReview} noValidate>
      <div className="vstack gap-3">{fields.map((field, index) => {
        const rowErrors = errors.users?.[index] || {}
        return <Card key={field.id}><CardBody><div className="d-flex justify-content-between align-items-center gap-2 mb-3"><div><h5 className="mb-0">User {index + 1}</h5><span className="text-muted fs-sm">Identity, employment, and access</span></div>{fields.length > 1 && <Button type="button" size="sm" variant="outline-danger" onClick={() => removeRow(index)} aria-label={`Remove user ${index + 1}`}><Icon icon="trash-2" /></Button>}</div>
          <Row className="g-3">
            <Col md={6} xl={3}><Form.Group><Form.Label>Full name <span className="text-danger">*</span></Form.Label><FormControl maxLength={100} isInvalid={Boolean(rowErrors.fullName)} {...register(`users.${index}.fullName`, fieldRules.fullName)} /><Form.Control.Feedback type="invalid">{rowErrors.fullName?.message}</Form.Control.Feedback></Form.Group></Col>
            <Col md={6} xl={3}><Form.Group><Form.Label>Email <span className="text-danger">*</span></Form.Label><FormControl type="email" maxLength={254} isInvalid={Boolean(rowErrors.email)} {...register(`users.${index}.email`, fieldRules.email)} /><Form.Control.Feedback type="invalid">{rowErrors.email?.message}</Form.Control.Feedback></Form.Group></Col>
            <Col md={6} xl={3}><Form.Group><Form.Label>Role <span className="text-danger">*</span></Form.Label><Controller name={`users.${index}.roleId`} control={control} rules={{ required: 'Please select a role' }} render={({ field: roleField }) => <FormSelect {...roleField} onChange={(event) => { if (chooseRole(index, event.target.value)) roleField.onChange(event) }} isInvalid={Boolean(rowErrors.roleId)}><option value="">Select a role</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</FormSelect>} /><Form.Control.Feedback type="invalid">{rowErrors.roleId?.message}</Form.Control.Feedback></Form.Group></Col>
            <Col md={6} xl={3}><Form.Group><Form.Label>Joining date</Form.Label><FormControl type="date" isInvalid={Boolean(rowErrors.joiningDate)} {...register(`users.${index}.joiningDate`)} /><Form.Control.Feedback type="invalid">{rowErrors.joiningDate?.message}</Form.Control.Feedback></Form.Group></Col>
            <Col md={6} xl={isAdmin ? 4 : 6}><Form.Group><Form.Label>Designation</Form.Label><Controller name={`users.${index}.designation`} control={control} rules={fieldRules.optionalText} render={({ field: designationField }) => <EmploymentCreatableSelect inputId={`bulkDesignation${index}`} name={designationField.name} value={designationField.value} options={employmentOptions.designations} onChange={designationField.onChange} onBlur={designationField.onBlur} onCreateValue={(value) => addEmploymentOption('designations', value)} isInvalid={Boolean(rowErrors.designation)} placeholder="Select or create designation" ariaDescribedBy={`bulkDesignationError${index}`} />} /><Form.Control.Feedback id={`bulkDesignationError${index}`} type="invalid">{rowErrors.designation?.message}</Form.Control.Feedback></Form.Group></Col>
            <Col md={6} xl={isAdmin ? 4 : 6}><Form.Group><Form.Label>Department</Form.Label><Controller name={`users.${index}.department`} control={control} rules={fieldRules.optionalText} render={({ field: departmentField }) => <EmploymentCreatableSelect inputId={`bulkDepartment${index}`} name={departmentField.name} value={departmentField.value} options={employmentOptions.departments} onChange={departmentField.onChange} onBlur={departmentField.onBlur} onCreateValue={(value) => addEmploymentOption('departments', value)} isInvalid={Boolean(rowErrors.department)} placeholder="Select or create department" ariaDescribedBy={`bulkDepartmentError${index}`} />} /><Form.Control.Feedback id={`bulkDepartmentError${index}`} type="invalid">{rowErrors.department?.message}</Form.Control.Feedback></Form.Group></Col>
            {isAdmin && <Col md={6} xl={4}><Form.Group><Form.Label>Monthly salary</Form.Label><FormControl type="number" min="0" max="999999999.99" step="0.01" isInvalid={Boolean(rowErrors.salary)} {...register(`users.${index}.salary`, fieldRules.salary)} /><Form.Control.Feedback type="invalid">{rowErrors.salary?.message}</Form.Control.Feedback></Form.Group></Col>}
          </Row>
          <Button type="button" variant="link" className="px-0 mt-3" onClick={() => setExpanded((current) => ({ ...current, [field.id]: !current[field.id] }))} aria-expanded={Boolean(expanded[field.id])}><Icon icon={expanded[field.id] ? 'chevron-up' : 'chevron-down'} className="me-1" />Customize permissions</Button>
          <Collapse in={Boolean(expanded[field.id])}><div><div className="user-permissions-scroll user-permissions-scroll--bulk border-top pt-3" tabIndex={0} aria-label={`Custom permissions for user ${index + 1}`}><PermissionMatrix catalog={catalog} value={permissions[index] || {}} onChange={(next) => { setPermissions((current) => current.map((value, itemIndex) => itemIndex === index ? next : value)); setPermissionsCustomized((current) => current.map((value, itemIndex) => itemIndex === index ? !matchesRoleDefaults(index, next) : value)) }} /></div></div></Collapse>
        </CardBody></Card>
      })}</div>
      <div className="d-flex flex-wrap justify-content-between gap-2 mt-3"><Button type="button" variant="outline-primary" onClick={addRow} disabled={fields.length >= 25}><Icon icon="plus" className="me-1" />Add row ({fields.length}/25)</Button><Button type="submit">Review users<Icon icon="arrow-right" className="ms-1" /></Button></div>
    </Form>
  </>
}

export default BulkUsersPage
