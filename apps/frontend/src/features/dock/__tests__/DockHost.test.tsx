import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DockHost from "../DockHost";
import { useFocusReturn } from "../useFocusReturn";

function ModalHarness() {
  const [open, setOpen] = React.useState(false);
  const lastActiveRef = useFocusReturn(open);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open Dock
      </button>
      {open ? (
        <DockHost
          open={open}
          onClose={() => setOpen(false)}
          title="Dock Host"
          description="Controls focus for the dock host dialog"
          liveMessage=""
          lastActiveElement={lastActiveRef.current}
        >
          <button type="button">Approve</button>
          <button type="button">Cancel</button>
        </DockHost>
      ) : null}
    </>
  );
}

describe("DockHost", () => {
  it("mounts with initial focus on the first tabbable element", async () => {
    render(
      <DockHost open onClose={() => undefined} title="Dock Host">
        <button type="button">Approve</button>
        <button type="button">Cancel</button>
      </DockHost>,
    );

    const approve = await screen.findByRole("button", { name: "Approve" });
    await waitFor(() => expect(document.activeElement).toBe(approve));
  });

  it("wraps focus when tabbing forward and backward", async () => {
    const user = userEvent.setup();

    render(
      <DockHost open onClose={() => undefined} title="Dock Host">
        <button type="button">Approve</button>
        <button type="button">Cancel</button>
      </DockHost>,
    );

    const approve = await screen.findByRole("button", { name: "Approve" });
    const cancel = await screen.findByRole("button", { name: "Cancel" });

    await waitFor(() => expect(document.activeElement).toBe(approve));

    await user.tab();
    expect(document.activeElement).toBe(cancel);

    await user.tab();
    expect(document.activeElement).toBe(approve);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(cancel);
  });

  it("closes on escape and restores focus to the opener", async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);

    const openButton = screen.getByRole("button", { name: "Open Dock" });
    openButton.focus();
    await fireEvent.click(openButton);

    const dialog = await screen.findByRole("dialog", { name: "Dock Host" });
    expect(dialog).toBeInTheDocument();

    await fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull());
    expect(document.activeElement).toBe(openButton);
  });

  it("renders aria-live region with provided message", async () => {
    render(
      <DockHost open onClose={() => undefined} title="Dock Host" liveMessage="Approved">
        <button type="button">Approve</button>
      </DockHost>,
    );

    const liveRegion = document.querySelector('[data-testid="dock-live"]');
    expect(liveRegion?.getAttribute("aria-live")).toBe("polite");
    expect(liveRegion?.textContent).toContain("Approved");
  });

  it("exposes dialog role and aria relationships", async () => {
    render(
      <DockHost open onClose={() => undefined} title="Dock Host" description="Example description">
        <button type="button">Approve</button>
      </DockHost>,
    );

    const dialog = await screen.findByRole("dialog", { name: "Dock Host" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    const descriptionId = dialog.getAttribute("aria-describedby");
    expect(descriptionId).toBeTruthy();
    if (descriptionId) {
      const description = document.getElementById(descriptionId);
      expect(description?.textContent).toBe("Example description");
    }
  });
});
