import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("fires clicks and exposes loading as disabled", async () => {
    const onClick = vi.fn();
    render(createElement(Button, { onClick }, "Run"));
    await userEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(onClick).toHaveBeenCalledOnce();

    render(createElement(Button, { loading: true }, "Loading"));
    expect(screen.getByRole("button", { name: "Loading" })).toBeDisabled();
  });
});
