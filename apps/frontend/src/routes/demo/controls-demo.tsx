import React, { useId, useState } from "react";
import { FlipCard, ProactivitySwitch, type Mode } from "@workbuoy/ui";

function CardFace({
  title,
  description,
  list,
}: {
  title: string;
  description: string;
  list: Array<{ label: string; detail: string }>;
}) {
  return (
    <article
      style={{
        display: "grid",
        gap: "12px",
        padding: "24px",
        borderRadius: "16px",
        background: "rgba(15, 23, 42, 0.85)",
        color: "#f8fafc",
        maxWidth: "360px",
      }}
    >
      <header style={{ display: "grid", gap: "4px" }}>
        <h3
          style={{ margin: 0, fontSize: "1.25rem", letterSpacing: 0.3 }}
        >
          {title}
        </h3>
        <p style={{ margin: 0, opacity: 0.8 }}>{description}</p>
      </header>
      <ul style={{ display: "grid", gap: "8px", margin: 0, padding: 0, listStyle: "none" }}>
        {list.map((item) => (
          <li
            key={item.label}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              padding: "10px 12px",
              borderRadius: "12px",
              background: "rgba(30, 41, 59, 0.85)",
            }}
          >
            <span style={{ fontWeight: 600 }}>{item.label}</span>
            <span style={{ opacity: 0.8 }}>{item.detail}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function ControlsDemo() {
  const [mode, setMode] = useState<Mode>("reactive");
  const [isFlipped, setIsFlipped] = useState(false);

  const isProactive = mode === "proactive";

  const cardRegionId = useId();
  const liveAnnouncement =
    mode === "proactive"
      ? "Proactive mode enabled"
      : "Reactive mode enabled";

  const handleSegmentChange = (nextMode: Mode) => {
    if (mode === nextMode) {
      return;
    }

    setMode(nextMode);
  };

  const handleSegmentKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (
      event.key === " " ||
      event.key === "Enter" ||
      event.key === "Space" ||
      event.key === "Spacebar"
    ) {
      event.preventDefault();
      setMode((current: Mode) =>
        current === "proactive" ? "reactive" : "proactive",
      );
    }
  };

  const handleFlipToggle = () => {
    setIsFlipped((previous) => !previous);
  };

  const frontFace = (
    <CardFace
      title="Reactive briefing"
      description="Compact summary while you monitor ongoing workflows."
      list={[
        { label: "Alerts", detail: "2 unresolved across dispatch" },
        { label: "Downtime", detail: "No active incidents" },
        { label: "Hand-offs", detail: "3 waiting for review" },
      ]}
    />
  );

  const backFace = (
    <CardFace
      title="Proactive plan"
      description="Flip to explore predictive recommendations and actions."
      list={[
        { label: "Playbooks", detail: "Update runbook owners" },
        { label: "Insights", detail: "Revise staffing forecast" },
        { label: "Experiments", detail: "Pilot automated outreach" },
      ]}
    />
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #0f172a, #020617)",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        gap: "32px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 640 }}>
        <h1 id="demo-flip-title" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Controls demo
        </h1>
        <p style={{ margin: 0, opacity: 0.85 }}>
          Toggle between proactive and reactive modes, then flip the card to compare
          the experiences.
        </p>
      </div>

      <div style={{ display: "grid", gap: "24px", justifyItems: "center" }}>
        <div style={{ display: "grid", gap: "12px", justifyItems: "center" }}>
          <div
            role="group"
            aria-label="Proactivity mode"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px",
              borderRadius: "999px",
              border: "1px solid rgba(148, 163, 184, 0.4)",
              background: "rgba(15, 23, 42, 0.7)",
            }}
          >
            <button
              type="button"
              onClick={() => handleSegmentChange("reactive")}
              onKeyDown={handleSegmentKeyDown}
              aria-pressed={!isProactive}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "none",
                fontWeight: 600,
                letterSpacing: 0.3,
                background: !isProactive
                  ? "rgba(59, 130, 246, 0.35)"
                  : "transparent",
                color: !isProactive ? "#0f172a" : "#e2e8f0",
                cursor: "pointer",
                transition: "background 0.2s ease, color 0.2s ease",
                outline: "none",
              }}
            >
              Reactive
            </button>
            <button
              type="button"
              onClick={() => handleSegmentChange("proactive")}
              onKeyDown={handleSegmentKeyDown}
              aria-pressed={isProactive}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "none",
                fontWeight: 600,
                letterSpacing: 0.3,
                background: isProactive
                  ? "rgba(59, 130, 246, 0.35)"
                  : "transparent",
                color: isProactive ? "#0f172a" : "#e2e8f0",
                cursor: "pointer",
                transition: "background 0.2s ease, color 0.2s ease",
                outline: "none",
              }}
            >
              Proactive
            </button>
          </div>
          <ProactivitySwitch
            value={mode}
            onChange={setMode}
            aria-label="Proactivity mode"
          />
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-testid="mode-status"
            style={{ fontSize: "1rem" }}
          >
            {liveAnnouncement}
          </div>
        </div>

        <div
          id={cardRegionId}
          aria-labelledby="demo-flip-title"
          style={{ display: "grid", gap: "12px", justifyItems: "center" }}
        >
          <FlipCard front={frontFace} back={backFace} isFlipped={isFlipped} onFlip={handleFlipToggle} />
          <button
            type="button"
            onClick={handleFlipToggle}
            aria-pressed={isFlipped}
            aria-controls={cardRegionId}
            data-testid="flip-toggle"
            style={{
              padding: "12px 18px",
              borderRadius: "999px",
              border: "1px solid rgba(148, 163, 184, 0.5)",
              background: isFlipped ? "rgba(59, 130, 246, 0.25)" : "rgba(15, 23, 42, 0.8)",
              color: "inherit",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {isFlipped ? "Show reactive summary" : "Show proactive plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
