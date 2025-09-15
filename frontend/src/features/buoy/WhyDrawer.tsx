import React, { useState } from "react";
export default function WhyDrawer({ reasons }:{ reasons:string[] }) {
  const [open, setOpen] = useState(false);
  if (!reasons?.length) return null;
  return (
    <div style={{marginTop:8}}>
      <button onClick={()=>setOpen(o=>!o)} className="chip" aria-expanded={open} aria-controls="why-list">
        Vis hvorfor
      </button>
      {open && (
        <div id="why-list" role="region" aria-label="Forklaringer"
             style={{marginTop:8, padding:12, border:"1px dashed rgba(255,255,255,.2)", borderRadius:8}}>
          <ul style={{margin:0, paddingLeft:18}}>{reasons.map((r,i)=><li key={i}>{r}</li>)}</ul>
        </div>
      )}
    </div>
  );
}