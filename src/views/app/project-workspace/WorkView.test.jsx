import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { WorkView } from "./index";

const workstreams = vi.hoisted(() => vi.fn());
const deliverableGroups = vi.hoisted(() => vi.fn());
const deliverableGroupItems = vi.hoisted(() => vi.fn());
const moveDeliverable = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { membershipType: "admin" } }),
}));

vi.mock("@/context/useNotificationContext", () => ({
  useNotificationContext: () => ({ showNotification: vi.fn() }),
}));

vi.mock("@/services/workService", () => ({
  workService: {
    workstreams,
    deliverableGroups,
    deliverableGroupItems,
    moveDeliverable,
  },
}));

vi.mock("./components/BulkWorkModal", () => ({ default: () => null }));
vi.mock("./components/EntityModal", () => ({ default: () => null }));
vi.mock("./components/DeliverableDrawer", () => ({ default: () => null }));

afterEach(() => cleanup());

describe("WorkView grouped browsing", () => {
  beforeEach(() => {
    workstreams.mockReset().mockResolvedValue({ data: [] });
    moveDeliverable.mockReset().mockResolvedValue({ data: {} });
    deliverableGroups.mockReset().mockResolvedValue({
      data: {
        total: 13,
        groups: [
          {
            _id: "507f1f77bcf86cd799439011",
            groupKey: "507f1f77bcf86cd799439011",
            name: "Shopping experience",
            description: "Customer-facing storefront work",
            total: 13,
          },
        ],
      },
    });
    deliverableGroupItems
      .mockReset()
      .mockImplementation((_projectId, _groupKey, params) => {
        const offset = Number(params.offset || 0);
        const count = offset === 0 ? 12 : 1;
        return Promise.resolve({
          data: {
            items: Array.from({ length: count }, (_, index) => ({
              _id: `deliverable-${offset + index}`,
              reference: `EWS-D${offset + index + 1}`,
              title: `Deliverable ${offset + index + 1}`,
              priority: "medium",
              status: "backlog",
              totalTasks: 0,
              completionPercentage: 0,
            })),
            total: 13,
            hasMore: offset === 0,
          },
        });
      });
  });

  it("renders the Workstream as a Kanban column and loads additional cards on demand", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <WorkView
          project={{
            id: "507f1f77bcf86cd799439012",
            planningMode: "continuous",
            assignedEmployees: [],
          }}
        />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("region", {
        name: "Shopping experience Workstream, 13 Deliverables",
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Showing 12 of 13")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Load 12 more" }));

    await waitFor(() =>
      expect(screen.getByText("Showing 13 of 13")).toBeInTheDocument(),
    );
    expect(deliverableGroupItems).toHaveBeenLastCalledWith(
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439011",
      expect.objectContaining({ offset: 12, limit: 12 }),
    );
  });
});
