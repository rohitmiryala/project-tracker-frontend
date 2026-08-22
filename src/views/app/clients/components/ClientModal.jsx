import Icon from '@/components/wrappers/Icon'
import { clientService } from '@/services/clientService'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useEffect, useState } from 'react'
import {
  Button,
  Col,
  Form,
  FormControl,
  FormSelect,
  Modal,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip,
} from 'react-bootstrap'
import { useForm } from 'react-hook-form'

const CURRENCIES = ['AUD', 'CAD', 'CHF', 'EUR', 'GBP', 'INR', 'JPY', 'NZD', 'SGD', 'USD']

const emptyForm = {
  name: '',
  contactPersonName: '',
  email: '',
  currency: 'INR',
  notes: '',
  isActive: true,
}

const ClientModal = ({ show, onHide, clientId, onSaved }) => {
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sameAsName, setSameAsName] = useState(false)
  const isEdit = Boolean(clientId)

  const {
    register,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm })

  const clientName = watch('name')

  useEffect(() => {
    if (!show) return
    setSameAsName(false)
    if (!clientId) {
      reset(emptyForm)
      return
    }
    let alive = true
    ;(async () => {
      setLoading(true)
      try {
        const json = await clientService.getById(clientId)
        if (!alive) return
        const d = json?.data
        reset({
          name: d?.name || '',
          contactPersonName: d?.contactPersonName || '',
          email: d?.email || '',
          currency: d?.currency || 'INR',
          notes: d?.notes || '',
          isActive: d?.isActive ?? true,
        })
      } catch (err) {
        if (alive) showNotification({ title: 'Client', message: err.message || 'Load failed', variant: 'danger' })
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [show, clientId, reset, showNotification])

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      contactPersonName: values.contactPersonName.trim() || null,
      email: values.email.trim() || null,
      currency: values.currency || null,
      notes: values.notes.trim() || null,
    }


    try {
      setSaving(true)
      if (isEdit) {
        await clientService.update(clientId, payload)
      } else {
        await clientService.create(payload)
      }
      showNotification({
        title: 'Client',
        message: isEdit ? 'Client updated' : 'Client created',
        variant: 'success',
      })
      onSaved?.()
      onHide()
    } catch (err) {
      showNotification({ title: 'Client', message: err.message || 'Save failed', variant: 'danger' })
    } finally {
      setSaving(false)
    }
  })

  return (
    <Modal show={show} onHide={onHide} centered scrollable backdrop="static" keyboard={false}>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Client' : 'Add Client'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading && (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          )}
          {!loading && (
            <>
              <Form.Group className="mb-3" controlId="clientName">
                <Form.Label>
                  Client name <span className="text-danger">*</span>
                </Form.Label>
                <FormControl
                  {...register('name', {
                    required: 'Client name is required',
                    minLength: { value: 2, message: 'Min 2 characters' },
                    maxLength: { value: 100, message: 'Max 100 characters' },
                  })}
                  placeholder="e.g. Acme Corp"
                  isInvalid={Boolean(errors.name)}
                />
                <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="clientContact">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <Form.Label className="mb-0">
                    Contact person
                    <OverlayTrigger placement="top" overlay={<Tooltip>Primary point-of-contact for this client.</Tooltip>}>
                      <span className="ms-1 text-muted" role="button" tabIndex={0}>
                        <Icon icon="circle-help" className="fs-sm" />
                      </span>
                    </OverlayTrigger>
                  </Form.Label>
                  <Form.Check
                    type="checkbox"
                    id="sameAsClientName"
                    label="Same as client name"
                    className="fs-sm"
                    checked={sameAsName}
                    onChange={(e) => {
                      setSameAsName(e.target.checked)
                      if (e.target.checked) {
                        setValue('contactPersonName', clientName || '')
                      }
                    }}
                  />
                </div>
                <FormControl
                  {...register('contactPersonName', { maxLength: { value: 100, message: 'Max 100 characters' } })}
                  placeholder="John Doe"
                  disabled={sameAsName}
                  value={sameAsName ? clientName || '' : undefined}
                  isInvalid={Boolean(errors.contactPersonName)}
                />
                <Form.Control.Feedback type="invalid">{errors.contactPersonName?.message}</Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={7}>
                  <Form.Group className="mb-3" controlId="clientEmail">
                    <Form.Label>Email</Form.Label>
                    <FormControl
                      type="email"
                      {...register('email', {
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                      })}
                      placeholder="contact@acme.com"
                      isInvalid={Boolean(errors.email)}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group className="mb-3" controlId="clientCurrency">
                    <Form.Label>
                      Preferred currency
                      <OverlayTrigger placement="top" overlay={<Tooltip>Default billing currency for projects under this client.</Tooltip>}>
                        <span className="ms-1 text-muted" role="button" tabIndex={0}>
                          <Icon icon="circle-help" className="fs-sm" />
                        </span>
                      </OverlayTrigger>
                    </Form.Label>
                    <FormSelect {...register('currency')}>
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </FormSelect>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="clientNotes">
                <Form.Label>Notes</Form.Label>
                <FormControl
                  as="textarea"
                  rows={3}
                  maxLength={500}
                  {...register('notes', { maxLength: { value: 500, message: 'Max 500 characters' } })}
                  placeholder="Internal notes about this client..."
                  isInvalid={Boolean(errors.notes)}
                />
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <Form.Control.Feedback type="invalid" className="d-block m-0">{errors.notes?.message}</Form.Control.Feedback>
                  <span className={`fs-xs ms-auto ${(watch('notes') || '').length >= 500 ? 'text-danger' : 'text-muted'}`}>
                    {(watch('notes') || '').length}/500
                  </span>
                </div>
              </Form.Group>

            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onHide} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving || loading}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add client'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ClientModal
