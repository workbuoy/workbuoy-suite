import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import PeripheralCue from "../PeripheralCue";

function expectClasses(node: Element | null, classes: string[]) {
  expect(node).not.toBeNull();
  const list = (node as Element).classList;
  for (const cls of classes) {
    expect(list.contains(cls)).toBe(true);
  }
}

describe("PeripheralCue", () => {
  it("renders nothing when inactive", () => {
    const { container } = render(<PeripheralCue active={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders ok variant", () => {
    const { container } = render(<PeripheralCue status="ok" />);
    expectClasses(container.firstChild, [
      "wb-peripheral",
      "wb-peripheral--right-edge",
      "wb-peripheral--ok",
    ]);
  });

  it("renders warn variant", () => {
    const { container } = render(<PeripheralCue status="warn" />);
    expectClasses(container.firstChild, [
      "wb-peripheral",
      "wb-peripheral--right-edge",
      "wb-peripheral--warn",
    ]);
  });

  it("renders error variant", () => {
    const { container } = render(<PeripheralCue status="error" />);
    expectClasses(container.firstChild, [
      "wb-peripheral",
      "wb-peripheral--right-edge",
      "wb-peripheral--error",
    ]);
  });

  it("renders thinking variant", () => {
    const { container } = render(<PeripheralCue status="thinking" />);
    expectClasses(container.firstChild, [
      "wb-peripheral",
      "wb-peripheral--right-edge",
      "wb-peripheral--thinking",
    ]);
  });
});
