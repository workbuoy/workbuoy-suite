import React from "react";

export type DockBubbleProps = {
  open: boolean;
  onToggle: () => void;
  hasActivity?: boolean;
  labelOpen: string;
  labelClose: string;
  updatesLabel: string;
};

const DockBubble = React.forwardRef<HTMLButtonElement, DockBubbleProps>(
  ({ open, onToggle, hasActivity = false, labelOpen, labelClose, updatesLabel }, ref) => {
    const label = open
      ? labelClose
      : hasActivity
        ? `${labelOpen}. ${updatesLabel}`
        : labelOpen;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onToggle();
      }
    };

    return (
      <button
        type="button"
        className="wb-bubble"
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={open}
        aria-expanded={open}
        data-open={open ? "true" : "false"}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        ref={ref}
      >
        <span className="wb-bubble__halo" aria-hidden="true" />
        <span className="wb-bubble__icon" aria-hidden="true">
          💬
        </span>
        {hasActivity && !open ? (
          <span className="wb-bubble__badge" aria-hidden="true" />
        ) : null}
      </button>
    );
  },
);

DockBubble.displayName = "DockBubble";

export default DockBubble;
