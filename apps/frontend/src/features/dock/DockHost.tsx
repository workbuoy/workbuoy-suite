import React from "react";
import { createPortal } from "react-dom";

export type DockHostProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  liveMessage?: string;
  initialFocusRef?: React.RefObject<HTMLElement>;
  lastActiveElement?: HTMLElement | null;
  children?: React.ReactNode;
};

const TABBABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=\"hidden\"])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
  "[contenteditable=\"true\"]",
].join(",");

function getTabbableElements(root: HTMLElement): HTMLElement[] {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR));
  const hasWindow = typeof window !== "undefined";
  return nodes.filter((element) => {
    if (element.getAttribute("tabindex") === "-1") {
      return false;
    }
    if (element.hasAttribute("disabled")) {
      return false;
    }
    if (element instanceof HTMLAnchorElement && !element.href) {
      return false;
    }
    const style = hasWindow ? window.getComputedStyle(element) : null;
    if (style && (style.display === "none" || style.visibility === "hidden")) {
      return false;
    }
    return true;
  });
}

const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function DockHost({
  open,
  onClose,
  title,
  description,
  liveMessage,
  initialFocusRef,
  lastActiveElement,
  children,
}: DockHostProps) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const restoreFocusRef = React.useRef<HTMLElement | null>(null);

  if (typeof document !== "undefined" && containerRef.current === null) {
    containerRef.current = document.createElement("div");
    containerRef.current.setAttribute("data-dockhost-portal", "");
  }

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof document === "undefined") return;
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    if (lastActiveElement) {
      restoreFocusRef.current = lastActiveElement;
    } else {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
    }
  }, [open, lastActiveElement]);

  React.useEffect(() => {
    if (!open) return undefined;
    return () => {
      const target = restoreFocusRef.current;
      if (target && typeof target.focus === "function") {
        if (typeof window !== "undefined" && window.requestAnimationFrame) {
          window.requestAnimationFrame(() => target.focus());
        } else {
          target.focus();
        }
      }
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const target = initialFocusRef?.current ?? getTabbableElements(dialog)[0] ?? dialog;
    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => target.focus());
    } else {
      target.focus();
    }
  }, [open, initialFocusRef]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const tabbable = getTabbableElements(dialog);
      if (tabbable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = tabbable[0];
      const last = tabbable[tabbable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !dialog.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  if (!open) {
    return null;
  }

  const labelledBy = title ? titleId : undefined;
  const describedBy = description ? descriptionId : undefined;

  const dialog = (
    <div
      ref={overlayRef}
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.48)",
        padding: "16px",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        onKeyDown={handleKeyDown}
        style={{
          backgroundColor: "var(--dockhost-bg, #0f172a)",
          color: "var(--dockhost-fg, #f8fafc)",
          minWidth: "min(420px, 90vw)",
          maxWidth: "min(640px, 94vw)",
          borderRadius: "12px",
          boxShadow: "0 20px 48px rgba(15, 23, 42, 0.45)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          outline: "none",
        }}
      >
        <div style={visuallyHidden} aria-live="polite" aria-atomic="true" data-testid="dock-live">
          {liveMessage || ""}
        </div>
        {title ? (
          <h2 id={titleId} style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
            {title}
          </h2>
        ) : null}
        {description ? (
          <p id={descriptionId} style={{ margin: 0, color: "rgba(226, 232, 240, 0.84)" }}>
            {description}
          </p>
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{children}</div>
      </div>
    </div>
  );

  return containerRef.current ? createPortal(dialog, containerRef.current) : dialog;
}
