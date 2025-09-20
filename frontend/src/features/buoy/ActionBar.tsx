import React, { useState } from "react";
import type { ActionProposal, ActionResult } from "./types";
export default function ActionBar({ proposal }: { proposal: ActionProposal }) {
  const [state, setState] = useState<"idle"|"preview"|"committing"|"done"|"error">("idle");
  const [result, setResult] = useState<ActionResult|undefined>();
  function preview(){ setState("preview"); }
  async function commit(){
    setState("committing");
    try{
      const res: ActionResult = await fetch("/core/actions/commit", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "X-Idempotency-Key": proposal.idempotencyKey },
        body: JSON.stringify({ proposal, dryRun:false })
      }).then(r=>r.json());
      setResult(res); setState(res.ok?"done":"error");
    }catch{ setState("error"); }
  }
  return (
    <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:8}}>
      <button className="chip" onClick={preview} aria-pressed={state==="preview"}>Forhåndsvis</button>
      <button className="chip" onClick={commit} aria-busy={state==="committing"}>Utfør</button>
      {state==="done" && result?.link && <a className="chip" href={result.link} target="_blank" rel="noreferrer">Vis i CRM</a>}
      {state==="error" && <span className="chip" style={{borderColor:"var(--err)", color:"var(--err)"}}>Feil – prøv igjen</span>}
      {state === "preview" && proposal.preview !== undefined && (
        <div
          role="region"
          aria-label="Forhåndsvis endringer"
          style={{ border: "1px dashed rgba(255,255,255,.15)", borderRadius: 10, padding: 10 }}
        >
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {typeof proposal.preview === "string"
              ? proposal.preview
              : JSON.stringify(proposal.preview, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}