import React from "react";

type WhyDrawerProps = {
  explanations?: Array<{
    reason?: string;
    confidence?: number;
    alternatives?: string[];
    why_status?: string;
  }>;
};

export const WhyDrawer: React.FC<WhyDrawerProps> = ({ explanations }) => {
  if (!explanations || explanations.length === 0) return null;
  const [explanation] = explanations;
  if (!explanation) return null;
  const titleId = React.useId();
  const descriptionId = React.useId();
  const listId = React.useId();

  const confidence =
    typeof explanation.confidence === "number" ? Math.round(explanation.confidence * 100) : null;

  return (
    <aside
      role="complementary"
      aria-labelledby={titleId}
      aria-describedby={confidence !== null ? descriptionId : undefined}
      className="cardbg"
      style={{ padding: "var(--space-md)", borderRadius: "var(--radius-lg)", display: "grid", gap: "var(--space-sm)" }}
    >
      <h4 id={titleId} style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
        Why?
      </h4>
      {explanation.reason && <p style={{ margin: 0 }}>{explanation.reason}</p>}
      {confidence !== null && (
        <div id={descriptionId}>
          Confidence: {confidence}%
        </div>
      )}
      {explanation.alternatives && explanation.alternatives.length > 0 && (
        <ul id={listId} style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--fg-muted)" }}>
          {explanation.alternatives.map((alternative, index) => (
            <li key={index}>{alternative}</li>
          ))}
        </ul>
      )}
      {explanation.why_status === "deferred" && (
        <em aria-live="polite">(Rich explain scheduled)</em>
      )}
    </aside>
  );
};
