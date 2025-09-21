import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Dialog, { DialogContent, cycleFocus, handleEscapeKey } from "./dialog";

describe("cycleFocus", () => {
  it("moves focus to the first element when tabbing past the last", () => {
    const focusOrder: string[] = [];
    const first = { focus: () => focusOrder.push("first") };
    const middle = { focus: () => focusOrder.push("middle") };
    const last = { focus: () => focusOrder.push("last") };
    const prevent = vi.fn();

    cycleFocus({ key: "Tab", shiftKey: false, preventDefault: prevent }, [first, middle, last], last);
    expect(prevent).toHaveBeenCalledOnce();
    expect(focusOrder).toEqual(["first"]);
  });

  it("moves focus to the last element when shift-tabbing before the first", () => {
    const focusOrder: string[] = [];
    const first = { focus: () => focusOrder.push("first") };
    const second = { focus: () => focusOrder.push("second") };
    const prevent = vi.fn();

    cycleFocus({ key: "Tab", shiftKey: true, preventDefault: prevent }, [first, second], first);
    expect(prevent).toHaveBeenCalledOnce();
    expect(focusOrder).toEqual(["second"]);
  });
});

describe("handleEscapeKey", () => {
  it("invokes the close handler", () => {
    const close = vi.fn();
    handleEscapeKey({ key: "Escape" }, close);
    expect(close).toHaveBeenCalledOnce();
  });
});

describe("Dialog markup", () => {
  it("renders a dialog panel with aria attributes", () => {
    const markup = renderToStaticMarkup(
      <Dialog defaultOpen>
        <DialogContent aria-labelledby="dialog-heading">
          <h2 id="dialog-heading">Hello</h2>
          <p>Body</p>
        </DialogContent>
      </Dialog>,
    );

    expect(markup).toContain("role=\"dialog\"");
    expect(markup).toContain("aria-modal=\"true\"");
    expect(markup).toContain("aria-labelledby=\"dialog-heading\"");
  });
});
