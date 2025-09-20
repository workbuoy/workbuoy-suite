import React, { useMemo, useState } from "react";
import ApprovalPanel from "./ApprovalPanel";
import { MODE_META, PROACTIVITY_ORDER, type ProactivityModeKey, useProactivity } from "./useProactivity";
import "./proactivity.css";

export default function ModeSwitcher() {
  const { state, mode, effectiveMode, setMode, loading, lastGuard, error } = useProactivity();
  const [pending, setPending] = useState<ProactivityModeKey | null>(null);
  const guard = useMemo(() => lastGuard ?? state?.uiHints?.banner ?? null, [lastGuard, state?.uiHints?.banner]);

  const handleSelect = (next: ProactivityModeKey) => {
    if (next === mode) return;
    const meta = MODE_META[next];
    if (meta.requiresApproval) {
      setPending(next);
      return;
    }
    void setMode(next);
  };

  const handleApprove = async (reason: string) => {
    if (!pending) return;
    await setMode(pending, { approved: true, reason });
    setPending(null);
  };

  const handleCancel = () => setPending(null);

  return (
    <div className="proactivity-switcher" data-testid="proactivity-switcher">
      <div className="proactivity-switcher__buttons" role="group" aria-label="Proactivity mode">
        {PROACTIVITY_ORDER.map((key) => {
          const meta = MODE_META[key];
          const active = mode === key;
          const effective = effectiveMode === key;
          return (
            <button
              key={key}
              type="button"
              className="chip proactivity-switcher__button"
              aria-pressed={active}
              onClick={() => handleSelect(key)}
              data-effective={effective}
            >
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>
      <div className="proactivity-switcher__status" aria-live="polite">
        {loading ? "Updating proactivity…" : null}
        {!loading && guard ? <span className="chip proactivity-switcher__guard">{guard}</span> : null}
        {!loading && !guard ? (
          <span className="chip proactivity-switcher__guard">Mode: {MODE_META[effectiveMode].badge}</span>
        ) : null}
        {error ? (
          <span className="chip" role="alert" style={{ borderColor: "var(--err)", color: "var(--err)" }}>
            {error}
          </span>
        ) : null}
      </div>
      {pending ? (
        <ApprovalPanel
          mode={pending}
          meta={MODE_META[pending]}
          onApprove={handleApprove}
          onCancel={handleCancel}
          guard={guard}
        />
      ) : null}
    </div>
  );
}
