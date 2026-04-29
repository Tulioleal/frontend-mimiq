import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmationDialog } from "./ConfirmationDialog";

describe("ConfirmationDialog", () => {
  it("requires explicit confirmation", async () => {
    const onConfirm = vi.fn();
    render(
      createElement(ConfirmationDialog, {
        open: true,
        title: "Delete voice clone?",
        description: "Permanent action",
        confirmLabel: "Delete",
        onOpenChange: vi.fn(),
        onConfirm
      })
    );
    expect(screen.getByRole("dialog")).toHaveTextContent("Permanent action");
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
