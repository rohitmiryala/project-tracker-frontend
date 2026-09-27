import Icon from "@/components/wrappers/Icon";
import { useNotificationContext } from "@/context/useNotificationContext";
import { projectService } from "@/services/projectService";
import { workService } from "@/services/workService";
import { useAuth } from "@/hooks/useAuth";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormControl,
  FormLabel,
  FormSelect,
  Modal,
  Nav,
  Offcanvas,
  ProgressBar,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { Link, useLocation, useParams, useSearchParams } from "react-router";

const money = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Not set";
const titleCase = (value = "") =>
  value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
const can = (user, module, action) =>
  user?.membershipType === "admin" ||
  user?.permissions?.[module]?.[action] === true;

const Field = ({ label, children }) => (
  <Form.Group className="mb-3">
    <FormLabel>{label}</FormLabel>
    {children}
  </Form.Group>
);

const EntityModal = ({
  show,
  title,
  submitLabel = "Create",
  fields,
  onClose,
  onSubmit,
}) => {
  const initialValues = () =>
    Object.fromEntries(
      fields.map((field) => [field.name, field.defaultValue ?? ""]),
    );
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const close = () => {
    setValues(initialValues());
    onClose();
  };
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
      close();
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal show={show} onHide={close} centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {fields.map((field) => (
            <Field label={field.label} key={field.name}>
              {field.type === "select" ? (
                <FormSelect
                  required={field.required}
                  value={values[field.name] ?? ""}
                  onChange={(e) =>
                    setValues((current) => ({
                      ...current,
                      [field.name]: e.target.value,
                    }))
                  }
                >
                  <option value="">{field.placeholder || "Select"}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FormSelect>
              ) : (
                <FormControl
                  required={field.required}
                  as={field.type === "textarea" ? "textarea" : undefined}
                  rows={field.type === "textarea" ? 3 : undefined}
                  type={
                    field.type === "textarea" ? undefined : field.type || "text"
                  }
                  min={field.min}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    setValues((current) => ({
                      ...current,
                      [field.name]: e.target.value,
                    }))
                  }
                />
              )}
            </Field>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : submitLabel}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const WorkspaceHeader = ({ project }) => {
  const location = useLocation();
  const { user } = useAuth();
  const tabs = [
    ["overview", "Overview", true],
    ["work", "Work", can(user, "workManagement", "view")],
    ["cycles", "Cycles", can(user, "cycleManagement", "view")],
    ["issues", "Issues", can(user, "issueManagement", "view")],
    ["timeline", "Timeline", can(user, "milestoneManagement", "view")],
    ["team", "Team", can(user, "userManagement", "view")],
    [
      "costs",
      "Costs",
      can(user, "budgetAndFinance", "viewBudget") ||
        can(user, "budgetAndFinance", "viewCost") ||
        can(user, "budgetAndFinance", "viewProfit"),
    ],
    ["activity", "Activity", can(user, "workManagement", "view")],
    [
      "settings",
      "Settings",
      can(user, "settings", "view") || can(user, "projectManagement", "edit"),
    ],
  ].filter(
    ([slug, , allowed]) =>
      allowed && (project.planningMode === "cycles" || slug !== "cycles"),
  );
  return (
    <div className="workspace-header mb-4">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
        <div>
          <Link to="/app/projects" className="text-muted fs-sm">
            <Icon icon="arrow-left" className="me-1" />
            All projects
          </Link>
          <div className="d-flex align-items-center gap-2 mt-2">
            <span className="project-key">{project.key}</span>
            <Badge
              bg={
                project.health === "on_track"
                  ? "success"
                  : project.health === "at_risk"
                    ? "warning"
                    : "danger"
              }
            >
              {titleCase(project.health)}
            </Badge>
          </div>
          <h2 className="mt-2 mb-1">{project.name}</h2>
          <p className="text-muted mb-0">
            {project.client?.name} ·{" "}
            {project.planningMode === "cycles"
              ? "Cycle planning"
              : "Continuous flow"}
          </p>
        </div>
        <div className="workspace-progress">
          <div className="d-flex justify-content-between fs-sm mb-1">
            <span>Project progress</span>
            <strong>{project.completionPercentage || 0}%</strong>
          </div>
          <ProgressBar now={project.completionPercentage || 0} />
        </div>
      </div>
      <Nav className="workspace-tabs flex-nowrap overflow-auto">
        {tabs.map(([slug, label]) => (
          <Nav.Item key={slug}>
            <Nav.Link
              as={Link}
              active={location.pathname.endsWith(`/${slug}`)}
              to={`/app/projects/${project.id}/${slug}`}
            >
              {label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
};

const OverviewView = ({ projectId, project }) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    workService.overview(projectId).then((json) => setData(json.data));
  }, [projectId]);
  if (!data) return <Spinner animation="border" />;
  const stats = [
    ["Deliverables", data.counts.deliverables, "package-check"],
    [
      "Tasks done",
      `${data.counts.completedTasks}/${data.counts.tasks}`,
      "list-checks",
    ],
    ["Open issues", data.counts.openIssues, "circle-alert"],
    ["Workstreams", data.counts.workstreams, "layers-3"],
  ];
  const empty = data.counts.deliverables === 0;
  return (
    <>
      {empty && (
        <div className="workspace-empty mb-4">
          <div>
            <h4>Shape the first piece of work</h4>
            <p>
              Start with a Deliverable. Add a Workstream only when the project
              needs another layer of organization.
            </p>
          </div>
          <Button as={Link} to={`/app/projects/${projectId}/work`}>
            <Icon icon="plus" className="me-1" />
            Create first Deliverable
          </Button>
        </div>
      )}
      <Row className="g-3 mb-4">
        {stats.map(([label, value, icon]) => (
          <Col lg={3} sm={6} key={label}>
            <Card className="h-100">
              <CardBody>
                <Icon icon={icon} className="text-primary fs-3" />
                <div className="display-6 fw-semibold mt-3">{value}</div>
                <div className="text-muted">{label}</div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
      <Row className="g-3">
        <Col lg={7}>
          <Card>
            <CardBody>
              <h5>Delivery pulse</h5>
              <div className="d-flex justify-content-between mt-4">
                <span>Overall completion</span>
                <strong>{project.completionPercentage || 0}%</strong>
              </div>
              <ProgressBar
                now={project.completionPercentage || 0}
                className="mt-2"
              />
              <div className="d-flex justify-content-between mt-4 text-muted">
                <span>Target finish</span>
                <span>{date(project.estimatedEndDate)}</span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col lg={5}>
          <Card>
            <CardBody>
              <h5>{data.activeCycle ? "Active Cycle" : "Next milestone"}</h5>
              {data.activeCycle ? (
                <>
                  <h4 className="mt-3">{data.activeCycle.name}</h4>
                  <p className="text-muted">
                    {data.activeCycle.goal || "No Cycle goal added."}
                  </p>
                  <span>
                    {date(data.activeCycle.startDate)} –{" "}
                    {date(data.activeCycle.endDate)}
                  </span>
                </>
              ) : data.milestones?.[0] ? (
                <>
                  <h4 className="mt-3">{data.milestones[0].name}</h4>
                  <p className="text-muted mb-0">
                    Due {date(data.milestones[0].dueDate)}
                  </p>
                </>
              ) : (
                <p className="text-muted mt-3">No milestone planned yet.</p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const DeliverableDrawer = ({ id, project, onClose, onChanged }) => {
  const { showNotification } = useNotificationContext();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [comment, setComment] = useState("");
  const [timeTask, setTimeTask] = useState("");
  const [hours, setHours] = useState("");
  const load = useCallback(
    () => id && workService.deliverable(id).then((json) => setItem(json.data)),
    [id],
  );
  useEffect(() => {
    load();
  }, [load]);
  const run = async (action, message) => {
    try {
      await action();
      await load();
      onChanged?.();
      showNotification({ title: "Work", message, variant: "success" });
    } catch (error) {
      showNotification({
        title: "Work",
        message: error.message,
        variant: "danger",
      });
    }
  };
  return (
    <Offcanvas
      show={Boolean(id)}
      onHide={onClose}
      placement="end"
      className="work-drawer"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{item?.reference || "Deliverable"}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {!item ? (
          <Spinner animation="border" />
        ) : (
          <>
            <h3>{item.title}</h3>
            <p className="text-muted">
              {item.description || "No description yet."}
            </p>
            <Row className="g-2 mb-4">
              <Col>
                <FormSelect
                disabled={!can(user, "workManagement", "assign")}
                  value={item.status}
                  onChange={(e) =>
                    run(
                      () =>
                        workService.updateDeliverable(item._id, {
                          status: e.target.value,
                          version: item.version,
                        }),
                      "Status updated",
                    )
                  }
                >
                  <option value="backlog">Backlog</option>
                  <option value="ready">Ready</option>
                  <option value="in_progress">In progress</option>
                  <option value="in_review">In review</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </FormSelect>
              </Col>
              <Col>
                <div className="drawer-stat">
                  <span>Progress</span>
                  <strong>{item.completionPercentage}%</strong>
                </div>
              </Col>
            </Row>
            <h5>Tasks</h5>
            {item.tasks?.map((task) => (
              <div className="work-row" key={task._id}>
                <div>
                  <strong>{task.title}</strong>
                  <div className="text-muted fs-xs">
                    {titleCase(task.status)} · {task.actualHours || 0}h logged
                  </div>
                </div>
                <FormSelect
                  className="task-status"
                  value={task.status}
                  onChange={(e) =>
                    run(
                      () =>
                        workService.updateTask(task._id, {
                          status: e.target.value,
                          version: task.version,
                        }),
                      "Task updated",
                    )
                  }
                >
                  <option value="to_do">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="in_review">Review</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                </FormSelect>
              </div>
            ))}
            {can(user, "workManagement", "create") && (
              <div className="d-flex gap-2 mt-3">
                <FormControl
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Add a concrete task"
                />
                <Button
                  disabled={taskTitle.trim().length < 2}
                  onClick={() =>
                    run(async () => {
                      await workService.createTask(project.id, {
                        deliverableId: item._id,
                        title: taskTitle,
                      });
                      setTaskTitle("");
                    }, "Task created")
                  }
                >
                  <Icon icon="plus" />
                </Button>
              </div>
            )}
            {can(user, "timeLogs", "create") && (
              <>
                <hr className="my-4" />
                <h5>Log time</h5>
                <div className="d-flex gap-2">
                  <FormSelect
                    value={timeTask}
                    onChange={(e) => setTimeTask(e.target.value)}
                  >
                    <option value="">Choose task</option>
                    {item.tasks?.map((task) => (
                      <option value={task._id} key={task._id}>
                        {task.title}
                      </option>
                    ))}
                  </FormSelect>
                  <FormControl
                    style={{ maxWidth: 90 }}
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Hours"
                  />
                  <Button
                    variant="outline-primary"
                    disabled={!timeTask || !hours}
                    onClick={() =>
                      run(async () => {
                        await workService.logTime({
                          taskId: timeTask,
                          hoursLogged: Number(hours),
                          date: new Date().toISOString(),
                          note: `Work logged from ${item.reference}`,
                        });
                        setHours("");
                      }, "Time logged")
                    }
                  >
                    Log
                  </Button>
                </div>
              </>
            )}
            <hr className="my-4" />
            <h5>Conversation</h5>
            {item.comments?.map((entry) => (
              <div className="comment" key={entry._id}>
                <strong>
                  {entry.authorId?.userId?.fullName || "Team member"}
                </strong>
                <p>{entry.body}</p>
              </div>
            ))}
            {can(user, "collaboration", "comment") && (
              <div className="d-flex gap-2">
                <FormControl
                  as="textarea"
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add context or mention a teammate"
                />
                <Button
                  disabled={!comment.trim()}
                  onClick={() =>
                    run(async () => {
                      await workService.addComment({
                        projectId: project.id,
                        entityType: "deliverable",
                        entityId: item._id,
                        body: comment,
                      });
                      setComment("");
                    }, "Comment added")
                  }
                >
                  Send
                </Button>
              </div>
            )}
            {can(user, "collaboration", "upload") && (
              <div className="mt-3">
                <FormControl
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const body = new FormData();
                    body.append("file", file);
                    body.append("projectId", project.id);
                    body.append("entityType", "deliverable");
                    body.append("entityId", item._id);
                    run(
                      () => workService.uploadAttachment(body),
                      "Attachment uploaded",
                    );
                  }}
                />
              </div>
            )}
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

const WorkView = ({ project }) => {
  const { showNotification } = useNotificationContext();
  const { user } = useAuth();
  const [workstreams, setWorkstreams] = useState([]),
    [deliverables, setDeliverables] = useState([]);
  const [modal, setModal] = useState(null),
    [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      workService.workstreams(project.id),
      workService.deliverables(project.id, { search }),
    ]);
    setWorkstreams(a.data || []);
    setDeliverables(b.data || []);
  }, [project.id, search]);
  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [load]);
  const create = async (values) => {
    try {
      if (modal === "workstream")
        await workService.createWorkstream(project.id, values);
      else
        await workService.createDeliverable(project.id, {
          ...values,
          estimatedHours: values.estimatedHours
            ? Number(values.estimatedHours)
            : null,
          workstreamId: values.workstreamId || null,
        });
      showNotification({
        title: "Work",
        message:
          modal === "workstream" ? "Workstream created" : "Deliverable created",
        variant: "success",
      });
      load();
    } catch (error) {
      showNotification({
        title: "Work",
        message: error.message,
        variant: "danger",
      });
      throw error;
    }
  };
  const groups = [
    "backlog",
    "ready",
    "in_progress",
    "in_review",
    "blocked",
    "done",
  ];
  const workstreamOptions = workstreams.map((item) => ({
    value: item._id,
    label: item.name,
  }));
  return (
    <>
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
        <FormControl
          className="workspace-search"
          placeholder="Search Deliverables"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {can(user, "workManagement", "create") && (
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              onClick={() => setModal("workstream")}
            >
              Add Workstream
            </Button>
            <Button onClick={() => setModal("deliverable")}>
              <Icon icon="plus" className="me-1" />
              Add Deliverable
            </Button>
          </div>
        )}
      </div>
      {deliverables.length === 0 ? (
        <div className="workspace-empty">
          <div>
            <h4>No Deliverables yet</h4>
            <p>Define the first outcome this project must produce.</p>
          </div>
          {can(user, "workManagement", "create") && (
            <Button onClick={() => setModal("deliverable")}>
              Create Deliverable
            </Button>
          )}
        </div>
      ) : (
        <div className="work-board">
          {groups.map((status) => (
            <section className="work-column" key={status}>
              <div className="work-column-title">
                <span>{titleCase(status)}</span>
                <Badge bg="light" text="dark">
                  {deliverables.filter((item) => item.status === status).length}
                </Badge>
              </div>
              {deliverables
                .filter((item) => item.status === status)
                .map((item) => (
                  <button
                    className="deliverable-card"
                    key={item._id}
                    onClick={() => setSearchParams({ deliverable: item._id })}
                  >
                    <div className="d-flex justify-content-between">
                      <span className="reference">{item.reference}</span>
                      <span className={`priority priority-${item.priority}`}>
                        {item.priority}
                      </span>
                    </div>
                    <strong>{item.title}</strong>
                    <small>
                      {item.workstreamId?.name || "Unsorted"} ·{" "}
                      {item.totalTasks} tasks
                    </small>
                    <ProgressBar now={item.completionPercentage} />
                  </button>
                ))}
            </section>
          ))}
        </div>
      )}
      <EntityModal
        show={modal === "workstream"}
        title="New Workstream"
        fields={[
          {
            name: "name",
            label: "Name",
            required: true,
            placeholder: "e.g. Authentication",
          },
          { name: "description", label: "Description", type: "textarea" },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            defaultValue: "medium",
            options: ["low", "medium", "high", "critical"].map((value) => ({
              value,
              label: titleCase(value),
            })),
          },
        ]}
        onClose={() => setModal(null)}
        onSubmit={create}
      />
      <EntityModal
        show={modal === "deliverable"}
        title="New Deliverable"
        fields={[
          {
            name: "title",
            label: "Outcome to deliver",
            required: true,
            placeholder: "e.g. Password reset",
          },
          { name: "description", label: "Description", type: "textarea" },
          {
            name: "workstreamId",
            label: "Workstream",
            type: "select",
            options: workstreamOptions,
          },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            defaultValue: "medium",
            options: ["low", "medium", "high", "critical"].map((value) => ({
              value,
              label: titleCase(value),
            })),
          },
          {
            name: "estimatedHours",
            label: "Estimated hours",
            type: "number",
            min: 0,
          },
        ]}
        onClose={() => setModal(null)}
        onSubmit={create}
      />
      <DeliverableDrawer
        id={searchParams.get("deliverable")}
        project={project}
        onClose={() => setSearchParams({})}
        onChanged={load}
      />
    </>
  );
};

const CyclesView = ({ project }) => {
  const { user } = useAuth();
  const { showNotification } = useNotificationContext();
  const [cycles, setCycles] = useState([]),
    [deliverables, setDeliverables] = useState([]),
    [show, setShow] = useState(false);
  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      workService.cycles(project.id),
      workService.deliverables(project.id),
    ]);
    setCycles(a.data || []);
    setDeliverables(b.data || []);
  }, [project.id]);
  useEffect(() => {
    Promise.all([
      workService.cycles(project.id),
      workService.deliverables(project.id),
    ]).then(([cycleResponse, deliverableResponse]) => {
      setCycles(cycleResponse.data || []);
      setDeliverables(deliverableResponse.data || []);
    });
  }, [project.id]);
  const run = async (fn, message) => {
    try {
      await fn();
      showNotification({ title: "Cycles", message, variant: "success" });
      load();
    } catch (error) {
      showNotification({
        title: "Cycles",
        message: error.message,
        variant: "danger",
      });
    }
  };
  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <div>
          <h4>Plan outcomes, not busywork</h4>
          <p className="text-muted mb-0">
            Deliverables enter a Cycle; their Tasks follow automatically.
          </p>
        </div>
        {can(user, "cycleManagement", "create") && (
          <Button onClick={() => setShow(true)}>Create Cycle</Button>
        )}
      </div>
      <Row className="g-3">
        {cycles.map((cycle) => {
          const selected = deliverables.filter(
            (item) =>
              item.cycleId?._id === cycle._id || item.cycleId === cycle._id,
          );
          const planned = selected.reduce(
            (sum, item) => sum + Number(item.estimatedHours || 0),
            0,
          );
          return (
            <Col xl={6} key={cycle._id}>
              <Card className="h-100">
                <CardBody>
                  <div className="d-flex justify-content-between">
                    <div>
                      <Badge
                        bg={
                          cycle.status === "active"
                            ? "primary"
                            : cycle.status === "completed"
                              ? "success"
                              : "secondary"
                        }
                      >
                        {titleCase(cycle.status)}
                      </Badge>
                      <h4 className="mt-2">{cycle.name}</h4>
                    </div>
                    <div className="text-end">
                      <strong>
                        {planned}/{cycle.capacityHours}h
                      </strong>
                      <div className="text-muted fs-xs">planned capacity</div>
                    </div>
                  </div>
                  <p className="text-muted">{cycle.goal || "No goal set."}</p>
                  <div className="cycle-items">
                    {selected.map((item) => (
                      <div key={item._id}>
                        {item.reference} · {item.title}
                      </div>
                    ))}
                  </div>
                  {cycle.status === "planned" &&
                    (can(user, "workManagement", "move") ||
                      can(user, "cycleManagement", "start")) && (
                      <div className="d-flex gap-2 mt-3">
                        {can(user, "workManagement", "move") && (
                          <FormSelect
                            defaultValue=""
                            onChange={(e) => {
                              const item = deliverables.find(
                                (entry) => entry._id === e.target.value,
                              );
                              if (item)
                                run(
                                  () =>
                                    workService.updateDeliverable(item._id, {
                                      cycleId: cycle._id,
                                      version: item.version,
                                    }),
                                  "Deliverable scheduled",
                                );
                            }}
                          >
                            <option value="">Add from backlog…</option>
                            {deliverables
                              .filter((item) => !item.cycleId)
                              .map((item) => (
                                <option key={item._id} value={item._id}>
                                  {item.reference} · {item.title}
                                </option>
                              ))}
                          </FormSelect>
                        )}
                        {can(user, "cycleManagement", "start") && (
                          <Button
                            onClick={() =>
                              run(
                                () =>
                                  workService.cycleAction(cycle._id, "start", {
                                    version: cycle.version,
                                  }),
                                "Cycle started",
                              )
                            }
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    )}
                  {cycle.status === "active" &&
                    can(user, "cycleManagement", "close") && (
                      <Button
                        className="mt-3"
                        variant="outline-primary"
                        onClick={() =>
                          run(
                            () =>
                              workService.cycleAction(cycle._id, "close", {
                                version: cycle.version,
                                returnToBacklog: true,
                              }),
                            "Cycle closed",
                          )
                        }
                      >
                        Close Cycle
                      </Button>
                    )}
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>
      <EntityModal
        show={show}
        title="Create Cycle"
        fields={[
          {
            name: "name",
            label: "Name",
            required: true,
            placeholder: "September Cycle 2",
          },
          { name: "goal", label: "Cycle goal", type: "textarea" },
          {
            name: "startDate",
            label: "Start date",
            type: "date",
            required: true,
          },
          { name: "endDate", label: "End date", type: "date", required: true },
          {
            name: "capacityHours",
            label: "Team capacity (hours)",
            type: "number",
            min: 0,
            defaultValue: 0,
          },
        ]}
        onClose={() => setShow(false)}
        onSubmit={(values) =>
          run(
            () =>
              workService.createCycle(project.id, {
                ...values,
                capacityHours: Number(values.capacityHours || 0),
              }),
            "Cycle created",
          )
        }
      />
    </>
  );
};

const IssuesView = ({ project }) => {
  const { user } = useAuth();
  const { showNotification } = useNotificationContext();
  const [items, setItems] = useState([]),
    [show, setShow] = useState(false);
  const load = useCallback(
    () =>
      workService.issues(project.id).then((json) => setItems(json.data || [])),
    [project.id],
  );
  useEffect(() => {
    load();
  }, [load]);
  const run = async (fn, message) => {
    try {
      await fn();
      showNotification({ title: "Issues", message, variant: "success" });
      load();
    } catch (error) {
      showNotification({
        title: "Issues",
        message: error.message,
        variant: "danger",
      });
      throw error;
    }
  };
  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <div>
          <h4>Issues</h4>
          <p className="text-muted mb-0">
            Triage bugs, risks, questions, and client change requests.
          </p>
        </div>
        {can(user, "issueManagement", "create") && (
          <Button onClick={() => setShow(true)}>Report Issue</Button>
        )}
      </div>
      <Card>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Issue</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td className="reference">{item.reference}</td>
                <td>
                  <strong>{item.title}</strong>
                  <div
                    className="text-muted fs-xs text-truncate"
                    style={{ maxWidth: 360 }}
                  >
                    {item.description}
                  </div>
                </td>
                <td>{titleCase(item.type)}</td>
                <td>
                  <span className={`priority priority-${item.severity}`}>
                    {item.severity}
                  </span>
                </td>
                <td>{titleCase(item.status)}</td>
                <td className="text-end">
                  {!item.generatedDeliverableId &&
                    can(user, "issueManagement", "edit") &&
                    can(user, "workManagement", "create") && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          run(
                            () => workService.issueToDeliverable(item._id),
                            "Deliverable created",
                          )
                        }
                      >
                        Plan work
                      </Button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <EntityModal
        show={show}
        title="Report Issue"
        submitLabel="Report Issue"
        fields={[
          { name: "title", label: "Summary", required: true },
          {
            name: "description",
            label: "What happened or changed?",
            type: "textarea",
            required: true,
          },
          {
            name: "type",
            label: "Type",
            type: "select",
            required: true,
            options: ["bug", "change_request", "risk", "question"].map(
              (value) => ({ value, label: titleCase(value) }),
            ),
          },
          {
            name: "severity",
            label: "Severity",
            type: "select",
            defaultValue: "medium",
            options: ["low", "medium", "high", "critical"].map((value) => ({
              value,
              label: titleCase(value),
            })),
          },
        ]}
        onClose={() => setShow(false)}
        onSubmit={(values) =>
          run(
            () => workService.createIssue(project.id, values),
            "Issue reported",
          )
        }
      />
    </>
  );
};

const TimelineView = ({ project }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]),
    [show, setShow] = useState(false);
  const { showNotification } = useNotificationContext();
  const load = useCallback(
    () =>
      workService
        .milestones(project.id)
        .then((json) => setItems(json.data || [])),
    [project.id],
  );
  useEffect(() => {
    load();
  }, [load]);
  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <div>
          <h4>Milestones</h4>
          <p className="text-muted mb-0">
            Keep contractual dates distinct from internal Cycles.
          </p>
        </div>
        {can(user, "milestoneManagement", "create") && (
          <Button onClick={() => setShow(true)}>Add Milestone</Button>
        )}
      </div>
      <div className="milestone-line">
        {items.map((item) => (
          <div className="milestone-item" key={item._id}>
            <span className={`milestone-dot ${item.status}`} />
            <div>
              <strong>{item.name}</strong>
              <div className="text-muted">
                {date(item.dueDate)} · {titleCase(item.status)}
                {item.isContractual ? " · Contractual" : ""}
              </div>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      <EntityModal
        show={show}
        title="New Milestone"
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "dueDate", label: "Due date", type: "date", required: true },
          {
            name: "isContractual",
            label: "Commitment",
            type: "select",
            defaultValue: "false",
            options: [
              { value: "false", label: "Internal" },
              { value: "true", label: "Contractual" },
            ],
          },
        ]}
        onClose={() => setShow(false)}
        onSubmit={async (values) => {
          try {
            await workService.createMilestone(project.id, {
              ...values,
              isContractual: values.isContractual === "true",
            });
            showNotification({
              title: "Timeline",
              message: "Milestone created",
              variant: "success",
            });
            load();
          } catch (error) {
            showNotification({
              title: "Timeline",
              message: error.message,
              variant: "danger",
            });
            throw error;
          }
        }}
      />
    </>
  );
};

const TeamView = ({ project }) => (
  <Row className="g-3">
    {project.assignedEmployees?.map((member) => (
      <Col lg={4} md={6} key={member.employeeId}>
        <Card>
          <CardBody>
            <div className="d-flex align-items-center gap-3">
              <div className="member-avatar">{member.fullName?.[0] || "?"}</div>
              <div>
                <h5 className="mb-1">{member.fullName}</h5>
                <span className="text-muted">
                  {titleCase(member.projectRole)}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    ))}
  </Row>
);

const CostsView = ({ project }) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    workService.costs(project.id).then((json) => setData(json.data));
  }, [project.id]);
  if (!data) return <Spinner animation="border" />;
  const b = data.budget || {};
  const stats = [
    ["Internal budget", b.estimatedBudget],
    ["Actual cost", b.totalActualCost],
    ["Client billing", b.billingAmount],
    ["Profit", b.profitAmount],
  ];
  return (
    <>
      <Row className="g-3 mb-4">
        {stats.map(([label, value]) => (
          <Col lg={3} sm={6} key={label}>
            <Card>
              <CardBody>
                <span className="text-muted">{label}</span>
                <h3 className="mt-2 mb-0">{money(value, project.currency)}</h3>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
      <Row className="g-3">
        <Col lg={7}>
          <Card>
            <CardBody>
              <h5>Deliverable cost</h5>
              <Table responsive>
                <tbody>
                  {data.byDeliverable.map((row) => (
                    <tr key={row._id}>
                      <td>{row.title}</td>
                      <td>{row.hours}h</td>
                      <td className="text-end fw-semibold">
                        {money(row.cost, project.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
        <Col lg={5}>
          <Card>
            <CardBody>
              <h5>Budget health</h5>
              <div className="d-flex justify-content-between mt-4">
                <span>Burn rate</span>
                <strong>{Math.round(b.burnRate || 0)}%</strong>
              </div>
              <ProgressBar
                variant={
                  b.burnRate > 100
                    ? "danger"
                    : b.burnRate > 80
                      ? "warning"
                      : "primary"
                }
                now={Math.min(100, b.burnRate || 0)}
                className="mt-2"
              />
              <div className="d-flex justify-content-between mt-4">
                <span>Margin</span>
                <strong>{Math.round(b.profitMargin || 0)}%</strong>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const ActivityView = ({ project }) => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    workService.activity(project.id).then((json) => setItems(json.data || []));
  }, [project.id]);
  return (
    <Card>
      <CardBody>
        <div className="activity-list">
          {items.map((item) => (
            <div key={item._id} className="activity-row">
              <div className="activity-icon">
                <Icon icon="history" />
              </div>
              <div>
                <strong>
                  {item.actorId?.userId?.fullName || "A teammate"}
                </strong>{" "}
                {item.action.replaceAll(".", " ")}
                <div className="text-muted fs-xs">{date(item.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

const SettingsView = ({ project }) => (
  <Card>
    <CardBody>
      <h4>Project settings</h4>
      <p className="text-muted">
        Planning mode and commercial terms are managed from the project editor.
      </p>
      <dl className="row mt-4">
        <dt className="col-sm-3">Project key</dt>
        <dd className="col-sm-9">{project.key}</dd>
        <dt className="col-sm-3">Planning</dt>
        <dd className="col-sm-9">{titleCase(project.planningMode)}</dd>
        <dt className="col-sm-3">Status</dt>
        <dd className="col-sm-9">{titleCase(project.status)}</dd>
      </dl>
      <Alert variant="info">
        Changing from Cycles to continuous flow requires all active Cycles to be
        closed first.
      </Alert>
    </CardBody>
  </Card>
);

const ProjectWorkspace = () => {
  const { projectId } = useParams(),
    location = useLocation();
  const [project, setProject] = useState(null),
    [error, setError] = useState(null);
  const load = useCallback(
    () =>
      projectService
        .getById(projectId)
        .then((json) => setProject(json.data))
        .catch((err) => setError(err.message)),
    [projectId],
  );
  useEffect(() => {
    load();
  }, [load]);
  const section = location.pathname.split("/")[4] || "overview";
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!project)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  const views = {
    overview: <OverviewView projectId={projectId} project={project} />,
    work: <WorkView project={project} />,
    cycles: <CyclesView project={project} />,
    issues: <IssuesView project={project} />,
    timeline: <TimelineView project={project} />,
    team: <TeamView project={project} />,
    costs: <CostsView project={project} />,
    activity: <ActivityView project={project} />,
    settings: <SettingsView project={project} />,
  };
  return (
    <div className="project-workspace">
      <WorkspaceHeader project={project} />
      {views[section] || views.overview}
    </div>
  );
};

export default ProjectWorkspace;
