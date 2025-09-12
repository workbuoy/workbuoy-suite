import React from "react";
type Props = { id:string; name:string; icon:string; enabled:boolean; onOpen:()=>void };
export default function AddOnTile({ name, icon, enabled, onOpen }: Props) {
  return (
    <button onClick={onOpen} aria-label={`${name}${enabled?"":" (ikke koblet)"}`}
      style={{
        width:"100%", textAlign:"left", background:"rgba(255,255,255,.03)",
        border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:14,
        display:"grid", gridTemplateColumns:"32px 1fr", gap:10, color:"inherit", opacity:enabled?1:.5
      }}>
      <span style={{fontSize:20}}>{icon}</span>
      <div>
        <div style={{fontWeight:600}}>{name}</div>
        <div className="chip" style={{display:"inline-block", marginTop:6}}>{enabled ? "Koblet" : "Koble til"}</div>
      </div>
    </button>
  );
}