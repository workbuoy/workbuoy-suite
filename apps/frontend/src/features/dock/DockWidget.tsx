import React, { useCallback, useEffect, useRef, useState } from "react";
import FlipCard, { type FlipCardProps, type FlipCardSize } from "@/components/FlipCard";
import BuoyChat from "@/features/buoy/BuoyChat";
import NaviGrid from "@/features/navi/NaviGrid";
import useDockStatus from "@/features/core/useDockStatus";
import { useSettings, setDockPosition, setDockSize } from "@/store/settings";
import DockBubble from "./DockBubble";
import DockHost from "./DockHostLegacy";
import PeripheralCue, { type PeripheralStatus } from "./PeripheralCue";
import { dockStrings } from "./strings";
import "./dock.css";

type Side = "front" | "back";

type DockWidgetProps = {
  defaultSize?: Exclude<FlipCardSize, "xl">;
  onClose?: () => void;
  front?: React.ReactNode;
  back?: React.ReactNode;
  status?: PeripheralStatus;
  hasActivity?: boolean;
};

const WIDGET_SIZES: FlipCardSize[] = ["sm", "md", "lg"];

function emitDockEvent(action: string, meta?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("wb:ux", { detail: { action, meta } }));
}

export default function DockWidget({
  defaultSize = "sm",
  onClose,
  front,
  back,
  status: statusOverride,
  hasActivity = false,
}: DockWidgetProps) {
  const settings = useSettings((state) => ({
    enableDockWidget: state.enableDockWidget,
    dockInitialCollapsed: state.dockInitialCollapsed,
    enablePeripheralCues: state.enablePeripheralCues,
    dockHotkeys: state.dockHotkeys,
    dockSize: state.dockSize,
    dockPosition: state.dockPosition,
    fastFlip: state.fastFlip,
  }));

  const [open, setOpen] = useState<boolean>(() => !settings.dockInitialCollapsed);
  const [showHost, setShowHost] = useState(false);
  const [side, setSide] = useState<Side>("front");
  const [size, setSize] = useState<FlipCardSize>(() => {
    if (settings.dockSize && WIDGET_SIZES.includes(settings.dockSize)) {
      return settings.dockSize;
    }
    return defaultSize;
  });
  const [position, setPosition] = useState<{ x: number; y: number }>(() => ({
    x: settings.dockPosition?.x ?? 0,
    y: settings.dockPosition?.y ?? 0,
  }));
  const bubbleRef = useRef<HTMLButtonElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const fastFlipTelemetryRef = useRef(settings.fastFlip);

  const frontContent = front ?? <BuoyChat />;
  const backContent = back ?? <NaviGrid variant="panel" />;
  const dockStatus = useDockStatus();

  useEffect(() => {
    const nextSize =
      settings.dockSize && WIDGET_SIZES.includes(settings.dockSize)
        ? settings.dockSize
        : defaultSize;
    setSize((prev) => (prev === nextSize ? prev : nextSize));
  }, [settings.dockSize, defaultSize]);

  useEffect(() => {
    const next = settings.dockPosition ?? { x: 0, y: 0 };
    setPosition((prev) =>
      prev.x === next.x && prev.y === next.y ? prev : { x: next.x, y: next.y },
    );
  }, [settings.dockPosition]);

  useEffect(() => {
    if (fastFlipTelemetryRef.current === settings.fastFlip) {
      return;
    }
    fastFlipTelemetryRef.current = settings.fastFlip;
    emitDockEvent("flip_style", { style: settings.fastFlip ? "fast" : "3d" });
  }, [settings.fastFlip]);

  useEffect(() => {
    if (!settings.enableDockWidget) {
      setOpen(false);
      setShowHost(false);
    }
  }, [settings.enableDockWidget]);

  useEffect(() => {
    if (!open || showHost) return;
    const id = window.setTimeout(() => cardRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [open, showHost]);

  useEffect(() => {
    if (!open || showHost) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        emitDockEvent("dock_close", { source: "escape" });
        onClose?.();
        window.setTimeout(() => bubbleRef.current?.focus(), 30);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, showHost, onClose]);

  const handleToggle = useCallback(() => {
    setShowHost(false);
    setOpen((prev) => {
      const next = !prev;
      emitDockEvent(next ? "dock_open" : "dock_close", { source: "bubble" });
      if (!next) {
        onClose?.();
      }
      return next;
    });
  }, [onClose]);

  const handleResize = useCallback((next: FlipCardSize) => {
    if (!WIDGET_SIZES.includes(next)) return;
    setSize(next);
    setDockSize(next as typeof settings.dockSize);
    emitDockEvent(`dock_resize_${next}`);
  }, [settings.dockSize]);

  const handleSideChange = useCallback((next: Side) => {
    setSide(next);
    emitDockEvent(next === "back" ? "dock_flip_to_navi" : "dock_flip_to_buoy");
  }, []);

  const handlePopOut = useCallback(() => {
    setShowHost(true);
    emitDockEvent("dock_popout_open");
  }, []);

  const handleHostClose = useCallback(() => {
    setShowHost(false);
    emitDockEvent("dock_popout_close");
    const focusTarget = bubbleRef.current ?? cardRef.current;
    window.setTimeout(() => focusTarget?.focus(), 40);
  }, []);

  const handleConnect = useCallback<NonNullable<FlipCardProps["onConnect"]>>((link) => {
    emitDockEvent("dock_connect", { type: link.type });
  }, []);

  const handleDragPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      if (event.target !== event.currentTarget) return;
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: position.x,
        originY: position.y,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [position.x, position.y],
  );

  const handleDragPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      setPosition({ x: drag.originX + deltaX, y: drag.originY + deltaY });
    },
    [],
  );

  const commitPosition = useCallback(
    (drag: {
      originX: number;
      originY: number;
      startX: number;
      startY: number;
    }, event: React.PointerEvent<HTMLDivElement>) => {
      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;
      const next = { x: drag.originX + deltaX, y: drag.originY + deltaY };
      setPosition(next);
      setDockPosition(next);
      emitDockEvent("dock_reposition", { x: next.x, y: next.y });
      return next;
    },
    [],
  );

  const handleDragPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      commitPosition(drag, event);
    },
    [commitPosition],
  );

  const handleDragPointerCancel = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setPosition({ x: drag.originX, y: drag.originY });
  }, []);

  if (!settings.enableDockWidget) {
    return null;
  }

  const resolvedStatus = statusOverride ?? dockStatus;
  const cueStatus: PeripheralStatus = side === "back" ? "ok" : resolvedStatus;

  return (
    <>
      {open && !showHost ? (
        <div
          className="wb-dock__panel"
          role="region"
          aria-label="Workbuoy dock"
          ref={panelRef}
          style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
          onPointerDown={handleDragPointerDown}
          onPointerMove={handleDragPointerMove}
          onPointerUp={handleDragPointerUp}
          onPointerCancel={handleDragPointerCancel}
        >
          <div
            className="wb-dock__surface"
            tabIndex={-1}
            ref={cardRef}
            data-size={size}
          >
            <FlipCard
              front={frontContent}
              back={backContent}
              size={size}
              onFlip={handleSideChange}
              onResize={handleResize}
              onConnect={handleConnect}
              side={side}
              allowedSizes={WIDGET_SIZES}
              motionProfile="calm"
              fastFlip={settings.fastFlip}
              strings={{
                flipToBuoy: dockStrings.toolbar.flipToBuoy,
                flipToNavi: dockStrings.toolbar.flipToNavi,
                connect: dockStrings.toolbar.connect,
                resize: dockStrings.toolbar.resize,
              }}
              className="wb-dock__flipcard"
              toolbarExtras={
                <button
                  type="button"
                  className="chip wb-dock__popout"
                  onClick={handlePopOut}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      handlePopOut();
                    }
                  }}
                  aria-label={dockStrings.toolbar.popout}
                  title={dockStrings.toolbar.popout}
                >
                  <span aria-hidden="true" className="wb-dock__popout-icon">
                    ⤢
                  </span>
                </button>
              }
            />
            <PeripheralCue
              status={cueStatus}
              placement="right-edge"
              active={settings.enablePeripheralCues}
            />
          </div>
        </div>
      ) : null}
      <DockBubble
        ref={bubbleRef}
        open={open}
        onToggle={handleToggle}
        hasActivity={hasActivity}
        labelOpen={dockStrings.bubble.openLabel}
        labelClose={dockStrings.bubble.closeLabel}
        updatesLabel={dockStrings.bubble.hasUpdates}
      />
      {showHost ? (
        <DockHost
          open
          onClose={handleHostClose}
          side={side}
          onSideChange={handleSideChange}
          front={frontContent}
          back={backContent}
          status={cueStatus}
          enablePeripheralCue={settings.enablePeripheralCues}
          hotkeysEnabled={settings.dockHotkeys}
          fastFlip={settings.fastFlip}
          onResize={(next) => {
            emitDockEvent(`dock_resize_${next}`);
            if (WIDGET_SIZES.includes(next)) {
              setDockSize(next as typeof settings.dockSize);
            }
          }}
          onConnect={handleConnect}
        />
      ) : null}
    </>
  );
}
