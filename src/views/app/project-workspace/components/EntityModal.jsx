import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Form,
  FormControl,
  FormLabel,
  FormSelect,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { setApiFieldErrors } from "../workspaceUtils";

const EntityModal = ({
  show,
  title,
  submitLabel = "Save",
  fields,
  schema,
  defaultValues = {},
  onClose,
  onSubmit,
}) => {
  const [submitError, setSubmitError] = useState("");
  const [characterCounts, setCharacterCounts] = useState({});
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!show) return undefined;
    const timer = window.setTimeout(() => {
      reset(defaultValues);
      setSubmitError("");
      setCharacterCounts({});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [defaultValues, reset, show]);

  const submit = handleSubmit(async (values) => {
    setSubmitError("");
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      if (!setApiFieldErrors(error, setError))
        setSubmitError(error.message || "The item could not be saved.");
    }
  });

  const renderField = (field, compact = false) => {
    const inputRegistration = register(field.name);
    const characterCount =
      characterCounts[field.name] ??
      String(defaultValues[field.name] || "").length;

    return (
      <Form.Group
        className={compact ? undefined : "mb-3"}
        controlId={`entity-${field.name}`}
        key={field.name}
      >
        <FormLabel>
          {field.label}
          {field.required && <span className="text-danger"> *</span>}
        </FormLabel>
        {field.type === "select" ? (
          <FormSelect
            {...inputRegistration}
            isInvalid={Boolean(errors[field.name])}
            disabled={field.disabled}
            aria-required={field.required}
          >
            {field.allowEmpty !== false && (
              <option value="">{field.placeholder || "Select"}</option>
            )}
            {(field.options || []).map((option) => (
              <option key={String(option.value)} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormSelect>
        ) : field.type === "checkbox" ? (
          <Form.Check
            type="switch"
            label={field.checkboxLabel || field.label}
            {...inputRegistration}
            isInvalid={Boolean(errors[field.name])}
          />
        ) : (
          <FormControl
            {...inputRegistration}
            onChange={(event) => {
              inputRegistration.onChange(event);
              if (field.showCharacterCount) {
                setCharacterCounts((current) => ({
                  ...current,
                  [field.name]: event.target.value.length,
                }));
              }
            }}
            as={field.type === "textarea" ? "textarea" : undefined}
            type={field.type === "textarea" ? undefined : field.type || "text"}
            rows={field.type === "textarea" ? field.rows || 3 : undefined}
            min={field.min}
            max={field.max}
            step={field.step}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            isInvalid={Boolean(errors[field.name])}
            aria-required={field.required}
          />
        )}
        <Form.Control.Feedback type="invalid">
          {errors[field.name]?.message}
        </Form.Control.Feedback>
        {field.help && <Form.Text>{field.help}</Form.Text>}
        {field.showCharacterCount && (
          <Form.Text className="d-block text-end" aria-live="polite">
            {characterCount}/{field.maxLength}
          </Form.Text>
        )}
      </Form.Group>
    );
  };

  const renderedFields = fields.map((field, index) => {
    if (!field.row) return renderField(field);
    if (fields.findIndex((item) => item.row === field.row) !== index)
      return null;
    const rowFields = fields.filter((item) => item.row === field.row);
    return (
      <Row className="g-3 mb-3" key={field.row}>
        {rowFields.map((item) => (
          <Col
            md={item.columnWidth || Math.floor(12 / rowFields.length)}
            key={item.name}
          >
            {renderField(item, true)}
          </Col>
        ))}
      </Row>
    );
  });

  return (
    <Modal
      show={show}
      onHide={isSubmitting ? undefined : onClose}
      centered
      scrollable
      size="lg"
      restoreFocus
    >
      <Form className="entity-modal-form" onSubmit={submit} noValidate>
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          {renderedFields}
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="light"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner size="sm" className="me-2" />}
            {submitLabel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EntityModal;
