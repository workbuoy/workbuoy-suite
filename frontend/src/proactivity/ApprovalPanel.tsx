import React, { useEffect, useRef, useState } from "react";
import type { ModeMeta, ProactivityModeKey } from "./useProactivity";

type ApprovalPanelProps = {
  mode: ProactivityModeKey;
  meta: ModeMeta;
  onApprove: (reason: string) => void;
  onCancel: () => void;
  guard?: string | null;
};

export default function ApprovalPanel({ mode, meta, onApprove, onCancel, guard }: ApprovalPanelProps) {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const reasonRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const id = setTimeout(() => reasonRef.current?.focus(), 30);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="proactivity-approval" role="dialog" aria-modal="true">
      <div className="proactivity-approval__card cardbg">
        <header>
          <h3 style={{ marginTop: 0 }}>Activate {meta.label}</h3>
          <p style={{ color: "var(--muted)", marginTop: 4 }}>{meta.description}</p>
        </header>
        {guard ? (
          <div className="proactivity-approval__guard" role="alert">
            {guard}
          </div>
        ) : null}
        <p style={{ fontSize: 13 }}>
          Confirm that you understand Buoy AI will request manual approval before executing tasks in this mode.
        </p>
        <label className="proactivity-approval__label">
          Why are we escalating?
          <textarea
            ref={reasonRef}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            placeholder="Describe the outcome Buoy AI should pursue"
          />
        </label>
        <label className="proactivity-approval__checkbox">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          I approve Buoy AI operating in {meta.label} mode for this tenant.
        </label>
        <div className="proactivity-approval__actions">
          <button
            type="button"
            className="chip"
            onClick={() => onApprove(reason)}
            disabled={!confirmed || reason.trim().length === 0}
          >
            Approve mode change
          </button>
          <button type="button" className="chip" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
