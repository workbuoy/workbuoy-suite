import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import FlipCard from "../components/FlipCard.js";
import type { FlipCardProps } from "../components/FlipCard.js";

import "./buoydock.css";

export type BuoyDockProps = {
  initialSide?: "front" | "back";
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (value: boolean) => void;
  titleFront?: string;
  titleBack?: string;
  childrenFront: ReactNode;
  childrenBack: ReactNode;
  ariaLabel?: string;
};

const focusableSelectors =
  'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isElementVisible(element: HTMLElement | null) {
  if (!element) {
    return false;
  }

  if (typeof window === "undefined") {
    return true;
  }

  const style = window.getComputedStyle(element);

  if (style.visibility === "hidden" || style.display === "none") {
    return false;
  }

  return element.getClientRects().length > 0;
}

export function BuoyDock({
  initialSide = "front",
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  titleFront = "buoy ai",
  titleBack = "Navi",
  childrenFront,
  childrenBack,
  ariaLabel = "BuoyDock widget",
}: BuoyDockProps) {
  const [isBack, setIsBack] = useState(() => initialSide === "back");
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const isExpanded = expanded ?? internalExpanded;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const frontHeaderRef = useRef<HTMLDivElement | null>(null);
  const backHeaderRef = useRef<HTMLDivElement | null>(null);
  const expandButtonRef = useRef<HTMLButtonElement | null>(null);
  const flipButtonRef = useRef<HTMLButtonElement | null>(null);
  const prevExpandedRef = useRef(isExpanded);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const hasAnnouncedRef = useRef(false);

  const frontTitleId = useId();
  const backTitleId = useId();

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

  const toggleExpand = useCallback(
    (next?: boolean) => {
      const resolved = next ?? !isExpanded;

      if (expanded === undefined) {
        setInternalExpanded(resolved);
      }

      onExpandedChange?.(resolved);
    },
    [expanded, isExpanded, onExpandedChange],
  );

  useEffect(() => {
    if (prevExpandedRef.current === isExpanded) {
      return;
    }

    prevExpandedRef.current = isExpanded;

    if (isExpanded) {
      queueMicrotask(() => {
        backHeaderRef.current?.focus();
      });
    } else {
      queueMicrotask(() => {
        if (isBack && expandButtonRef.current) {
          expandButtonRef.current.focus();
          return;
        }

        if (!isBack) {
          if (isElementVisible(flipButtonRef.current)) {
            flipButtonRef.current?.focus();
            return;
          }

          if (isElementVisible(frontHeaderRef.current)) {
            frontHeaderRef.current?.focus();
            return;
          }
        }

        if (isElementVisible(backHeaderRef.current)) {
          backHeaderRef.current?.focus();
          return;
        }

        containerRef.current?.focus?.();
      });
    }
  }, [isBack, isExpanded]);

  useEffect(() => {
    const node = containerRef.current;
    if (!isExpanded || !node) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        toggleExpand(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = Array.from(
        node.querySelectorAll<HTMLElement>(focusableSelectors),
      ).filter((element) => !element.hasAttribute("data-focus-guard"));

      if (focusable.length === 0) {
        event.preventDefault();
        backHeaderRef.current?.focus();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !node.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", handleKeyDown);
    return () => {
      node.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded, toggleExpand]);

  useEffect(() => {
    const liveNode = liveRegionRef.current;
    if (!liveNode) {
      return;
    }

    if (!hasAnnouncedRef.current) {
      hasAnnouncedRef.current = true;
      return;
    }

    liveNode.textContent = `${titleBack} ${isExpanded ? "expanded" : "collapsed"}`;
  }, [isExpanded, titleBack]);

  const handleFlip = useCallback(() => {
    setIsBack((value) => !value);
  }, []);

  const dockRole = isExpanded ? "dialog" : "complementary";
  const dockAriaProps = isExpanded
    ? {
        role: dockRole,
        "aria-modal": "true" as const,
        "aria-labelledby": backTitleId,
      }
    : { role: dockRole };

  const transition = useMemo(
    () => ({
      duration: prefersReducedMotion ? 0.1 : 0.22,
      ease: prefersReducedMotion ? "linear" : [0.16, 0.84, 0.44, 1],
    }),
    [prefersReducedMotion],
  );

  const flipCardProps: Pick<FlipCardProps, "isFlipped"> = useMemo(
    () => ({
      isFlipped: isBack,
    }),
    [isBack],
  );

  const front = (
    <div
      className="wbui-buoydock__face"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.stopPropagation();
        }
      }}
    >
      <header className="wbui-buoydock__header">
        <div
          className="wbui-buoydock__title"
          id={frontTitleId}
          ref={frontHeaderRef}
          tabIndex={-1}
        >
          {titleFront}
        </div>
        <button
          type="button"
          className="wbui-buoydock__control wbui-focus-ring"
          onClick={handleFlip}
          ref={flipButtonRef}
        >
          Flip to {titleBack}
        </button>
      </header>
      <div className="wbui-buoydock__content" aria-label={ariaLabel}>
        {childrenFront}
      </div>
    </div>
  );

  const back = (
    <div
      className="wbui-buoydock__face"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.stopPropagation();
        }
      }}
    >
      <header className="wbui-buoydock__header">
        <div
          className="wbui-buoydock__title"
          id={backTitleId}
          ref={backHeaderRef}
          tabIndex={-1}
        >
          {titleBack}
        </div>
        <div className="wbui-buoydock__actions">
          <button
            type="button"
            className="wbui-buoydock__control wbui-focus-ring"
            onClick={handleFlip}
          >
            Flip to {titleFront}
          </button>
          <button
            type="button"
            ref={expandButtonRef}
            className="wbui-buoydock__control wbui-focus-ring"
            aria-expanded={isExpanded}
            onClick={() => toggleExpand()}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </header>
      <div className="wbui-buoydock__content" aria-label={ariaLabel}>
        {childrenBack}
      </div>
    </div>
  );

  return (
    <motion.section
      {...dockAriaProps}
      aria-label={ariaLabel}
      className="wbui-buoydock"
      data-expanded={isExpanded ? "true" : "false"}
      data-reduced-motion={prefersReducedMotion ? "true" : "false"}
      animate={{
        width: `var(${isExpanded ? "--wbui-dock-w-expanded" : "--wbui-dock-w"})`,
        height: `var(${isExpanded ? "--wbui-dock-h-expanded" : "--wbui-dock-h"})`,
      }}
      initial={false}
      transition={transition}
      ref={containerRef}
      tabIndex={-1}
    >
      <FlipCard
        {...flipCardProps}
        front={front}
        back={back}
        onFlip={handleFlip}
        interactive={false}
        className="wbui-buoydock__card"
      />
      <div
        className="wbui-buoydock__live-region"
        aria-live="polite"
        aria-atomic="true"
        ref={liveRegionRef}
      />
    </motion.section>
  );
}

export default BuoyDock;
