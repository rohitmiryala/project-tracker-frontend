import Icon from "@/components/wrappers/Icon";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useEffect, useMemo, useRef } from "react";
import { Alert, Badge, Button, ProgressBar, Spinner } from "react-bootstrap";
import { titleCase } from "../workspaceUtils";

const idOf = (value) => String(value?._id || value?.id || value || "");

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const dueLabel = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
};

const Assignees = ({ item, members }) => {
  const memberById = useMemo(
    () => new Map(members.map((member) => [idOf(member), member])),
    [members],
  );
  const assigneeIds = (item.assignedEmployeeIds || []).map(idOf).filter(Boolean);
  if (!assigneeIds.length && item.ownerId) assigneeIds.push(idOf(item.ownerId));
  const assignees = assigneeIds
    .map((memberId) => memberById.get(memberId))
    .filter(Boolean);

  if (!assignees.length) {
    return (
      <span
        className="deliverable-kanban__avatar is-empty"
        title="No assignee"
        aria-label="No assignee"
      >
        <Icon icon="user" aria-hidden="true" />
      </span>
    );
  }

  const visible = assignees.slice(0, 2);
  return (
    <div
      className="deliverable-kanban__avatars"
      aria-label={`Assigned to ${assignees.map((member) => member.fullName).join(", ")}`}
    >
      {visible.map((member, index) => (
        <span
          className={`deliverable-kanban__avatar tone-${index + 1}`}
          title={member.fullName}
          key={idOf(member)}
        >
          {initials(member.fullName)}
        </span>
      ))}
      {assignees.length > visible.length && (
        <span
          className="deliverable-kanban__avatar is-more"
          title={`${assignees.length - visible.length} more assignees`}
        >
          +{assignees.length - visible.length}
        </span>
      )}
    </div>
  );
};

