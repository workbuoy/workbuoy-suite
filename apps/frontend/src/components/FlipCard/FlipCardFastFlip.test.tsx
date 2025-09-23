import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import FlipCard from "./FlipCard";

vi.mock("@/core/ActiveContext", () => ({
  ActiveContextProvider: ({ children }: { children: ReactNode }) => children,
  useActiveContext: () => ({
    selectedEntity: null,
    setSelectedEntity: () => {},
    recentIntents: [],
    timeOfDay: "morning" as const,
    pushIntent: () => {},
  }),
}));

describe("FlipCard fast flip", () => {
  it("adds fast style markers when enabled", () => {
    const { container } = render(
      <FlipCard front={<div>Front</div>} back={<div>Back</div>} fastFlip />,
    );
    const flip = container.querySelector<HTMLElement>(".flip-card");
    expect(flip).toBeTruthy();
    expect(flip?.getAttribute("data-style")).toBe("fast");
  });

  it("falls back to 3d style by default", () => {
    const { container } = render(<FlipCard front={<div>F</div>} back={<div>B</div>} />);
    const flip = container.querySelector<HTMLElement>(".flip-card");
    expect(flip?.getAttribute("data-style")).toBe("3d");
  });
});
