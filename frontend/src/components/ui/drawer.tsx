import React, { useEffect } from "react";

type DrawerProps = {
  open: boolean;
  onOpenChange?: (value: boolean) => void;
  children: React.ReactNode;
  title?: string;
};

export function Drawer({ open, onOpenChange, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange?.(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center bg-black/60 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange?.(false);
      }}
    >
      <div className="w-full max-w-2xl rounded-t-2xl border border-slate-800 bg-slate-900/95 p-6 text-slate-100 shadow-xl">
        {children}
      </div>
    </div>
  );
}

export default Drawer;
