import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { StatusIndicator } from "./StatusIndicator";

describe("StatusIndicator", () => {
  it("renders non-color status text", () => {
    render(createElement(StatusIndicator, { state: "booting", message: "Warm-up" }));
    expect(screen.getByRole("status")).toHaveTextContent("Booting");
    expect(screen.getByRole("status")).toHaveTextContent("Warm-up");
  });
});
