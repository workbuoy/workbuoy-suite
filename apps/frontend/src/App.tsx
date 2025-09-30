import React, { useState } from "react";
import FlipCard, { type FlipCardSize } from "./components/FlipCard";
import BuoyPanel from "./buoy/BuoyPanel";
import NaviPanel from "./navi/NaviPanel";
import { useConnections } from "./navi/useConnections";
import ModeSwitcher from "./proactivity/ModeSwitcher";
import { ActiveContextProvider } from "./core/ActiveContext";
import { IntrospectionBadge } from "./components/IntrospectionBadge";
import { PrimaryNav } from "./components/PrimaryNav";
import DockWidget from "@/features/dock/DockWidget";

function HealthBadge() {
  const [status, setStatus] = useState<"ok" | "wait" | "err">("wait");
  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => {
        if (!cancelled) setStatus("ok");
      })
      .catch(() => {
        if (!cancelled) setStatus("err");
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const label = status === "ok" ? "Backend OK" : status === "wait" ? "Sjekker…" : "Feil";
  const color = status === "ok" ? "var(--ok)" : status === "wait" ? "var(--warn)" : "var(--err)";
  return (
    <span className="chip" style={{ borderColor: color, color }}>
      {label}
    </span>
  );
}

function Shell() {
  const { connections, addConnection, removeConnection, highlight, markFromNavi } = useConnections();
  const [size, setSize] = useState<FlipCardSize>("lg");

  return (
    <div style={{ display: "grid", placeItems: "center", padding: 16, minHeight: "100%" }}>
      <div style={{ width: "min(1120px, 96vw)" }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 20, letterSpacing: 0.6 }}>WorkBuoy</h1>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <IntrospectionBadge />
              <HealthBadge />
            </div>
          </div>
          <ModeSwitcher />
          <PrimaryNav aria-label="Demo routes" />
        </header>
        <FlipCard
          front={<BuoyPanel onQuickConnect={addConnection} />}
          back={
            <NaviPanel
              connections={connections}
              highlight={highlight}
              onRemove={removeConnection}
              onSelect={markFromNavi}
            />
          }
          size={size}
          onResize={setSize}
          onConnect={addConnection}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ActiveContextProvider>
      <Shell />
      <DockWidget />
    </ActiveContextProvider>
  );
}
