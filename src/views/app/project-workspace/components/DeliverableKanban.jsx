import Icon from "@/components/wrappers/Icon";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useEffect, useRef } from "react";
import { Alert, Badge, Button, ProgressBar, Spinner } from "react-bootstrap";
import { titleCase } from "../workspaceUtils";

const Column = ({
  group,
  page,
  canEdit,
  canMove,
  movingId,
  onEdit,
  onLoad,
  onLoadMore,
  onOpen,
  registerBoard,
}) => {
  const columnRef = useRef(null);

  useEffect(() => {
    if (page || group.total === 0) return undefined;
    const node = columnRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      onLoad(group.groupKey);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        onLoad(group.groupKey);
        observer.disconnect();
      },
      { root: registerBoard.current, rootMargin: "0px 240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [group.groupKey, group.total, onLoad, page, registerBoard]);

  return (
    <Droppable droppableId={group.groupKey}>
      {(provided, snapshot) => (
        <section
          className={`deliverable-kanban__column${snapshot.isDraggingOver ? " is-dragging-over" : ""}`}
          ref={(node) => {
            columnRef.current = node;
            provided.innerRef(node);
          }}
          {...provided.droppableProps}
          aria-label={`${group.name} Workstream, ${group.total} Deliverables`}
        >
          <header className="deliverable-kanban__header">
            <span
              className="workstream-color"
              style={{ backgroundColor: group.color || "var(--bs-secondary)" }}
              aria-hidden="true"
            />
            <div className="deliverable-kanban__heading">
              <div className="d-flex align-items-center gap-2">
                <h5 className="mb-0 text-break">{group.name}</h5>
                <Badge bg="light" text="dark">
                  {group.total}
                </Badge>
              </div>
              {group.description && (
                <p className="text-muted fs-sm mb-0 text-break">
                  {group.description}
                </p>
              )}
            </div>
            {group.groupKey !== "unassigned" && canEdit && (
              <Button
                type="button"
                size="sm"
                variant="link"
                className="deliverable-kanban__edit"
                onClick={() => onEdit(group)}
                aria-label={`Edit ${group.name} Workstream`}
              >
                Edit
              </Button>
            )}
          </header>

          <div className="deliverable-kanban__cards">
            {page?.error && (
              <Alert variant="danger" className="mb-0">
                <p className="mb-2">{page.error}</p>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => onLoad(group.groupKey)}
                >
                  Retry
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
              <Draggable
                draggableId={item._id}
                index={index}
                key={item._id}
                isDragDisabled={!canMove || movingId === item._id}
              >
                {(dragProvided, dragSnapshot) => (
                  <article
                    className={`deliverable-card deliverable-kanban__card${dragSnapshot.isDragging ? " is-dragging" : ""}`}
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                  >
                    <div className="deliverable-kanban__card-topline">
                      <span className="reference">{item.reference}</span>
                      <div className="d-flex align-items-center gap-1">
                        <span className={`priority priority-${item.priority}`}>
                          {item.priority}
                        </span>
                        {canMove && (
                          <button
                            type="button"
                            className="deliverable-kanban__drag-handle"
                            {...dragProvided.dragHandleProps}
                            aria-label={`Move ${item.title}`}
                          >
                            {movingId === item._id ? (
                              <Spinner size="sm" />
                            ) : (
                              <Icon icon="grip-vertical" aria-hidden="true" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="deliverable-kanban__open"
                      onClick={() => onOpen(item._id)}
                      aria-label={`Open ${item.title}`}
                    >
                      <strong className="text-break">{item.title}</strong>
                      <small>
                        {titleCase(item.status)} · {item.totalTasks || 0} Tasks
                      </small>
                      <ProgressBar now={item.completionPercentage || 0} />
                    </button>
                  </article>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>

          {page && !page.error && page.items.length > 0 && (
            <footer className="deliverable-kanban__footer">
              <span className="text-muted fs-sm">
                Showing {page.items.length} of {group.total}
              </span>
              {page.hasMore && (
                <Button
                  size="sm"
                  variant="outline-primary"
                  disabled={page.loading}
                  onClick={() => onLoadMore(group.groupKey, page.items.length)}
                >
                  {page.loading && <Spinner size="sm" className="me-2" />}
                  Load 12 more
                </Button>
              )}
            </footer>
          )}
        </section>
      )}
    </Droppable>
  );
};

const DeliverableKanban = ({
  groups,
  groupPages,
  canEdit,
  canMove,
  movingId,
  onEdit,
  onLoad,
  onMove,
  onOpen,
}) => {
  const boardRef = useRef(null);

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
        aria-label="Deliverables grouped by Workstream"
      >
        {groups.map((group) => (
          <Column
            key={group.groupKey}
            group={group}
            page={groupPages[group.groupKey]}
            canEdit={canEdit}
            canMove={canMove}
            movingId={movingId}
            onEdit={onEdit}
            onLoad={onLoad}
            onLoadMore={onLoad}
            onOpen={onOpen}
            registerBoard={boardRef}
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
