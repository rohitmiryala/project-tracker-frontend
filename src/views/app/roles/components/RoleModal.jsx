import { useNotificationContext } from '@/context/useNotificationContext'
import { roleService } from '@/services/roleService'
import { useEffect, useState } from 'react'
import { Button, Form, FormControl, Modal, Spinner } from 'react-bootstrap'
import { useForm, useWatch } from 'react-hook-form'

const EMPTY_ROLE = { name: '', description: '' }
const containsControlCharacter = (value, { allowWhitespace = false } = {}) =>
  Array.from(value).some((character) => {
    const code = character.charCodeAt(0)
    if (allowWhitespace && [9, 10, 13].includes(code)) return false
    return code <= 31 || code === 127
  })
const hasInvalidNameCharacters = (value) => /[<>]/.test(value) || containsControlCharacter(value)
const hasInvalidDescriptionCharacters = (value) =>
  /[<>]/.test(value) || containsControlCharacter(value, { allowWhitespace: true })

const RoleModal = ({ show, role, onHide, onSaved }) => {
  const { showNotification } = useNotificationContext()
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(role)
  const {
    register,
    reset,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY_ROLE, mode: 'onTouched' })

  const description = useWatch({ control, name: 'description' }) || ''

  useEffect(() => {
    if (!show) return
    reset({ name: role?.name || '', description: role?.description || '' })
  }, [show, role, reset])

  const close = () => {
    if (!saving) onHide()
  }

  const submit = handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || null,
    }
    try {
      setSaving(true)
      if (isEdit) await roleService.update(role.id, payload)
      else await roleService.create(payload)
      showNotification({
        title: 'Roles',
        message: isEdit ? 'Role updated successfully' : 'Role created successfully',
        variant: 'success',
      })
      onSaved?.()
      onHide()
    } catch (error) {
      let mapped = false
      for (const source of error.errorSources || []) {
        const field = String(source.path || '').split('.').at(-1)
        if (field === 'name' || field === 'description') {
          setError(field, { type: 'server', message: source.message })
          mapped = true
        }
      }
      if (!mapped) {
        showNotification({ title: 'Roles', message: error.message || 'Could not save role', variant: 'danger' })
      }
    } finally {
      setSaving(false)
    }
  })

  return (
    <Modal show={show} onHide={close} centered backdrop={saving ? 'static' : true} keyboard={!saving}>
      <Form onSubmit={submit} noValidate>
        <Modal.Header closeButton={!saving}>
          <Modal.Title>{isEdit ? 'Edit Role' : 'Add Role'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-4">
            Define the role label used when organizing employees. Permissions are configured during employee setup.
          </p>
          <Form.Group className="mb-3" controlId="roleName">
            <Form.Label>
              Role name <span className="text-danger">*</span>
            </Form.Label>
            <FormControl
              autoFocus
              maxLength={100}
              placeholder="e.g. Delivery Coordinator"
              aria-describedby="roleNameHelp"
              isInvalid={Boolean(errors.name)}
              {...register('name', {
                required: 'Role name is required',
                validate: (value) => {
                  const trimmed = value.trim()
                  if (!trimmed) return 'Role name is required'
                  if (trimmed.length < 2 || trimmed.length > 100) return 'Role name must be between 2 and 100 characters'
                  if (hasInvalidNameCharacters(trimmed)) return 'Role name contains unsupported characters'
                  return true
                },
              })}
            />
            <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            {!errors.name && <Form.Text id="roleNameHelp">Use a clear title employees will recognize.</Form.Text>}
          </Form.Group>

          <Form.Group controlId="roleDescription">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <Form.Label className="mb-0">Description</Form.Label>
              <span className={`fs-xs ${description.length >= 500 ? 'text-danger' : 'text-muted'}`}>
                {description.length} / 500
              </span>
            </div>
            <FormControl
              as="textarea"
              rows={4}
              maxLength={500}
              placeholder="Explain when this role should be used."
              isInvalid={Boolean(errors.description)}
              {...register('description', {
                maxLength: { value: 500, message: 'Maximum 500 characters allowed' },
                validate: (value) =>
                  !value || !hasInvalidDescriptionCharacters(value) || 'Description contains unsupported characters',
              })}
            />
            <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={close} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving && <Spinner size="sm" className="me-2" />}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add role'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default RoleModal
