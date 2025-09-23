import React, { useEffect, useMemo, useState } from "react";
import BuoyChat from "@/features/buoy/BuoyChat";
import { useActiveContext } from "@/core/ActiveContext";
import { useCurrentRole } from "@/roles/useCurrentRole";
import { resolveRolePresentation } from "@/roles/rolePresentation";

export type BuoyPanelProps = {
  onQuickConnect?: (link: { type: string; id: string; label?: string }) => void;
};

export default function BuoyPanel({ onQuickConnect }: BuoyPanelProps) {
  const role = useCurrentRole();
  const presentation = useMemo(() => resolveRolePresentation(role.roleId), [role.roleId]);
  const { selectedEntity, setSelectedEntity } = useActiveContext();
  const [selectionKey, setSelectionKey] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEntity) {
      setSelectionKey(`${selectedEntity.type}:${selectedEntity.id}`.toLowerCase());
      return;
    }
    const first = presentation.suggestedEntities[0];
    if (first) {
      setSelectionKey(`${first.type}:${first.id}`.toLowerCase());
      setSelectedEntity({ type: first.type, id: first.id, name: first.label });
    }
  }, [presentation, selectedEntity, setSelectedEntity]);

  const handleSuggestionChange = (key: string) => {
    setSelectionKey(key);
    const match = presentation.suggestedEntities.find(
      (item) => `${item.type}:${item.id}`.toLowerCase() === key,
    );
    if (match) {
      setSelectedEntity({ type: match.type, id: match.id, name: match.label });
    }
  };

  const handleQuickConnect = () => {
    if (!onQuickConnect || !selectionKey) return;
    const match = presentation.suggestedEntities.find(
      (item) => `${item.type}:${item.id}`.toLowerCase() === selectionKey,
    );
    if (match) {
      onQuickConnect({ type: match.type, id: match.id, label: match.label });
    } else if (selectedEntity) {
      onQuickConnect({ type: selectedEntity.type, id: selectedEntity.id, label: selectedEntity.name });
    }
  };

  return (
    <div className="buoy-panel" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <header style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 18, letterSpacing: 0.4 }}>Buoy</h2>
          <span className="chip" aria-label="Role tone">{presentation.tone}</span>
        </div>
        <p style={{ margin: "6px 0", color: "var(--fg-muted)" }}>{presentation.tagline}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {presentation.policyChips.map((chip) => (
            <span key={chip} className="chip" style={{ background: "rgba(255,255,255,.08)" }}>
              {chip}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Anchor Buoy AI to this record
            <select
              value={selectionKey ?? ""}
              onChange={(event) => handleSuggestionChange(event.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--stroke-subtle)",
                background: "rgba(12,16,24,.6)",
                color: "var(--fg-default)",
              }}
            >
              {presentation.suggestedEntities.map((item) => {
                const key = `${item.type}:${item.id}`.toLowerCase();
                return (
                  <option key={key} value={key} style={{ color: "#05070a" }}>
                    {item.label}
                  </option>
                );
              })}
            </select>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {presentation.priorityHints.map((hint) => (
              <span key={hint} className="chip" style={{ borderColor: "rgba(255,255,255,.22)" }}>
                {hint}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="chip" onClick={handleQuickConnect}>
              Connect this view to Navi
            </button>
          </div>
        </div>
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>
        <BuoyChat />
      </div>
    </div>
  );
}
