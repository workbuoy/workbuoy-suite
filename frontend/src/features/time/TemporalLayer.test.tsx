import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import TemporalLayer from "./TemporalLayer";

describe("TemporalLayer", () => {
  const original = HTMLElement.prototype.scrollIntoView;
  const scrollSpy = vi.fn();

  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = scrollSpy;
  });

  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = original;
  });

  it("places items by temporal section and handles N key", () => {
    const now = new Date().toISOString();
    render(
      <TemporalLayer
        items={[
          { id: "p", title: "Past", start: "2020-01-01" },
          { id: "n", title: "Now", start: now },
          { id: "f", title: "Future", start: "2100-01-01" },
        ]}
      />
    );

    expect(screen.getByText("Past")).toBeInTheDocument();
    expect(screen.getByText("Now")).toBeInTheDocument();
    expect(screen.getByText("Future")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "n" });
    expect(scrollSpy).toHaveBeenCalled();
  });
});
