import React from "react";

export const WhyDrawer: React.FC<{ explanations?: any[] }> = ({ explanations }) => {
  if (!explanations || explanations.length === 0) return null;
  const e = explanations[0];
  return (
    <aside role="complementary" aria-label="Why">
      <h4>Why?</h4>
      <p>{e.reason}</p>
      <div>Confidence: {Math.round((e.confidence || 0)*100)}%</div>
      {e.alternatives && e.alternatives.length > 0 && (
        <ul>{e.alternatives.map((a:string,i:number)=><li key={i}>{a}</li>)}</ul>
      )}
      {e.why_status === "deferred" && <em>(Rich explain scheduled)</em>}
    </aside>
  );
};