const DeliverableCard = ({
  item,
  index,
  canMove,
  movingId,
  members,
  cycleById,
  onOpen,
}) => {
  const cycle = cycleById.get(idOf(item.cycleId));
  const totalTasks = item.totalTasks || 0;
  const completedTasks = item.completedTasks || 0;

  return (
    <Draggable
      draggableId={item._id}
      index={index}
      isDragDisabled={!canMove || movingId === item._id}
    >
      {(provided, snapshot) => (
        <article
          className={`deliverable-card deliverable-kanban__card${snapshot.isDragging ? " is-dragging" : ""}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className="deliverable-kanban__card-topline">
            <div className="d-flex align-items-center gap-2 min-w-0">
              <span className="reference">{item.reference}</span>
              <span className={`priority priority-${item.priority}`}>
                {item.priority}
              </span>
            </div>
            {canMove && (
              <span
                className="deliverable-kanban__drag-handle"
                {...provided.dragHandleProps}
                aria-label={`Move ${item.title}`}
              >
                {movingId === item._id ? (
                  <Spinner size="sm" />
                ) : (
                  <Icon icon="grip-vertical" aria-hidden="true" />
                )}
              </span>
            )}
          </div>

          <button
            type="button"
            className="deliverable-kanban__open"
            onClick={() => onOpen(item._id)}
            aria-label={`Open ${item.title}`}
          >
            <strong className="text-break">{item.title}</strong>
            <span className="deliverable-kanban__meta">
              <span
                className={`deliverable-status deliverable-status--${item.status}`}
              >
                {titleCase(item.status)} · {totalTasks}{" "}
                {totalTasks === 1 ? "Task" : "Tasks"}
              </span>
              {cycle && (
                <span className="deliverable-kanban__cycle text-truncate">
                  {cycle.name}
                </span>
              )}
            </span>
            {totalTasks > 0 && (
              <ProgressBar
                now={item.completionPercentage || 0}
                aria-label={`${item.completionPercentage || 0}% complete`}
              />
            )}
          </button>

          <div className="deliverable-kanban__card-footer">
            <Assignees item={item} members={members} />
            <span className="deliverable-kanban__card-summary">
              {item.dueDate
                ? `Due ${dueLabel(item.dueDate)}`
                : totalTasks > 0
                  ? `${completedTasks} of ${totalTasks} done`
                  : "No due date"}
            </span>
          </div>
        </article>
      )}
    </Draggable>
  );
};

const Column = ({
  group,
  page,
  canCreate,
  canEdit,
  canMove,
  movingId,
  members,
  cycleById,
  onCreate,
  onEdit,
  onLoad,
  onLoadMore,
  onOpen,
  boardRef,
}) => {
  const columnRef = useRef(null);
  const cardsRef = useRef(null);
  const loadMoreRef = useRef(null);
  const supportsObserver = typeof IntersectionObserver !== "undefined";

  useEffect(() => {
    if (page || group.total === 0) return undefined;
    const node = columnRef.current;
    if (!node || !supportsObserver) {
      onLoad(group.groupKey);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        onLoad(group.groupKey);
        observer.disconnect();
      },
      { root: boardRef.current, rootMargin: "0px 240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [boardRef, group.groupKey, group.total, onLoad, page, supportsObserver]);

  useEffect(() => {
    if (!supportsObserver || !page?.hasMore || page.loading || page.error)
      return undefined;
    const root = cardsRef.current;
    const sentinel = loadMoreRef.current;
    if (!root || !sentinel) return undefined;
    let requested = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || requested) return;
        requested = true;
        onLoadMore(group.groupKey, page.items.length);
        observer.disconnect();
      },
      { root, rootMargin: "0px 0px 160px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    group.groupKey,
    onLoadMore,
    page?.error,
    page?.hasMore,
    page?.items.length,
    page?.loading,
    supportsObserver,
  ]);

  const createHere = () =>
    onCreate(group.groupKey === "unassigned" ? null : group.groupKey);

  return (
    <section
      className="deliverable-kanban__column"
      ref={columnRef}
      aria-label={`${group.name} Workstream, ${group.total} Deliverables`}
      style={{
        "--workstream-accent": group.color || "var(--bs-secondary)",
      }}
    >
      <header className="deliverable-kanban__header">
        <div className="deliverable-kanban__header-row">
          <span
            className="workstream-color"
            style={{ backgroundColor: group.color || "var(--bs-secondary)" }}
            aria-hidden="true"
          />
          <h5 className="mb-0 text-truncate">{group.name}</h5>
          <Badge bg="light" text="dark">
            {group.total}
          </Badge>
          <div className="deliverable-kanban__header-actions">
            {group.groupKey !== "unassigned" && canEdit && (
              <Button
                type="button"
                size="sm"
                variant="link"
                onClick={() => onEdit(group)}
                aria-label={`Edit ${group.name} Workstream`}
              >
                Edit
              </Button>
            )}
            {canCreate && (
              <Button
                type="button"
                size="sm"
                variant="link"
                className="deliverable-kanban__header-add"
                onClick={createHere}
                aria-label={`Add Deliverable to ${group.name}`}
              >
                <Icon icon="plus" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
        {group.description && (
          <p className="text-muted fs-sm mb-0">{group.description}</p>
        )}
      </header>

      <Droppable droppableId={group.groupKey}>
        {(provided, snapshot) => (
          <div
            className={`deliverable-kanban__cards${snapshot.isDraggingOver ? " is-dragging-over" : ""}`}
            ref={(node) => {
              cardsRef.current = node;
              provided.innerRef(node);
            }}
            {...provided.droppableProps}
          >
            {page?.error && (
              <Alert variant="danger" className="mb-0">
                <p className="mb-2">{page.error}</p>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => onLoad(group.groupKey)}
                >
                  Retry from the beginning
                </Button>
              </Alert>
            )}
            {group.total > 0 &&
              (!page || (page.loading && page.items.length === 0)) && (
                <div
                  className="deliverable-kanban__loading"
                  aria-live="polite"
                >
                  <Spinner size="sm" />
                  <span>Loading Deliverables…</span>
                </div>
              )}
            {!page?.error && group.total === 0 && (
              <div className="deliverable-kanban__empty">
                <Icon icon="inbox" aria-hidden="true" />
                <span>No Deliverables here yet.</span>
              </div>
            )}
            {(page?.items || []).map((item, index) => (
              <DeliverableCard
                item={item}
                index={index}
                canMove={canMove}
                movingId={movingId}
                members={members}
                cycleById={cycleById}
                onOpen={onOpen}
                key={item._id}
              />
            ))}
            {provided.placeholder}
            {page?.hasMore && (
              <span
                className="deliverable-kanban__load-sentinel"
                ref={loadMoreRef}
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </Droppable>

      <footer className="deliverable-kanban__footer">
        {canCreate && (
          <Button
            type="button"
            className="deliverable-kanban__quick-add"
            onClick={createHere}
          >
            <Icon icon="plus" className="me-1" aria-hidden="true" />
            Add Deliverable
          </Button>
        )}
        <div className="deliverable-kanban__summary">
          <span>
            Showing {page?.items.length || 0} of {group.total}
          </span>
          {page?.loading && page.items.length > 0 && (
            <span className="d-inline-flex align-items-center gap-1" role="status">
              <Spinner size="sm" /> Loading more
            </span>
          )}
          {page?.hasMore && (!supportsObserver || page.error) && (
            <Button
              size="sm"
              variant="link"
              disabled={page.loading}
              onClick={() => onLoadMore(group.groupKey, page.items.length)}
            >
              Load 12 more
            </Button>
          )}
        </div>
      </footer>
    </section>
  );
};

const DeliverableKanban = ({
  groups,
  groupPages,
  members = [],
  cycles = [],
  canCreate,
  canEdit,
  canMove,
  movingId,
  onCreate,
  onEdit,
  onLoad,
  onMove,
  onOpen,
}) => {
  const boardRef = useRef(null);
  const visibleColumnCount = Math.min(groups.length, 3) || 1;
  const cycleById = useMemo(
    () => new Map(cycles.map((cycle) => [idOf(cycle), cycle])),
    [cycles],
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const sourceGroupKey = result.source.droppableId;
    const destinationGroupKey = result.destination.droppableId;
    if (sourceGroupKey === destinationGroupKey) return;
    onMove({
      deliverableId: result.draggableId,
      sourceGroupKey,
      destinationGroupKey,
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        className="deliverable-kanban"
        ref={boardRef}
        role="region"
        aria-label="Deliverables grouped by Workstream"
        data-column-count={groups.length}
        style={{
          "--kanban-column-width": `calc((100% - ${visibleColumnCount - 1}rem) / ${visibleColumnCount})`,
        }}
      >
        {groups.map((group) => (
          <Column
            key={group.groupKey}
            group={group}
            page={groupPages[group.groupKey]}
            canCreate={canCreate}
            canEdit={canEdit}
            canMove={canMove}
            movingId={movingId}
            members={members}
            cycleById={cycleById}
            onCreate={onCreate}
            onEdit={onEdit}
            onLoad={onLoad}
            onLoadMore={onLoad}
            onOpen={onOpen}
            boardRef={boardRef}
          />
        ))}
      </div>
      <div className="visually-hidden" aria-live="polite">
        {movingId ? "Moving Deliverable" : ""}
      </div>
    </DragDropContext>
  );
};

export default DeliverableKanban;
