import React, { useEffect, useRef, useState } from "react";
import { undoToastStrings } from "./undoToast/strings";

type UndoToastStatus = "idle" | "pending" | "success" | "error";

type UndoToastProps = {
  open: boolean;
  title: string;
  description?: string;
  canUndo?: boolean;
  onUndo?: () => Promise<boolean> | boolean;
  onClose?: () => void;
  strings?: Partial<typeof undoToastStrings>;
};

export function UndoToast({
  open,
  title,
  description,
  canUndo = false,
  onUndo,
  onClose,
  strings = {},
}: UndoToastProps) {
  const mergedStrings = { ...undoToastStrings, ...strings };
  const [status, setStatus] = useState<UndoToastStatus>("idle");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const undoButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setStatus("idle");
    const timer = window.setTimeout(() => {
      undoButtonRef.current?.focus({ preventScroll: true });
    }, 40);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const actionLabel =
    status === "pending"
      ? mergedStrings.undoing
      : status === "success"
      ? mergedStrings.success
      : canUndo
      ? mergedStrings.undo
      : mergedStrings.cannotUndo;

  async function handleUndo() {
    if (!canUndo || !onUndo) {
      setStatus("error");
      return;
    }
    try {
      setStatus("pending");
      const result = await onUndo();
      setStatus(result ? "success" : "error");
      if (result) {
        window.setTimeout(() => {
          onClose?.();
        }, 1200);
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      ref={containerRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900/95 p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex-1 text-sm text-slate-100">
            <strong className="block text-sm font-semibold text-white">{title}</strong>
            {description && <p className="mt-1 text-xs text-slate-300">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              ref={undoButtonRef}
              type="button"
              className="inline-flex min-w-[80px] justify-center rounded-md border border-indigo-500 px-3 py-1 text-xs font-medium text-indigo-100 hover:bg-indigo-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleUndo}
              disabled={status === "pending" || status === "success"}
              aria-busy={status === "pending"}
            >
              {actionLabel}
            </button>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              onClick={() => onClose?.()}
            >
              {mergedStrings.dismiss}
            </button>
          </div>
        </div>
        {!canUndo && status === "error" && (
          <p className="mt-2 text-xs text-red-300" role="alert">
            {mergedStrings.cannotUndo}
          </p>
        )}
      </div>
    </div>
  );
}

export default UndoToast;
