import React, { useMemo } from "react";
import NaviGrid from "@/features/navi/NaviGrid";
import { useActiveContext } from "@/core/ActiveContext";
import { useCurrentRole } from "@/roles/useCurrentRole";
import { resolveRolePresentation } from "@/roles/rolePresentation";
import type { Connection } from "./useConnections";

export type NaviPanelProps = {
  connections: Connection[];
  highlight?: string | null;
  onRemove: (key: string) => void;
  onSelect: (key: string) => void;
};

export default function NaviPanel({ connections, highlight, onRemove, onSelect }: NaviPanelProps) {
  const role = useCurrentRole();
  const presentation = useMemo(() => resolveRolePresentation(role.roleId), [role.roleId]);
  const { setSelectedEntity } = useActiveContext();

  const ordered = useMemo(() => {
    const order = presentation.navigationOrder;
    return [...connections].sort((a, b) => {
      const rankA = order.indexOf(a.type);
      const rankB = order.indexOf(b.type);
      if (rankA === rankB) {
        return a.createdAt < b.createdAt ? 1 : -1;
      }
      return (rankA === -1 ? order.length : rankA) - (rankB === -1 ? order.length : rankB);
    });
  }, [connections, presentation.navigationOrder]);

  const handleSelect = (connection: Connection) => {
    onSelect(connection.key);
    if (["contact", "deal", "invoice", "task", "note"].includes(connection.type)) {
      setSelectedEntity({
        type: connection.type as any,
        id: connection.id,
        name: connection.label,
      });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <header style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 18, letterSpacing: 0.4 }}>Navi</h2>
          <span className="chip">Role: {presentation.title}</span>
        </div>
        <p style={{ margin: "6px 0", color: "var(--muted)" }}>Context is prioritised based on {presentation.title} workflows.</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {presentation.priorityHints.map((hint) => (
            <span key={hint} className="chip" style={{ borderColor: "rgba(255,255,255,.22)" }}>
              {hint}
            </span>
          ))}
        </div>
      </header>
      <section aria-label="Connections" style={{ marginBottom: 12 }}>
        {ordered.length === 0 ? (
          <div style={{ padding: 12, border: "1px solid rgba(255,255,255,.12)", borderRadius: 12 }}>
            <strong>No connections yet.</strong>
            <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
              Use the connect button on the card or Buoy panel to link entities. Navi will pin them here.
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
            {ordered.map((item) => (
              <li key={item.key}>
                <div
                  className="cardbg"
                  style={{
                    borderRadius: 12,
                    padding: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    border: highlight === item.key ? "1px solid var(--ring)" : "1px solid rgba(255,255,255,.08)",
                    background: highlight === item.key ? "rgba(122,162,255,.12)" : undefined,
                  }}
                >
                  <button
                    type="button"
                    className="chip"
                    onClick={() => handleSelect(item)}
                    style={{ background: "transparent" }}
                  >
                    {formatType(item.type)}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>#{item.id}</div>
                  </div>
                  <button type="button" className="chip" onClick={() => onRemove(item.key)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div style={{ flex: 1, minHeight: 0 }}>
        <NaviGrid />
      </div>
    </div>
  );
}

function formatType(type: string) {
  switch (type) {
    case "deal":
      return "Deal";
    case "contact":
      return "Contact";
    case "invoice":
      return "Invoice";
    case "task":
      return "Task";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
