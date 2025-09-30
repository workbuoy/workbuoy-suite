import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MotionProps } from "framer-motion";
import { motion } from "framer-motion";

export type FlipCardProps = {
  front: ReactNode;
  back: ReactNode;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
};

const baseCardClass = "wbui-flip-card wbui-focus-ring";
const faceClass = "wbui-flip-card__face";

function mergeClassName(extra?: string) {
  return extra ? `${baseCardClass} ${extra}` : baseCardClass;
}

const baseCardStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  cursor: "pointer",
  transformStyle: "preserve-3d",
};

const frontStyle: CSSProperties = {
  gridArea: "1 / 1",
  backfaceVisibility: "hidden",
};

const backStyle: CSSProperties = {
  ...frontStyle,
  transform: "rotateY(180deg)",
};

const wrapperStyle: CSSProperties = {
  perspective: "1200px",
  display: "inline-block",
};

export default function FlipCard({
  front,
  back,
  isFlipped,
  onFlip,
  className,
}: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const resolvedFlipped = isFlipped ?? internalFlipped;

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

  const motionDuration = prefersReducedMotion ? 0 : 0.25;

  const transition: MotionProps["transition"] = useMemo(
    () => ({
      duration: motionDuration,
      ease: [0.45, 0, 0.15, 1],
    }),
    [motionDuration],
  );

  const toggle = useCallback(() => {
    if (isFlipped === undefined) {
      setInternalFlipped((value) => !value);
    }

    onFlip?.();
  }, [isFlipped, onFlip]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Space" || event.key === "Spacebar") {
        event.preventDefault();
        toggle();
      }
    },
    [toggle],
  );

  const cardClassName = useMemo(() => mergeClassName(className), [className]);

  return (
    <div style={wrapperStyle}>
      <motion.div
        role="button"
        tabIndex={0}
        aria-pressed={resolvedFlipped}
        data-flipped={resolvedFlipped}
        className={cardClassName}
        style={{
          ...baseCardStyle,
          transition: prefersReducedMotion
            ? "none"
            : `transform ${motionDuration}s ease`,
        }}
        animate={{ rotateY: resolvedFlipped ? 180 : 0 }}
        initial={false}
        transition={transition}
        onClick={toggle}
        onKeyDown={handleKeyDown}
      >
        <div
          className={`${faceClass} ${faceClass}--front`}
          style={frontStyle}
          aria-hidden={resolvedFlipped}
        >
          {front}
        </div>
        <div
          className={`${faceClass} ${faceClass}--back`}
          style={backStyle}
          aria-hidden={!resolvedFlipped}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
