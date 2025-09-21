import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import FlipCard, { type FlipCardProps, type FlipCardSize } from "@/components/FlipCard";
import PeripheralCue, { type PeripheralStatus } from "./PeripheralCue";
import { dockStrings } from "./strings";
import "./dock.css";

type Side = "front" | "back";

export type DockHostProps = {
  open: boolean;
  onClose: () => void;
  initialSide?: Side;
  side?: Side;
  onSideChange?: (side: Side) => void;
  front?: React.ReactNode;
  back?: React.ReactNode;
  hotkeysEnabled?: boolean;
  status?: PeripheralStatus;
  enablePeripheralCue?: boolean;
  onResize?: (size: FlipCardSize) => void;
  onConnect?: NonNullable<FlipCardProps["onConnect"]>;
};

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const HOST_SIZE_ORDER: FlipCardSize[] = ["md", "lg", "xl"];

function emitDockEvent(action: string, meta?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("wb:ux", { detail: { action, meta } }));
}

export default function DockHost({
  open,
  onClose,
  initialSide = "front",
  side: controlledSide,
  onSideChange,
  front,
  back,
  hotkeysEnabled = true,
  status = "ok",
  enablePeripheralCue = true,
  onResize,
  onConnect,
}: DockHostProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const connectButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [localSide, setLocalSide] = useState<Side>(controlledSide ?? initialSide);
  const [cardSize, setCardSize] = useState<FlipCardSize>("xl");
  const titleId = useId();

  const side = controlledSide ?? localSide;

  useEffect(() => {
    if (controlledSide !== undefined) {
      setLocalSide(controlledSide);
    }
  }, [controlledSide]);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => closeButtonRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(id);
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    const previous = previousFocusRef.current;
    if (previous) {
      previous.focus?.();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    if (!node) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    node.addEventListener("keydown", handleKeyDown);
    return () => node.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleFlip = useCallback(
    (next: Side) => {
      if (controlledSide === undefined) {
        setLocalSide(next);
      }
      onSideChange?.(next);
    },
    [controlledSide, onSideChange],
  );

  const cycleSize = useCallback(() => {
    const index = HOST_SIZE_ORDER.indexOf(cardSize);
    const next = HOST_SIZE_ORDER[(index + 1) % HOST_SIZE_ORDER.length];
    setCardSize(next);
    onResize?.(next);
  }, [cardSize, onResize]);

  const handleCardResize = useCallback(
    (next: FlipCardSize) => {
      if (!HOST_SIZE_ORDER.includes(next)) return;
      setCardSize(next);
      onResize?.(next);
    },
    [onResize],
  );

  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    if (!node) return;
    connectButtonRef.current = node.querySelector<HTMLButtonElement>(
      ".flip-card-toolbar__connect",
    );
  }, [open, side, cardSize]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        handleClose();
        return;
      }
      if (!hotkeysEnabled) return;
      if ((event.target as HTMLElement)?.closest("input,textarea,[contenteditable=true]")) {
        return;
      }
      if (event.key === " " && event.ctrlKey && event.shiftKey) {
        event.preventDefault();
        handleFlip("back");
        emitDockEvent("hotkey_flip_to_navi");
        return;
      }
      if (event.key === " " && event.ctrlKey) {
        event.preventDefault();
        handleFlip(side === "back" ? "front" : "back");
        emitDockEvent("hotkey_flip");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose, handleFlip, hotkeysEnabled, open, side]);

  const frontContent = useMemo(() => front ?? null, [front]);
  const backContent = useMemo(() => back ?? null, [back]);

  if (!open) {
    return null;
  }

  return (
    <div className="wb-dock-host" role="presentation">
      <div className="wb-dock-host__backdrop" aria-hidden="true" />
      <div
        className="wb-dock-host__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="wb-dock-host__header">
          <div className="wb-dock-host__title-group">
            <h2 id={titleId}>{dockStrings.host.title}</h2>
            <span className="chip" aria-live="polite">
              {side === "back" ? "Navi" : "Buoy"}
            </span>
          </div>
          <div className="wb-dock-host__actions">
            <button
              type="button"
              className="chip"
              onClick={() => handleFlip(side === "back" ? "front" : "back")}
              aria-label={side === "back" ? dockStrings.toolbar.flipToBuoy : dockStrings.toolbar.flipToNavi}
            >
              {side === "back" ? dockStrings.toolbar.flipToBuoy : dockStrings.toolbar.flipToNavi}
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => {
                connectButtonRef.current?.focus();
                connectButtonRef.current?.click();
              }}
              aria-label={dockStrings.toolbar.connect}
            >
              {dockStrings.toolbar.connect}
            </button>
            <button
              type="button"
              className="chip"
              onClick={cycleSize}
              aria-label={`${dockStrings.toolbar.resize} (${cardSize})`}
            >
              {dockStrings.toolbar.resize}
            </button>
            <button
              type="button"
              className="chip"
              onClick={handleClose}
              aria-label={dockStrings.toolbar.close}
              ref={closeButtonRef}
            >
              {dockStrings.toolbar.close}
            </button>
          </div>
        </header>
        <div className="wb-dock-host__body">
          <FlipCard
            front={frontContent}
            back={backContent}
            size={cardSize}
            onFlip={handleFlip}
            onResize={handleCardResize}
            onConnect={onConnect}
            side={side}
            allowedSizes={HOST_SIZE_ORDER}
            motionProfile="calm"
            strings={{
              flipToBuoy: dockStrings.toolbar.flipToBuoy,
              flipToNavi: dockStrings.toolbar.flipToNavi,
              connect: dockStrings.toolbar.connect,
              resize: dockStrings.toolbar.resize,
            }}
            className="wb-dock__flipcard"
          />
          <PeripheralCue
            status={status}
            placement="full-right"
            active={enablePeripheralCue}
          />
        </div>
        <footer className="wb-dock-host__footer">{dockStrings.host.statusLine}</footer>
      </div>
    </div>
  );
}
