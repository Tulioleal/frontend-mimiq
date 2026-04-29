import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { Fader } from "./Fader";

describe("Fader", () => {
  it("updates through keyboard-accessible range input", async () => {
    const onChange = vi.fn();
    render(createElement(Fader, { label: "Temperature", min: 0.1, max: 1, step: 0.1, value: 0.5, onChange }));
    const input = screen.getByRole("slider", { name: "Temperature" });
    fireEvent.change(input, { target: { value: "0.8" } });
    expect(onChange).toHaveBeenCalled();
  });
});
