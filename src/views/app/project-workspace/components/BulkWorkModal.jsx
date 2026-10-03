import Icon from "@/components/wrappers/Icon";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
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
import {
  buildBulkPayload,
  countBulkItems,
  mapBulkApiErrors,
  validateBulkSections,
} from "../bulkWorkUtils";

const priorities = ["low", "medium", "high", "critical"];
const statuses = ["planned", "active", "on_hold", "completed", "cancelled"];
let idSequence = 0;
const createId = (prefix) => `${prefix}-${++idSequence}`;
const titleCase = (value) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const createDeliverable = (source = {}) => ({
  id: createId("deliverable"),
  title: source.title || "",
  description: source.description || "",
  priority: source.priority || "medium",
  estimatedHours: source.estimatedHours ?? "",
});

const createNewSection = () => ({
  id: createId("section"),
  type: "new",
  name: "",
  description: "",
  ownerId: "",
  status: "planned",
  priority: "medium",
  color: "#5b5bd6",
  startDate: "",
  targetDate: "",
  deliverables: [createDeliverable()],
});

const FieldError = ({ message }) =>
  message ? <div className="invalid-feedback d-block">{message}</div> : null;

const BulkWorkModal = ({
  show,
  workstreams,
  memberOptions,
  onClose,
  onSubmit,
}) => {
  const [sections, setSections] = useState([]);
  const [selectedWorkstreamId, setSelectedWorkstreamId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!show) return undefined;
    const timer = window.setTimeout(() => {
      setSections([createNewSection()]);
      setSelectedWorkstreamId("");
      setFieldErrors({});
      setSubmitError("");
      setIsSubmitting(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [show]);

  const totalItems = countBulkItems(sections);
  const usedExistingIds = useMemo(
    () =>
      new Set(
        sections
          .filter((section) => section.type === "existing")
          .map((section) => section.workstreamId),
      ),
    [sections],
  );
  const hasUnassigned = sections.some(
    (section) => section.type === "unassigned",
  );
  const availableWorkstreams = workstreams.filter(
    (item) => !usedExistingIds.has(item._id),
  );

  const clearFieldError = (id, field) => {
    const key = `${id}.${field}`;
    if (!fieldErrors[key]) return;
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const updateSection = (sectionId, field, value) => {
    clearFieldError(sectionId, field);
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section,
      ),
    );
  };

  const updateDeliverable = (sectionId, deliverableId, field, value) => {
    clearFieldError(deliverableId, field);
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              deliverables: section.deliverables.map((item) =>
                item.id === deliverableId ? { ...item, [field]: value } : item,
              ),
            }
          : section,
      ),
    );
  };

  const addNewSection = () => {
    if (totalItems > 98) return;
    setSections((current) => [...current, createNewSection()]);
  };

  const addExistingSection = () => {
    const workstream = workstreams.find(
      (item) => item._id === selectedWorkstreamId,
    );
    if (!workstream || totalItems >= 100) return;
    setSections((current) => [
      ...current,
      {
        id: createId("section"),
        type: "existing",
        workstreamId: workstream._id,
        name: workstream.name,
        color: workstream.color,
        deliverables: [createDeliverable()],
      },
    ]);
    setSelectedWorkstreamId("");
  };

  const addUnassignedSection = () => {
    if (hasUnassigned || totalItems >= 100) return;
    setSections((current) => [
      ...current,
      {
        id: createId("section"),
        type: "unassigned",
        name: "Unassigned",
        deliverables: [createDeliverable()],
      },
    ]);
  };

  const addDeliverable = (sectionId) => {
    if (totalItems >= 100) return;
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              deliverables: [...section.deliverables, createDeliverable()],
            }
          : section,
      ),
    );
  };

  const duplicateDeliverable = (sectionId, source) => {
    if (totalItems >= 100) return;
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              deliverables: [
                ...section.deliverables,
                createDeliverable(source),
              ],
            }
          : section,
      ),
    );
  };

  const removeDeliverable = (sectionId, deliverableId) =>
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              deliverables: section.deliverables.filter(
                (item) => item.id !== deliverableId,
              ),
            }
          : section,
      ),
    );

  const submit = async (event) => {
    event.preventDefault();
    const clientErrors = validateBulkSections(sections);
    setFieldErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      setSubmitError(
        "Review the highlighted fields before creating this batch.",
      );
      return;
    }

    const { payload, meta } = buildBulkPayload(sections);
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (error) {
      const serverErrors = mapBulkApiErrors(error, meta);
      setFieldErrors(serverErrors);
      setSubmitError(
        Object.keys(serverErrors).length
          ? "The server found fields that need attention. Nothing was created."
          : error.message ||
              "The batch could not be created. Nothing was changed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={isSubmitting ? undefined : onClose}
      centered
      scrollable
      size="xl"
      fullscreen="sm-down"
      restoreFocus
      dialogClassName="bulk-work-modal"
    >
      <Form className="bulk-work-form" onSubmit={submit} noValidate>
        <Modal.Header closeButton={!isSubmitting}>
          <div>
            <Modal.Title>Bulk add work</Modal.Title>
            <p className="text-muted mb-0 mt-1">
              Define Workstreams and their Deliverables before creating the
              complete structure.
            </p>
          </div>
        </Modal.Header>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" role="alert">
              {submitError}
            </Alert>
          )}
          <div className="bulk-work-toolbar">
            <div className="d-flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline-primary"
                onClick={addNewSection}
                disabled={totalItems > 98}
              >
                <Icon icon="layers-3" className="me-1" />
                New Workstream
              </Button>
              <div className="bulk-existing-picker">
                <FormSelect
                  aria-label="Choose an existing Workstream"
                  value={selectedWorkstreamId}
                  onChange={(event) =>
                    setSelectedWorkstreamId(event.target.value)
                  }
                  disabled={!availableWorkstreams.length || totalItems >= 100}
                >
                  <option value="">Existing Workstream…</option>
                  {availableWorkstreams.map((item) => (
                    <option value={item._id} key={item._id}>
                      {item.name}
                    </option>
                  ))}
                </FormSelect>
                <Button
                  type="button"
                  variant="outline-primary"
                  onClick={addExistingSection}
                  disabled={!selectedWorkstreamId || totalItems >= 100}
                >
                  Add
                </Button>
              </div>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={addUnassignedSection}
                disabled={hasUnassigned || totalItems >= 100}
              >
                Add unassigned
              </Button>
            </div>
            <Badge
              bg={totalItems >= 100 ? "danger" : "light"}
              text={totalItems >= 100 ? undefined : "dark"}
            >
              {totalItems}/100 items
            </Badge>
          </div>

          {sections.length === 0 ? (
            <div className="bulk-work-empty">
              <h5>No work added</h5>
              <p className="mb-0">
                Add a new Workstream, choose an existing one, or create
                unassigned Deliverables.
              </p>
            </div>
          ) : (
            <div className="bulk-work-outline">
              {sections.map((section) => (
                <section className="bulk-work-section" key={section.id}>
                  <div className="bulk-work-section__header">
                    <div className="d-flex align-items-center gap-2 min-w-0">
                      <span
                        className="workstream-color"
                        style={{
                          backgroundColor:
                            section.color || "var(--bs-secondary)",
                        }}
                      />
                      <div className="min-w-0">
                        <strong className="d-block text-truncate">
                          {section.type === "new"
                            ? section.name || "New Workstream"
                            : section.name}
                        </strong>
                        <small className="text-muted">
                          {section.deliverables.length} Deliverable
                          {section.deliverables.length === 1 ? "" : "s"}
                        </small>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      className="text-danger"
                      aria-label={`Remove ${section.name || "new Workstream"} section`}
                      onClick={() =>
                        setSections((current) =>
                          current.filter((item) => item.id !== section.id),
                        )
                      }
                    >
                      <Icon icon="trash-2" />
                    </Button>
                  </div>

                  {section.type === "new" && (
                    <div className="bulk-work-section__fields">
                      <Row className="g-3">
                        <Col lg={7}>
                          <Form.Group controlId={`${section.id}-name`}>
                            <FormLabel>Workstream name *</FormLabel>
                            <FormControl
                              value={section.name}
                              maxLength={150}
                              isInvalid={Boolean(
                                fieldErrors[`${section.id}.name`],
                              )}
                              onChange={(event) =>
                                updateSection(
                                  section.id,
                                  "name",
                                  event.target.value,
                                )
                              }
                            />
                            <FieldError
                              message={fieldErrors[`${section.id}.name`]}
                            />
                          </Form.Group>
                        </Col>
                        <Col sm={8} lg={3}>
                          <Form.Group controlId={`${section.id}-priority`}>
                            <FormLabel>Priority</FormLabel>
                            <FormSelect
                              value={section.priority}
                              onChange={(event) =>
                                updateSection(
                                  section.id,
                                  "priority",
                                  event.target.value,
                                )
                              }
                            >
                              {priorities.map((value) => (
                                <option value={value} key={value}>
                                  {titleCase(value)}
                                </option>
                              ))}
                            </FormSelect>
                          </Form.Group>
                        </Col>
                        <Col sm={4} lg={2}>
                          <Form.Group controlId={`${section.id}-color`}>
                            <FormLabel>Color</FormLabel>
                            <FormControl
                              type="color"
                              value={section.color}
                              onChange={(event) =>
                                updateSection(
                                  section.id,
                                  "color",
                                  event.target.value,
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <details className="bulk-advanced-fields">
                        <summary>Advanced Workstream details</summary>
                        <Row className="g-3 mt-1">
                          <Col xs={12}>
                            <Form.Group controlId={`${section.id}-description`}>
                              <FormLabel>Description</FormLabel>
                              <FormControl
                                as="textarea"
                                rows={2}
                                maxLength={500}
                                value={section.description}
                                isInvalid={Boolean(
                                  fieldErrors[`${section.id}.description`],
                                )}
                                onChange={(event) =>
                                  updateSection(
                                    section.id,
                                    "description",
                                    event.target.value,
                                  )
                                }
                              />
                              <div className="d-flex justify-content-between gap-3">
                                <FieldError
                                  message={
                                    fieldErrors[`${section.id}.description`]
                                  }
                                />
                                <Form.Text className="ms-auto">
                                  {section.description.length}/500
                                </Form.Text>
                              </div>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId={`${section.id}-owner`}>
                              <FormLabel>Owner</FormLabel>
                              <FormSelect
                                value={section.ownerId}
                                onChange={(event) =>
                                  updateSection(
                                    section.id,
                                    "ownerId",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="">Unassigned</option>
                                {memberOptions.map((option) => (
                                  <option
                                    value={option.value}
                                    key={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </FormSelect>
                              <FieldError
                                message={fieldErrors[`${section.id}.ownerId`]}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId={`${section.id}-status`}>
                              <FormLabel>Status</FormLabel>
                              <FormSelect
                                value={section.status}
                                onChange={(event) =>
                                  updateSection(
                                    section.id,
                                    "status",
                                    event.target.value,
                                  )
                                }
                              >
                                {statuses.map((value) => (
                                  <option value={value} key={value}>
                                    {titleCase(value)}
                                  </option>
                                ))}
                              </FormSelect>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId={`${section.id}-start-date`}>
                              <FormLabel>Start date</FormLabel>
                              <FormControl
                                type="date"
                                value={section.startDate}
                                onChange={(event) =>
                                  updateSection(
                                    section.id,
                                    "startDate",
                                    event.target.value,
                                  )
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId={`${section.id}-target-date`}>
                              <FormLabel>Target date</FormLabel>
                              <FormControl
                                type="date"
                                value={section.targetDate}
                                isInvalid={Boolean(
                                  fieldErrors[`${section.id}.targetDate`],
                                )}
                                onChange={(event) =>
                                  updateSection(
                                    section.id,
                                    "targetDate",
                                    event.target.value,
                                  )
                                }
                              />
                              <FieldError
                                message={
                                  fieldErrors[`${section.id}.targetDate`]
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </details>
                    </div>
                  )}

                  <div className="bulk-deliverables">
                    {section.deliverables.map((item, index) => (
                      <div className="bulk-deliverable-row" key={item.id}>
                        <div className="bulk-deliverable-row__number">
                          {index + 1}
                        </div>
                        <div className="bulk-deliverable-row__content">
                          <Row className="g-2 align-items-start">
                            <Col lg={7}>
                              <Form.Group controlId={`${item.id}-title`}>
                                <FormLabel className="visually-hidden">
                                  Deliverable title
                                </FormLabel>
                                <FormControl
                                  placeholder="Deliverable outcome"
                                  maxLength={200}
                                  value={item.title}
                                  isInvalid={Boolean(
                                    fieldErrors[`${item.id}.title`],
                                  )}
                                  onChange={(event) =>
                                    updateDeliverable(
                                      section.id,
                                      item.id,
                                      "title",
                                      event.target.value,
                                    )
                                  }
                                />
                                <FieldError
                                  message={fieldErrors[`${item.id}.title`]}
                                />
                              </Form.Group>
                            </Col>
                            <Col sm={7} lg={3}>
                              <Form.Group controlId={`${item.id}-priority`}>
                                <FormLabel className="visually-hidden">
                                  Priority
                                </FormLabel>
                                <FormSelect
                                  aria-label="Deliverable priority"
                                  value={item.priority}
                                  onChange={(event) =>
                                    updateDeliverable(
                                      section.id,
                                      item.id,
                                      "priority",
                                      event.target.value,
                                    )
                                  }
                                >
                                  {priorities.map((value) => (
                                    <option value={value} key={value}>
                                      {titleCase(value)}
                                    </option>
                                  ))}
                                </FormSelect>
                              </Form.Group>
                            </Col>
                            <Col sm={5} lg={2}>
                              <Form.Group
                                controlId={`${item.id}-estimated-hours`}
                              >
                                <FormLabel className="visually-hidden">
                                  Estimated hours
                                </FormLabel>
                                <FormControl
                                  type="number"
                                  min={0}
                                  max={24}
                                  step={0.5}
                                  placeholder="Hours"
                                  aria-label="Estimated hours"
                                  value={item.estimatedHours}
                                  isInvalid={Boolean(
                                    fieldErrors[`${item.id}.estimatedHours`],
                                  )}
                                  onChange={(event) =>
                                    updateDeliverable(
                                      section.id,
                                      item.id,
                                      "estimatedHours",
                                      event.target.value,
                                    )
                                  }
                                />
                                <FieldError
                                  message={
                                    fieldErrors[`${item.id}.estimatedHours`]
                                  }
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <details className="bulk-advanced-fields bulk-advanced-fields--deliverable">
                            <summary>Add description</summary>
                            <Form.Group controlId={`${item.id}-description`}>
                              <FormLabel className="visually-hidden">
                                Deliverable description
                              </FormLabel>
                              <FormControl
                                as="textarea"
                                rows={2}
                                maxLength={500}
                                placeholder="Description"
                                value={item.description}
                                isInvalid={Boolean(
                                  fieldErrors[`${item.id}.description`],
                                )}
                                onChange={(event) =>
                                  updateDeliverable(
                                    section.id,
                                    item.id,
                                    "description",
                                    event.target.value,
                                  )
                                }
                              />
                              <div className="d-flex justify-content-between gap-3">
                                <FieldError
                                  message={
                                    fieldErrors[`${item.id}.description`]
                                  }
                                />
                                <Form.Text className="ms-auto">
                                  {item.description.length}/500
                                </Form.Text>
                              </div>
                            </Form.Group>
                          </details>
                        </div>
                        <div className="bulk-deliverable-row__actions">
                          <Button
                            type="button"
                            size="sm"
                            variant="link"
                            aria-label={`Duplicate Deliverable ${index + 1}`}
                            onClick={() =>
                              duplicateDeliverable(section.id, item)
                            }
                            disabled={totalItems >= 100}
                          >
                            <Icon icon="copy" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="link"
                            className="text-danger"
                            aria-label={`Remove Deliverable ${index + 1}`}
                            onClick={() =>
                              removeDeliverable(section.id, item.id)
                            }
                          >
                            <Icon icon="trash-2" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      className="bulk-add-deliverable"
                      onClick={() => addDeliverable(section.id)}
                      disabled={totalItems >= 100}
                    >
                      <Icon icon="plus" className="me-1" />
                      Add Deliverable
                    </Button>
                  </div>
                </section>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <span className="text-muted fs-sm me-auto">
            The whole batch is created together. If one item fails, nothing is
            saved.
          </span>
          <Button
            type="button"
            variant="light"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || totalItems === 0}>
            {isSubmitting && <Spinner size="sm" className="me-2" />}
            Create {totalItems} item{totalItems === 1 ? "" : "s"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BulkWorkModal;
