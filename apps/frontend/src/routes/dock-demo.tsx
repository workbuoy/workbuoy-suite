import React from "react";
import { DockHost, useFocusReturn } from "@/features/dock";

export default function DockDemo() {
  const [open, setOpen] = React.useState(false);
  const [liveMessage, setLiveMessage] = React.useState("");
  const approveRef = React.useRef<HTMLButtonElement>(null);
  const focusReturnRef = useFocusReturn(open);

  const handleApprove = () => {
    setLiveMessage("Approved");
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        padding: "32px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Dock Host Demo</h1>
        <p style={{ margin: 0, opacity: 0.72 }}>
          Press the button below to open the DockHost modal and explore the accessible focus trap.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          fontSize: "1rem",
          padding: "12px 20px",
          borderRadius: "999px",
          border: "1px solid rgba(148, 163, 184, 0.6)",
          background: "rgba(15, 23, 42, 0.6)",
          color: "inherit",
          cursor: "pointer",
        }}
      >
        Open Dock
      </button>
      {open ? (
        <DockHost
          open={open}
          onClose={() => setOpen(false)}
          title="Dock Host"
          description="Stay focused inside this dialog. Tab and Shift+Tab cycle within the action buttons."
          liveMessage={liveMessage}
          initialFocusRef={approveRef}
          lastActiveElement={focusReturnRef.current}
        >
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              ref={approveRef}
              type="button"
              onClick={handleApprove}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#22d3ee",
                color: "#0f172a",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(148, 163, 184, 0.6)",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
          {liveMessage ? (
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.85 }}>Status: {liveMessage}</p>
          ) : null}
        </DockHost>
      ) : null}
    </div>
  );
}
