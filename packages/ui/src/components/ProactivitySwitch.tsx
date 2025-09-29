import type { KeyboardEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export type Mode = "proactive" | "reactive";

export interface ProactivitySwitchProps {
  value?: Mode;
  defaultValue?: Mode;
  onChange?: (value: Mode) => void;
  disabled?: boolean;
  labels?: { proactive?: string; reactive?: string };
  size?: "sm" | "md";
  "aria-label"?: string;
  className?: string;
  id?: string;
}

const LABEL_DEFAULTS: Record<Mode, string> = {
  proactive: "Proactive",
  reactive: "Reactive",
};

const SIZE_STYLES: Record<NonNullable<ProactivitySwitchProps["size"]>, { container: string; button: string; text: string }> = {
  sm: {
    container: "p-0.5 text-sm",
    button: "px-2 py-1 text-xs",
    text: "text-xs",
  },
  md: {
    container: "p-1",
    button: "px-3 py-1.5 text-sm",
    text: "text-sm",
  },
};

const HIGHLIGHT_TRANSITION = {
  type: "spring" as const,
  stiffness: 500,
  damping: 35,
  mass: 0.8,
};

export function ProactivitySwitch({
  value,
  defaultValue = "reactive",
  onChange,
  disabled = false,
  labels,
  size = "md",
  className,
  id,
  "aria-label": ariaLabel,
}: ProactivitySwitchProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Mode>(defaultValue);
  const resolvedValue = isControlled ? (value as Mode) : internalValue;

  const reactiveRef = useRef<HTMLButtonElement>(null);
  const proactiveRef = useRef<HTMLButtonElement>(null);

  const mergedLabels = useMemo(
    () => ({
      ...LABEL_DEFAULTS,
      ...labels,
    }),
    [labels],
  );

  const currentSize = SIZE_STYLES[size];

  const containerClassName = useMemo(() => {
    const base = "inline-flex items-center rounded-full border border-border bg-muted/50";
    const disabledClasses = disabled ? " opacity-60 cursor-not-allowed" : "";
    return [base, currentSize.container, "gap-1", "transition", className, disabledClasses]
      .filter(Boolean)
      .join(" ");
  }, [className, currentSize.container, disabled]);

  const selectMode = useCallback(
    (next: Mode, options?: { focus?: boolean }) => {
      if (disabled || resolvedValue === next) {
        if (options?.focus) {
          const ref = next === "reactive" ? reactiveRef.current : proactiveRef.current;
          ref?.focus();
        }
        return;
      }

      if (!isControlled) {
        setInternalValue(next);
      }

      onChange?.(next);

      if (options?.focus) {
        const ref = next === "reactive" ? reactiveRef.current : proactiveRef.current;
        ref?.focus();
      }
    },
    [disabled, isControlled, onChange, resolvedValue],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        selectMode("proactive", { focus: true });
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        selectMode("reactive", { focus: true });
      }
    },
    [disabled, selectMode],
  );

  const handleSegmentKeyDown = useCallback(
    (segment: Mode) => (event: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const next = segment === "reactive" ? "proactive" : "reactive";
        selectMode(next, { focus: true });
      }
    },
    [disabled, selectMode],
  );

  const renderButton = (segment: Mode) => {
    const isSelected = resolvedValue === segment;
    const ref = segment === "reactive" ? reactiveRef : proactiveRef;
    const label = mergedLabels[segment];
    const buttonClasses = [
      "relative flex-1 rounded-full font-medium transition",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "overflow-hidden text-center disabled:pointer-events-none",
      currentSize.button,
      isSelected ? "text-primary-foreground" : "text-muted-foreground",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        key={segment}
        ref={ref}
        type="button"
        className={buttonClasses}
        aria-pressed={isSelected}
        aria-label={label}
        data-selected={isSelected ? true : undefined}
        disabled={disabled}
        tabIndex={isSelected ? 0 : -1}
        onClick={() => selectMode(segment, { focus: true })}
        onKeyDown={handleSegmentKeyDown(segment)}
      >
        {isSelected && (
          <motion.span
            layoutId="proactivity-switch-highlight"
            className="absolute inset-0 z-0 rounded-full bg-primary shadow"
            transition={HIGHLIGHT_TRANSITION}
            aria-hidden
          />
        )}
        <span className={`relative z-10 ${currentSize.text}`}>{label}</span>
      </button>
    );
  };

  const groupLabel = ariaLabel ?? "Proactivity mode";

  return (
    <div
      role="group"
      aria-label={groupLabel}
      className={containerClassName}
      id={id}
      data-disabled={disabled ? "true" : undefined}
      onKeyDown={handleKeyDown}
    >
      {renderButton("reactive")}
      {renderButton("proactive")}
    </div>
  );
}

export default ProactivitySwitch;
