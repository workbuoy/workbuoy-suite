import React, { useCallback, useEffect, useRef, useState } from "react";
import FlipCard, { type FlipCardProps, type FlipCardSize } from "@/components/FlipCard";
import BuoyChat from "@/features/buoy/BuoyChat";
import NaviGrid from "@/features/navi/NaviGrid";
import { useSettings } from "@/store/settings";
import DockBubble from "./DockBubble";
import DockHost from "./DockHost";
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
  status = "thinking",
  hasActivity = false,
}: DockWidgetProps) {
  const settings = useSettings((state) => ({
    enableDockWidget: state.enableDockWidget,
    dockInitialCollapsed: state.dockInitialCollapsed,
    enablePeripheralCues: state.enablePeripheralCues,
    dockHotkeys: state.dockHotkeys,
  }));

  const [open, setOpen] = useState<boolean>(() => !settings.dockInitialCollapsed);
  const [showHost, setShowHost] = useState(false);
  const [size, setSize] = useState<FlipCardSize>(defaultSize);
  const [side, setSide] = useState<Side>("front");
  const bubbleRef = useRef<HTMLButtonElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const frontContent = front ?? <BuoyChat />;
  const backContent = back ?? <NaviGrid variant="panel" />;

  useEffect(() => {
    setSize(defaultSize);
  }, [defaultSize]);

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
    emitDockEvent(`dock_resize_${next}`);
  }, []);

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

  if (!settings.enableDockWidget) {
    return null;
  }

  const cueStatus: PeripheralStatus = side === "back" ? "ok" : status;

  return (
    <>
      {open && !showHost ? (
        <div
          className="wb-dock__panel"
          role="region"
          aria-label="Workbuoy dock"
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
                >
                  {dockStrings.toolbar.popout}
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
          onResize={(next) => emitDockEvent(`dock_resize_${next}`)}
          onConnect={handleConnect}
        />
      ) : null}
    </>
  );
}
