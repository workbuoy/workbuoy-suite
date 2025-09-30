import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  "aria-labelledby"?: string;
  className?: string;
  id?: string;
}

const LABEL_DEFAULTS: Record<Mode, string> = {
  proactive: "Proactive",
  reactive: "Reactive",
};

const SIZE_STYLES: Record<NonNullable<ProactivitySwitchProps["size"]>, {
  container: string;
  label: string;
  highlightInset: string;
}> = {
  sm: {
    container: "px-2 py-1 text-xs",
    label: "text-xs",
    highlightInset: "2px",
  },
  md: {
    container: "px-3 py-1.5 text-sm",
    label: "text-sm",
    highlightInset: "4px",
  },
};

const HIGHLIGHT_TRANSITION = {
  type: "spring" as const,
  stiffness: 500,
  damping: 35,
  mass: 0.8,
};

const visuallyHiddenStyles: CSSProperties = {
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
  "aria-labelledby": ariaLabelledBy,
}: ProactivitySwitchProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<Mode>(defaultValue);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const resolvedValue = isControlled ? (value as Mode) : internalValue;

  const mergedLabels = useMemo(
    () => ({
      ...LABEL_DEFAULTS,
      ...labels,
    }),
    [labels],
  );

  const currentSize = SIZE_STYLES[size];

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", listener);
    } else if (typeof mediaQueryList.addListener === "function") {
      mediaQueryList.addListener(listener);
    }

    return () => {
      if (typeof mediaQueryList.removeEventListener === "function") {
        mediaQueryList.removeEventListener("change", listener);
      } else if (typeof mediaQueryList.removeListener === "function") {
        mediaQueryList.removeListener(listener);
      }
    };
  }, []);

  const buttonClassName = useMemo(() => {
    const base = [
      "wbui-focus-ring",
      "relative grid grid-cols-2 items-center rounded-full border border-border bg-muted/50 text-muted-foreground",
      "transition",
      currentSize.container,
      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      className,
    ];

    return base.filter(Boolean).join(" ");
  }, [className, currentSize.container, disabled]);

  const isProactive = resolvedValue === "proactive";

  const setMode = useCallback(
    (next: Mode) => {
      if (disabled || resolvedValue === next) {
        return;
      }

      if (!isControlled) {
        setInternalValue(next);
      }

      onChange?.(next);
    },
    [disabled, isControlled, onChange, resolvedValue],
  );

  const toggleMode = useCallback(() => {
    const next = isProactive ? "reactive" : "proactive";
    setMode(next);
  }, [isProactive, setMode]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }

      if (event.detail === 0) {
        return;
      }

      toggleMode();
    },
    [disabled, toggleMode],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }

      if (event.key === " " || event.key === "Enter" || event.key === "Space" || event.key === "Spacebar") {
        event.preventDefault();
        toggleMode();
      }
    },
    [disabled, toggleMode],
  );

  const highlightTransition = prefersReducedMotion
    ? { duration: 0 }
    : HIGHLIGHT_TRANSITION;

  const labelClassName = `relative z-10 text-center font-medium ${currentSize.label}`;

  const renderLabel = (segment: Mode) => {
    const active = resolvedValue === segment;

    return (
      <span key={segment} className="relative flex items-center justify-center overflow-hidden">
        {active && (
          <motion.span
            layoutId="proactivity-switch-highlight"
            className="absolute inset-0 z-0 rounded-full bg-primary shadow"
            style={{ inset: currentSize.highlightInset }}
            transition={highlightTransition}
            aria-hidden
          />
        )}
        <span className={`${labelClassName} ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
          {mergedLabels[segment]}
        </span>
      </span>
    );
  };

  const liveAnnouncement = isProactive
    ? `${mergedLabels.proactive} mode active`
    : `${mergedLabels.reactive} mode active`;

  const accessibleLabel = ariaLabelledBy ? undefined : ariaLabel ?? "Proactivity mode";

  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={isProactive}
      aria-label={accessibleLabel}
      aria-labelledby={ariaLabelledBy}
      className={buttonClassName}
      data-disabled={disabled ? "true" : undefined}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {renderLabel("reactive")}
      {renderLabel("proactive")}
      <span aria-live="polite" style={visuallyHiddenStyles}>
        {liveAnnouncement}
      </span>
    </button>
  );
}

export default ProactivitySwitch;
