import { describe, expect, it } from "vitest";
import {
  buildBulkPayload,
  countBulkItems,
  mapBulkApiErrors,
  validateBulkSections,
} from "./bulkWorkUtils";

const deliverable = (id, overrides = {}) => ({
  id,
  title: "Checkout",
  description: "",
  priority: "medium",
  estimatedHours: "8",
  ...overrides,
});

const newSection = (overrides = {}) => ({
  id: "section-1",
  type: "new",
  name: "Storefront",
  description: "",
  ownerId: "",
  status: "planned",
  priority: "high",
  color: "#5b5bd6",
  startDate: "",
  targetDate: "",
  deliverables: [deliverable("deliverable-1")],
  ...overrides,
});

describe("bulk work helpers", () => {
  it("counts new Workstreams and every Deliverable", () => {
    expect(
      countBulkItems([
        newSection(),
        {
          id: "existing",
          type: "existing",
          workstreamId: "507f1f77bcf86cd799439011",
          deliverables: [deliverable("d2"), deliverable("d3")],
        },
      ]),
    ).toBe(4);
  });

  it("validates every row and the combined batch limit", () => {
    const oversized = Array.from({ length: 100 }, (_, index) =>
      deliverable(`d-${index}`),
    );
    const errors = validateBulkSections([
      newSection({
        name: "",
        startDate: "2026-10-10",
        targetDate: "2026-10-09",
        deliverables: oversized,
      }),
    ]);
    expect(errors._form).toContain("at most 100");
    expect(errors["section-1.name"]).toBeTruthy();
    expect(errors["section-1.targetDate"]).toBeTruthy();
  });

  it("builds flat API rows for new, existing, and unassigned destinations", () => {
    const { payload, meta } = buildBulkPayload([
      newSection(),
      {
        id: "existing",
        type: "existing",
        workstreamId: "507f1f77bcf86cd799439011",
        deliverables: [deliverable("d2")],
      },
      {
        id: "unassigned",
        type: "unassigned",
        deliverables: [deliverable("d3")],
      },
    ]);
    expect(payload.workstreams).toHaveLength(1);
    expect(payload.deliverables[0].newWorkstreamKey).toBe(
      "workstream-section-1",
    );
    expect(payload.deliverables[1].existingWorkstreamId).toBe(
      "507f1f77bcf86cd799439011",
    );
    expect(payload.deliverables[2]).not.toHaveProperty("newWorkstreamKey");
    expect(meta.deliverableIds).toEqual(["deliverable-1", "d2", "d3"]);
  });

  it("maps server row paths back to visible fields", () => {
    const errors = mapBulkApiErrors(
      {
        errorSources: [
          { path: "body.workstreams.0.name", message: "Invalid name" },
          {
            path: "deliverables.1.estimatedHours",
            message: "Invalid estimate",
          },
        ],
      },
      {
        workstreamIds: ["section-1"],
        deliverableIds: ["d1", "d2"],
      },
    );
    expect(errors).toEqual({
      "section-1.name": "Invalid name",
      "d2.estimatedHours": "Invalid estimate",
    });
  });
});
