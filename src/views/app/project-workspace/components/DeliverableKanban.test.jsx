import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import DeliverableKanban from "./DeliverableKanban";

const dnd = vi.hoisted(() => ({ onDragEnd: null }));

vi.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children, onDragEnd }) => {
    dnd.onDragEnd = onDragEnd;
    return <>{children}</>;
  },
  Droppable: ({ children }) =>
    children(
      {
        innerRef: vi.fn(),
        droppableProps: {},
        placeholder: null,
      },
      { isDraggingOver: false },
    ),
  Draggable: ({ children }) =>
    children(
      {
        innerRef: vi.fn(),
        draggableProps: {},
        dragHandleProps: { tabIndex: 0 },
      },
      { isDragging: false },
    ),
}));

const groups = [
  {
    _id: "shopping",
    groupKey: "shopping",
    name: "Shopping experience",
    description: "Customer-facing storefront work",
    total: 1,
  },
  {
    _id: "operations",
    groupKey: "operations",
    name: "Commerce operations",
    total: 0,
  },
  {
    _id: "unassigned",
    groupKey: "unassigned",
    name: "Unassigned",
    total: 0,
  },
];

const item = {
  _id: "deliverable-1",
  reference: "EWS-D1",
  title: "Product catalog",
  priority: "high",
  status: "in_progress",
  totalTasks: 3,
  completionPercentage: 50,
  version: 2,
};

const renderBoard = (overrides = {}) => {
  const props = {
    groups,
    groupPages: {
      shopping: {
        items: [item],
        total: 1,
        hasMore: false,
        loading: false,
        error: "",
      },
    },
    canEdit: true,
    canMove: true,
    movingId: "",
    onEdit: vi.fn(),
    onLoad: vi.fn(),
    onMove: vi.fn(),
    onOpen: vi.fn(),
    ...overrides,
  };
  render(<DeliverableKanban {...props} />);
  return props;
};

afterEach(() => cleanup());

describe("DeliverableKanban", () => {
  it("renders Workstream columns, an empty Unassigned target, and separate card controls", async () => {
    const user = userEvent.setup();
    const props = renderBoard();

    expect(
      screen.getByRole("region", {
        name: "Shopping experience Workstream, 1 Deliverables",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("No Deliverables here yet.")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Move Product catalog" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Open Product catalog" }),
    );
    expect(props.onOpen).toHaveBeenCalledWith("deliverable-1");
  });

  it("reports cross-column drops and ignores same-column drops", () => {
    const props = renderBoard();

    act(() => {
      dnd.onDragEnd({
        draggableId: "deliverable-1",
        source: { droppableId: "shopping", index: 0 },
        destination: { droppableId: "operations", index: 0 },
      });
    });
    expect(props.onMove).toHaveBeenCalledWith({
      deliverableId: "deliverable-1",
      sourceGroupKey: "shopping",
      destinationGroupKey: "operations",
    });

    act(() => {
      dnd.onDragEnd({
        draggableId: "deliverable-1",
        source: { droppableId: "shopping", index: 0 },
        destination: { droppableId: "shopping", index: 0 },
      });
    });
    expect(props.onMove).toHaveBeenCalledTimes(1);
  });

  it("loads a populated column when it enters the horizontal viewport", () => {
    const originalObserver = globalThis.IntersectionObserver;
    let notifyIntersection;
    globalThis.IntersectionObserver = class {
      constructor(callback) {
        notifyIntersection = callback;
      }

      observe() {}

      disconnect() {}
    };
    const props = renderBoard({ groupPages: {} });
    expect(props.onLoad).not.toHaveBeenCalled();

    act(() => notifyIntersection([{ isIntersecting: true }]));
    expect(props.onLoad).toHaveBeenCalledWith("shopping");
    globalThis.IntersectionObserver = originalObserver;
  });

  it("removes drag handles when moving is not permitted", () => {
    renderBoard({ canMove: false });

    expect(
      screen.queryByRole("button", { name: "Move Product catalog" }),
    ).not.toBeInTheDocument();
  });
});
