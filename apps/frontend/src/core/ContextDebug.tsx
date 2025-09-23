import React, { useState } from "react";
import { useActiveContext } from "./ActiveContext";
export default function ContextDebug(){
  const { timeOfDay, selectedEntity, recentIntents } = useActiveContext();
  const [open, setOpen] = useState(false);
  return (
    <div style={{position:"absolute", bottom:12, right:12, zIndex:20}}>
      <button className="chip" onClick={()=>setOpen(o=>!o)} aria-expanded={open}>Context</button>
      {open && (
        <div className="cardbg" role="region" aria-label="Active context" style={{marginTop:8, padding:10, borderRadius:10, minWidth:260}}>
          <div style={{opacity:.9, marginBottom:6}}>timeOfDay: <strong>{timeOfDay}</strong></div>
          <div style={{opacity:.9, marginBottom:6}}>selected: {selectedEntity?.type ?? "—"}{selectedEntity?.id ? `#${selectedEntity.id}` : ""}{selectedEntity?.name ? ` (${selectedEntity.name})` : ""}</div>
          <div style={{opacity:.9}}>recentIntents:</div>
          <ul style={{margin:"6px 0 0 16px", padding:0}}>{recentIntents.slice().reverse().map((x,i)=>(<li key={i}>{x}</li>))}</ul>
        </div>
      )}
    </div>
  );
}