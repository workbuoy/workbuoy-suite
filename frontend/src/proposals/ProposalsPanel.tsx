import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useActiveContext, type ActiveContext } from "@/core/ActiveContext";

type ProposalStatus = "proposed" | "approved" | "rejected" | "executed" | "failed";

type ProposalRecord = {
  id: string;
  capabilityId: string;
  createdAt: string;
  status: ProposalStatus;
  featureId?: string;
  preview?: unknown;
  payload?: Record<string, unknown>;
  summary?: string;
};

type ProposalResponse = { proposals?: ProposalRecord[] };

type ContextSelection = ActiveContext["selectedEntity"];
type ContextEntity = NonNullable<ContextSelection>;

const CONTEXT_ENTITY_TYPES = new Set<ContextEntity["type"]>([
  "contact",
  "deal",
  "invoice",
  "task",
  "note",
]);

function extractEntity(proposal: ProposalRecord): ContextSelection {
  const source = ((proposal as any)?.entity ?? proposal.payload?.entity ?? null) as
    | (Record<string, unknown> & { type?: unknown; id?: unknown })
    | null;

  if (!source || typeof source !== "object") {
    return null;
  }

  const rawType = typeof source.type === "string" ? source.type.toLowerCase() : undefined;
  if (!rawType || !CONTEXT_ENTITY_TYPES.has(rawType as ContextEntity["type"])) {
    return null;
  }

  const rawId =
    typeof source.id === "string"
      ? source.id
      : typeof source.id === "number"
        ? String(source.id)
        : typeof (source as any).entityId === "string"
          ? (source as any).entityId
          : typeof (source as any).entityId === "number"
            ? String((source as any).entityId)
            : typeof (source as any).externalId === "string"
              ? (source as any).externalId
              : typeof (source as any).externalId === "number"
                ? String((source as any).externalId)
                : undefined;

  if (!rawId) {
    return null;
  }

  const name =
    typeof (source as any).name === "string"
      ? (source as any).name
      : typeof (source as any).label === "string"
        ? (source as any).label
        : typeof (source as any).title === "string"
          ? (source as any).title
          : undefined;

  return { type: rawType as ContextEntity["type"], id: rawId, name };
}

function describeProposal(proposal: ProposalRecord): string {
  if (typeof proposal.summary === "string" && proposal.summary.trim().length > 0) {
    return proposal.summary.trim();
  }
  const capability = proposal.capabilityId.split(".").pop() ?? proposal.capabilityId;
  return capability.replace(/[-_]/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export default function ProposalsPanel() {
  const { setSelectedEntity } = useActiveContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const previousProposalsRef = useRef<ProposalRecord[]>([]);

  const activeProposal = useMemo(
    () => (activeId ? proposals.find((proposal) => proposal.id === activeId) ?? null : null),
    [proposals, activeId],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/proposals?status=proposed");
        if (!res.ok) {
          throw new Error(`Failed to load proposals (${res.status})`);
        }
        const json = (await res.json()) as ProposalResponse;
        const items = Array.isArray(json?.proposals) ? json.proposals : [];
        if (!cancelled) {
          setProposals(items);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const previous = previousProposalsRef.current;
    previousProposalsRef.current = proposals;

    if (activeProposal) {
      setSelectedEntity(extractEntity(activeProposal));
      return;
    }

    if (proposals.length === 0) {
      if (activeId !== null) {
        setActiveId(null);
      }
      setSelectedEntity(null);
      return;
    }

    let nextProposal: ProposalRecord | undefined;
    if (activeId) {
      const previousIndex = previous.findIndex((proposal) => proposal.id === activeId);
      if (previousIndex >= 0) {
        const nextIndex = Math.min(previousIndex, proposals.length - 1);
        nextProposal = proposals[nextIndex];
      }
    }

    if (!nextProposal) {
      nextProposal = proposals[0];
    }

    if (nextProposal) {
      if (nextProposal.id !== activeId) {
        setActiveId(nextProposal.id);
      }
      setSelectedEntity(extractEntity(nextProposal));
    }
  }, [proposals, activeId, activeProposal, setSelectedEntity]);

  const handleApprove = useCallback(
    async (proposal: ProposalRecord) => {
      setPendingActionId(proposal.id);
      setActionError(null);
      try {
        const res = await fetch(`/api/proposals/${proposal.id}/approve`, { method: "POST" });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to approve proposal (${res.status})`);
        }
        setProposals((current) => current.filter((item) => item.id !== proposal.id));
      } catch (err: any) {
        setActionError(err?.message || String(err));
      } finally {
        setPendingActionId((current) => (current === proposal.id ? null : current));
      }
    },
    [],
  );

  return (
    <section aria-label="Proposals awaiting approval" className="cardbg" style={{ padding: 16, borderRadius: 12 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Proposals</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--fg-muted)" }}>
            Review and approve automation proposals generated by Buoy.
          </p>
        </div>
        {loading ? <span className="chip">Loading…</span> : null}
      </header>
      {error ? (
        <div role="alert" style={{ marginBottom: 12, color: "var(--err)" }}>
          {error}
        </div>
      ) : null}
      {actionError ? (
        <div role="alert" style={{ marginBottom: 12, color: "var(--warn)" }}>
          {actionError}
        </div>
      ) : null}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
        <div style={{ display: "grid", gap: 8 }}>
          {proposals.length === 0 && !loading ? (
            <p style={{ margin: 0, color: "var(--fg-muted)" }}>No pending proposals.</p>
          ) : null}
          {proposals.map((proposal) => {
            const selected = proposal.id === activeId;
            const entity = extractEntity(proposal);
            return (
              <div
                key={proposal.id}
                data-testid={`proposal-row-${proposal.id}`}
                data-active={selected ? "true" : "false"}
                className={selected ? "proposal-row proposal-row--active" : "proposal-row"}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  gap: 8,
                  padding: 12,
                  borderRadius: 10,
                  border: selected ? "1px solid var(--fg-subtle)" : "1px solid rgba(255,255,255,.08)",
                  background: selected ? "rgba(255,255,255,.06)" : "rgba(12,16,24,.4)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveId(proposal.id)}
                  className="chip"
                  aria-current={selected ? "true" : undefined}
                  style={{ justifySelf: "start" }}
                >
                  {entity?.name ?? describeProposal(proposal)}
                </button>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => handleApprove(proposal)}
                    disabled={pendingActionId === proposal.id}
                  >
                    {pendingActionId === proposal.id ? "Approving…" : "Approve"}
                  </button>
                </div>
                <div style={{ gridColumn: "1 / span 2", fontSize: 12, color: "var(--fg-muted)" }}>
                  <div>{proposal.capabilityId}</div>
                  <div>Requested {formatTimestamp(proposal.createdAt)}</div>
                  {entity ? <div>Target: {entity.type} · {entity.id}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
        <aside className="proposal-preview" style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,.08)" }}>
          <h3 style={{ marginTop: 0, fontSize: 16 }}>Preview</h3>
          {activeProposal ? (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 14 }}>{describeProposal(activeProposal)}</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                Capability: {activeProposal.capabilityId}
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  borderRadius: 8,
                  background: "rgba(5,7,10,.8)",
                  maxHeight: 220,
                  overflow: "auto",
                  fontSize: 12,
                }}
              >
                {JSON.stringify(activeProposal.preview ?? activeProposal.payload ?? {}, null, 2)}
              </pre>
            </div>
          ) : (
            <p style={{ margin: 0, color: "var(--fg-muted)" }}>Select a proposal to inspect its preview.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
