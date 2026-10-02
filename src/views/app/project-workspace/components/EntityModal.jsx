import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Alert, Button, Form, FormControl, FormLabel, FormSelect, Modal, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { setApiFieldErrors } from '../workspaceUtils'

const EntityModal = ({ show, title, submitLabel = 'Save', fields, schema, defaultValues = {}, onClose, onSubmit }) => {
  const [submitError, setSubmitError] = useState('')
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (!show) return undefined
    const timer = window.setTimeout(() => {
      reset(defaultValues)
      setSubmitError('')
    }, 0)
    return () => window.clearTimeout(timer)
  }, [defaultValues, reset, show])

  const submit = handleSubmit(async (values) => {
    setSubmitError('')
    try {
      await onSubmit(values)
      onClose()
    } catch (error) {
      if (!setApiFieldErrors(error, setError)) setSubmitError(error.message || 'The item could not be saved.')
    }
  })

  return (
    <Modal show={show} onHide={isSubmitting ? undefined : onClose} centered restoreFocus>
      <Form onSubmit={submit} noValidate>
        <Modal.Header closeButton={!isSubmitting}><Modal.Title>{title}</Modal.Title></Modal.Header>
        <Modal.Body>
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          {fields.map((field) => (
            <Form.Group className="mb-3" controlId={`entity-${field.name}`} key={field.name}>
              <FormLabel>{field.label}{field.required && <span className="text-danger"> *</span>}</FormLabel>
              {field.type === 'select' ? (
                <FormSelect {...register(field.name)} isInvalid={Boolean(errors[field.name])} disabled={field.disabled}>
                  {field.allowEmpty !== false && <option value="">{field.placeholder || 'Select'}</option>}
                  {(field.options || []).map((option) => <option key={String(option.value)} value={option.value}>{option.label}</option>)}
                </FormSelect>
              ) : field.type === 'checkbox' ? (
                <Form.Check type="switch" label={field.checkboxLabel || field.label} {...register(field.name)} isInvalid={Boolean(errors[field.name])} />
              ) : (
                <FormControl
                  {...register(field.name)}
                  as={field.type === 'textarea' ? 'textarea' : undefined}
                  type={field.type === 'textarea' ? undefined : field.type || 'text'}
                  rows={field.type === 'textarea' ? field.rows || 3 : undefined}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  isInvalid={Boolean(errors[field.name])}
                />
              )}
              <Form.Control.Feedback type="invalid">{errors[field.name]?.message}</Form.Control.Feedback>
              {field.help && <Form.Text>{field.help}</Form.Text>}
            </Form.Group>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="light" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner size="sm" className="me-2" />}{submitLabel}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default EntityModal
