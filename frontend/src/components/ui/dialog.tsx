import React, { useCallback, useContext, useEffect, useMemo, useRef } from "react";

type DialogContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, defaultOpen = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = typeof open === "boolean";
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  const contextValue = useMemo(() => ({ open: !!currentOpen, setOpen }), [currentOpen, setOpen]);

  return <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>;
}

type DialogTriggerProps = {
  children: React.ReactElement;
};

export const DialogTrigger = React.forwardRef<HTMLElement, DialogTriggerProps>(({ children }, ref) => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("DialogTrigger must be used within a Dialog");
  return React.cloneElement(children, {
    ref,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(event);
      if (!event.defaultPrevented) ctx.setOpen(true);
    },
  });
});
DialogTrigger.displayName = "DialogTrigger";

type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className = "", children, ...props }, ref) => {
    const ctx = useContext(DialogContext);
    const contentRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      if (ctx?.open) {
        const onKey = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            ctx.setOpen(false);
          }
        };
        document.addEventListener("keydown", onKey);
        const el = contentRef.current;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const focusTarget = el?.querySelector<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        focusTarget?.focus();
        return () => {
          document.removeEventListener("keydown", onKey);
          previouslyFocused?.focus?.();
        };
      }
      return;
    }, [ctx?.open, ctx]);

    if (!ctx?.open) return null;

    const classes = [
      "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6",
    ].join(" ");
    const panelClass = [
      "w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900/95 p-6 text-slate-100 shadow-xl",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={classes} aria-modal="true" role="dialog" {...props}>
        <div
          ref={(node) => {
            contentRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className={panelClass}
        >
          {children}
        </div>
      </div>
    );
  }
);
DialogContent.displayName = "DialogContent";

export default Dialog;
