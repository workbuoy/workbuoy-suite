import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useActiveContext } from "@/core/ActiveContext";
import "./FlipCard.css";

export type FlipCardSize = "sm" | "md" | "lg" | "xl";
type Side = "front" | "back";

type ConnectLink = { type: string; id: string; label?: string };

export type FlipCardProps = {
  front: React.ReactNode;
  back: React.ReactNode;
  size?: FlipCardSize;
  onFlip?: (side: Side) => void;
  onResize?: (size: FlipCardSize) => void;
  onConnect?: (link: ConnectLink) => void;
  ariaLabelFront?: string;
  ariaLabelBack?: string;
};

const ORDER: FlipCardSize[] = ["sm", "md", "lg", "xl"];

const DIMENSIONS: Record<FlipCardSize, { width: string; height: string }> = {
  sm: { width: "min(420px, 92vw)", height: "min(540px, 70vh)" },
  md: { width: "min(640px, 94vw)", height: "min(620px, 74vh)" },
  lg: { width: "min(880px, 96vw)", height: "min(720px, 80vh)" },
  xl: { width: "min(1040px, 98vw)", height: "min(820px, 86vh)" },
};

function FlipCard({
  front,
  back,
  size = "lg",
  onFlip,
  onResize,
  onConnect,
  ariaLabelFront = "Buoy panel",
  ariaLabelBack = "Navi panel",
}: FlipCardProps) {
  const [side, setSide] = useState<Side>("front");
  const [cardSize, setCardSize] = useState<FlipCardSize>(size);
  const [connectOpen, setConnectOpen] = useState(false);
  const [manualType, setManualType] = useState("note");
  const [manualId, setManualId] = useState("");
  const [manualLabel, setManualLabel] = useState("");
  const manualIdRef = useRef<HTMLInputElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    originIndex: number;
  } | null>(null);
  const { selectedEntity, setSelectedEntity } = useActiveContext();

  useEffect(() => {
    setCardSize(size);
  }, [size]);

  useEffect(() => {
    if (!connectOpen) return;
    const id = setTimeout(() => manualIdRef.current?.focus(), 30);
    return () => clearTimeout(id);
  }, [connectOpen]);

  const frontId = useId();
  const backId = useId();

  const dimensions = DIMENSIONS[cardSize];
  const isFlipped = side === "back";

  const connectLabel = useMemo(() => {
    if (selectedEntity) {
      return `${selectedEntity.type}:${selectedEntity.name ?? selectedEntity.id}`;
    }
    return "Select a record";
  }, [selectedEntity]);

  const changeSide = useCallback(
    (next: Side) => {
      setSide(next);
      onFlip?.(next);
    },
    [onFlip],
  );

  const toggleSide = useCallback(() => {
    changeSide(isFlipped ? "front" : "back");
  }, [changeSide, isFlipped]);

  const emitResize = useCallback(
    (next: FlipCardSize) => {
      setCardSize(next);
      onResize?.(next);
    },
    [onResize],
  );

  const nudgeSize = useCallback(
    (direction: 1 | -1) => {
      const index = ORDER.indexOf(cardSize);
      const nextIndex = Math.min(
        Math.max(index + direction, 0),
        ORDER.length - 1,
      );
      const next = ORDER[nextIndex];
      if (next !== cardSize) emitResize(next);
    },
    [cardSize, emitResize],
  );

  // Container keyboard handler (flip + resize).
  // Toolbar-knapper stopper propagation på Enter/Space for å unngå utilsiktet flip.
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleSide();
      }
      if (
        event.shiftKey &&
        (event.key === "ArrowRight" || event.key === "ArrowUp")
      ) {
        event.preventDefault();
        nudgeSize(1);
      }
      if (
        event.shiftKey &&
        (event.key === "ArrowLeft" || event.key === "ArrowDown")
      ) {
        event.preventDefault();
        nudgeSize(-1);
      }
    },
    [toggleSide, nudgeSize],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        originIndex: ORDER.indexOf(cardSize),
      };
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    },
    [cardSize],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const delta = event.clientX - drag.startX;
      if (Math.abs(delta) < 80) return;
      const direction: 1 | -1 = delta > 0 ? 1 : -1;
      const nextIndex = Math.min(
        Math.max(drag.originIndex + direction, 0),
        ORDER.length - 1,
      );
      const nextSize = ORDER[nextIndex];
      dragRef.current = {
        pointerId: drag.pointerId,
        startX: event.clientX,
        originIndex: nextIndex,
      };
      emitResize(nextSize);
    },
    [emitResize],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (dragRef.current && dragRef.current.pointerId === event.pointerId) {
        dragRef.current = null;
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      }
    },
    [],
  );

  const commitConnection = useCallback(
    (link: ConnectLink) => {
      if (!onConnect) return;
      onConnect(link);
      if (["contact", "deal", "invoice", "task", "note"].includes(link.type)) {
        setSelectedEntity({
          type: link.type as any,
          id: link.id,
          name: link.label ?? link.id,
        });
      }
    },
    [onConnect, setSelectedEntity],
  );

  const handleConnect = useCallback(() => {
    if (!onConnect) return;
    if (selectedEntity) {
      commitConnection({
        type: selectedEntity.type,
        id: selectedEntity.id,
        label: selectedEntity.name ?? selectedEntity.id,
      });
      return;
    }
    setManualId("");
    setManualLabel("");
    setConnectOpen(true);
  }, [commitConnection, onConnect, selectedEntity]);

  const handleConnectKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Bare håndter Enter/Space – og hindre flip via container
      if (!(event.key === "Enter" || event.key === " ")) return;
      event.preventDefault();
      event.stopPropagation();
      // Ignorer auto-repeated keydown (holder kortet på front)
      if ("repeat" in event && event.repeat) return;
      handleConnect();
    },
    [handleConnect],
  );

  const handleManualSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = manualId.trim();
    if (!trimmed) return;
    commitConnection({
      type: manualType,
      id: trimmed,
      label: manualLabel.trim() || trimmed,
    });
    setConnectOpen(false);
  }, [commitConnection, manualId, manualLabel, manualType]);
  useEffect(() => {
    if (!connectOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setConnectOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [connectOpen]);

  return (
    <div
      className="flip-card-host flip-host"
      style={{ width: dimensions.width, height: dimensions.height }}
      data-testid="flip-card"
    >
      <div
        className={`flip-card flipcard cardbg flip-card--${cardSize} ${
          isFlipped ? "flip-card--flipped" : ""
        }`}
        role="group"
        aria-roledescription="flip card"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        data-side={side}
      >
        <div className="flip-card-toolbar">
          <div className="flip-card-toolbar__side" aria-live="polite">
            <span className="chip" data-testid="flip-card-side">
              {isFlipped ? "Navi" : "Buoy"}
            </span>
            <button
              type="button"
              className="chip flip-card-toolbar__flip"
              onClick={toggleSide}
              onKeyDown={(e) => {
                // Hindre at Enter/Space på selve flip-knappen dobbel-flipper via container
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSide();
                }
              }}
              aria-label={isFlipped ? "Show Buoy" : "Show Navi"}
            >
              {isFlipped ? "Show Buoy" : "Show Navi"}
            </button>
          </div>
          <div className="flip-card-toolbar__actions">
            <button
              type="button"
              className="chip flip-card-toolbar__connect"
              onClick={handleConnect}
              onKeyDown={handleConnectKeyDown}
              aria-haspopup="dialog"
              aria-label={`Connect ${connectLabel}`}
            >
              Connect
            </button>
            <button
              type="button"
              className="chip flip-card-toolbar__resize"
              aria-label={`Resize card (${cardSize})`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onKeyDown={(event) => {
                if (
                  event.key === "ArrowRight" ||
                  event.key === "ArrowUp" ||
                  event.key === "ArrowLeft" ||
                  event.key === "ArrowDown"
                ) {
                  event.preventDefault();
                }
                if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                  nudgeSize(1);
                }
                if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                  nudgeSize(-1);
                }
                // Enter/Space på resize skal ikke flippe kortet
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }}
            >
              Resize
            </button>
          </div>
        </div>
        <section
          id={frontId}
          className="flip-card-face flip-card-face--front"
          aria-hidden={isFlipped}
          aria-label={ariaLabelFront}
        >
          <div className="flip-face-content" data-testid="flip-card-front">
            {front}
          </div>
        </section>
        <section
          id={backId}
          className="flip-card-face flip-card-face--back"
          aria-hidden={!isFlipped}
          aria-label={ariaLabelBack}
        >
          <div className="flip-face-content" data-testid="flip-card-back">
            {back}
          </div>
        </section>
      </div>

      {connectOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="flip-card-connect"
          data-testid="flip-card-connect-dialog"
        >
          <form className="flip-card-connect__form" onSubmit={handleManualSubmit}>
            <h2>Link to Navi</h2>
            <p>Select the record type and identifier to connect.</p>
            <label className="flip-card-connect__label">
              Type
              <select
                value={manualType}
                onChange={(event) => setManualType(event.target.value)}
              >
                <option value="note">Note</option>
                <option value="contact">Contact</option>
                <option value="deal">Deal</option>
                <option value="invoice">Invoice</option>
                <option value="task">Task</option>
              </select>
            </label>
            <label className="flip-card-connect__label">
              Identifier
              <input
                ref={manualIdRef}
                value={manualId}
                onChange={(event) => setManualId(event.target.value)}
                placeholder="e.g. CRM-1024"
              />
            </label>
            <label className="flip-card-connect__label">
              Display label (optional)
              <input
                value={manualLabel}
                onChange={(event) => setManualLabel(event.target.value)}
                placeholder="Shown in Navi"
              />
            </label>
            <div className="flip-card-connect__actions">
              <button
                type="submit"
                className="chip"
                disabled={!manualId.trim()}
              >
                Connect to Navi
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => setConnectOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export default FlipCard;
