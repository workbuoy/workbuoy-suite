import React, { useCallback, useMemo, useState, useEffect } from "react";
import BuoyChat from "@/features/buoy/BuoyChat";
import NaviGrid from "@/features/navi/NaviGrid";
import { IntrospectionBadge } from "@/components/IntrospectionBadge";

type Mode = "CHAT" | "NAVI";

type FlipCardProps = {
  onConnect?: () => void;
};

export default function FlipCard({ onConnect }: FlipCardProps = {}) {
  const [mode, setMode] = useState<Mode>("CHAT");
  const [expanded, setExpanded] = useState(false);

  const flipped = mode === "NAVI";

  const ariaFront = useMemo(
    () => ({ "aria-hidden": flipped, "aria-label": "Buoy chat" }),
    [flipped],
  );
  const ariaBack = useMemo(
    () => ({ "aria-hidden": !flipped, "aria-label": "Navi oversikt" }),
    [flipped],
  );

  const handleFlip = useCallback(() => {
    setMode((current) => (current === "CHAT" ? "NAVI" : "CHAT"));
  }, []);

  const handleResize = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) {
        return;
      }

      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        handleFlip();
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        handleResize();
      }
    },
    [handleFlip, handleResize],
  );

  return (
    <div
      className="perspective"
      role="application"
      aria-label="Workbuoy flipcard"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        position: "relative",
        height: expanded ? "min(92vh, 840px)" : "min(82vh, 760px)",
      }}
    >
      <div
        className="flipcard cardbg"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 16,
          transform: `rotateY(${flipped ? 180 : 0}deg)`,
        }}
      >
        <section {...ariaFront} className="flipface" style={{ padding: 12 }}>
          <Header
            side="Buoy"
            onFlip={handleFlip}
            onResize={handleResize}
            isExpanded={expanded}
            onConnect={onConnect}
          />
          <div style={{ position: "absolute", inset: "56px 12px 12px 12px" }}>
            <BuoyChat />
          </div>
        </section>
        <section
          {...ariaBack}
          className="flipface"
          style={{ transform: "rotateY(180deg)", padding: 12 }}
        >
          <Header
            side="Navi"
            onFlip={handleFlip}
            onResize={handleResize}
            isExpanded={expanded}
          />
          <div style={{ position: "absolute", inset: "56px 12px 12px 12px" }}>
            <NaviGrid />
          </div>
        </section>
      </div>
    </div>
  );
}

type HeaderProps = {
  side: "Buoy" | "Navi";
  onFlip: () => void;
  onResize: () => void;
  isExpanded: boolean;
  onConnect?: () => void;
};

function Header({ side, onFlip, onResize, isExpanded, onConnect }: HeaderProps) {
  const flipLabel = side === "Buoy" ? "Gå til Navi" : "Gå til Buoy";
  const resizeLabel = isExpanded ? "Reduser kort" : "Utvid kort";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <strong style={{ letterSpacing: 0.3, opacity: 0.9 }}>{side}</strong>
      <span style={{ flex: 1 }} />
      <IntrospectionBadge />
      <HealthBadge />
      {onConnect ? <ConnectButton onConnect={onConnect} /> : null}
      <button
        type="button"
        onClick={onResize}
        aria-label={resizeLabel}
        className="chip"
      >
        Resize
      </button>
      <button
        type="button"
        onClick={onFlip}
        aria-label={flipLabel}
        className="chip"
        style={{ background: "transparent" }}
      >
        Flip
      </button>
    </div>
  );
}

type ConnectButtonProps = {
  onConnect: () => void;
};

function ConnectButton({ onConnect }: ConnectButtonProps) {
  const handleClick = useCallback(() => {
    onConnect();
  }, [onConnect]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        onConnect();
      }
    },
    [onConnect],
  );

  return (
    <button
      type="button"
      className="chip"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      Connect
    </button>
  );
}

type HealthState = "ok" | "wait" | "err";

function HealthBadge() {
  const [state, setState] = useState<HealthState>("wait");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(() => {
        if (!cancelled) setState("ok");
      })
      .catch(() => {
        if (!cancelled) setState("err");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const color =
    state === "ok"
      ? "var(--ok)"
      : state === "wait"
        ? "var(--warn)"
        : "var(--err)";
  const label =
    state === "ok" ? "Backend OK" : state === "wait" ? "Sjekker…" : "Feil";

  return (
    <span className="chip" style={{ borderColor: color, color }}>
      {label}
    </span>
  );
}
