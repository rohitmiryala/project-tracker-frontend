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
        dragHandleProps: { tabIndex: 0, role: "button" },
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
    canCreate: true,
    canEdit: true,
    canMove: true,
    movingId: "",
    onCreate: vi.fn(),
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
    expect(
      screen.getByRole("button", { name: "Open Product catalog" }),
    ).toHaveAttribute("title", "Product catalog");
  });

  it("sizes the desktop board to show four columns at once", () => {
    renderBoard({
      groups: [
        ...groups,
        {
          _id: "fulfilment",
          groupKey: "fulfilment",
          name: "Fulfilment",
          total: 0,
        },
      ],
    });

    const board = screen.getByRole("region", {
      name: "Deliverables grouped by Workstream",
    });
    expect(board).toHaveAttribute("data-column-count", "4");
    expect(board).toHaveStyle(
      "--kanban-column-width: calc((100% - 3rem) / 4)",
    );
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

  it("opens column-aware creation from Workstream and Unassigned actions", async () => {
    const user = userEvent.setup();
    const props = renderBoard();

    screen.getAllByRole("button", { name: "Add Deliverable" }).forEach(
      (button) => {
        expect(button).toHaveClass("btn-primary");
        expect(button).not.toHaveClass("btn-outline-secondary");
      },
    );

    await user.click(
      screen.getByRole("button", {
        name: "Add Deliverable to Shopping experience",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Add Deliverable to Unassigned" }),
    );

    expect(props.onCreate).toHaveBeenNthCalledWith(1, "shopping");
    expect(props.onCreate).toHaveBeenNthCalledWith(2, null);
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

  it("loads the next batch once when the card sentinel enters view", () => {
    const originalObserver = globalThis.IntersectionObserver;
    let notifyIntersection;
    globalThis.IntersectionObserver = class {
      constructor(callback, options) {
        if (options?.rootMargin?.includes("160px")) notifyIntersection = callback;
      }

      observe() {}

      disconnect() {}
    };
    const props = renderBoard({
      groupPages: {
        shopping: {
          items: [item],
          total: 13,
          hasMore: true,
          loading: false,
          error: "",
        },
      },
    });

    act(() => notifyIntersection([{ isIntersecting: true }]));
    act(() => notifyIntersection([{ isIntersecting: true }]));

    expect(props.onLoad).toHaveBeenCalledTimes(1);
    expect(props.onLoad).toHaveBeenCalledWith("shopping", 1);
    globalThis.IntersectionObserver = originalObserver;
  });

  it("removes drag handles when moving is not permitted", () => {
    renderBoard({ canMove: false });

    expect(
      screen.queryByRole("button", { name: "Move Product catalog" }),
    ).not.toBeInTheDocument();
  });
});
