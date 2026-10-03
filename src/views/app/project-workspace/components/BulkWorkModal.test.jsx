import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import BulkWorkModal from "./BulkWorkModal";

const props = {
  show: true,
  workstreams: [
    {
      _id: "507f1f77bcf86cd799439011",
      name: "Commerce operations",
      color: "#5b5bd6",
    },
  ],
  memberOptions: [],
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

afterEach(() => cleanup());

describe("BulkWorkModal", () => {
  it("validates all visible rows before submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BulkWorkModal {...props} onSubmit={onSubmit} />);

    await user.click(
      await screen.findByRole("button", { name: "Create 2 items" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Review the highlighted fields",
    );
    expect(screen.getAllByText("Enter at least 2 characters.")).toHaveLength(2);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a linked Workstream and Deliverable as one payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({});
    const onClose = vi.fn();
    render(<BulkWorkModal {...props} onSubmit={onSubmit} onClose={onClose} />);

    await user.type(
      await screen.findByRole("textbox", { name: /Workstream name/ }),
      "Shopping experience",
    );
    await user.type(
      screen.getByPlaceholderText("Deliverable outcome"),
      "Product discovery",
    );
    await user.click(screen.getByRole("button", { name: "Create 2 items" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.workstreams[0].name).toBe("Shopping experience");
    expect(payload.deliverables[0]).toMatchObject({
      title: "Product discovery",
      newWorkstreamKey: payload.workstreams[0].clientKey,
    });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
