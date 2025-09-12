
import React, { useEffect, useState } from "react";
import AddOnTile from "./AddOnTile";
import type { AddOn } from "./types";

async function logIntent(id: string) {
  try {
    await fetch("/api/addons/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, at: new Date().toISOString(), intent: "open" }),
    });
  } catch (e) {}
}

export default function NaviGrid() {
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [filter, setFilter] = useState("alle");

  useEffect(() => { fetch("/api/addons").then(r=>r.json()).then(setAddons); }, []);

  const cats = ["alle", ...Array.from(new Set(addons.map(a=>a.category).filter(Boolean))) as string[]];
  const show = addons.filter(a => filter==="alle" ? true : a.category===filter);

  return (
    <div role="region" aria-label="Navi-oversikt" style={{display:"grid",gridTemplateRows:"auto 1fr",height:"100%"}}>
      <div style={{display:"flex", gap:10, padding:12}}>
        <span className="chip">Navi</span>
        <select aria-label="Kategori" value={filter} onChange={e=>setFilter(e.target.value)}
                style={{background:"transparent", color:"var(--ink)", border:"1px solid rgba(255,255,255,.14)", borderRadius:8, padding:"6px 8px"}}>
          {cats.map(c=> <option key={c} value={c} style={{color:"#000"}}>{c}</option>)}
        </select>
      </div>
      <div style={{padding:12, display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", overflow:"auto"}}>
        {show.map(a=> (
          <AddOnTile key={a.id} {...a} onOpen={async ()=>{
            await logIntent(a.id);
            if (!a.enabled && a.connectUrl) { window.open(a.connectUrl, "_blank"); return; }
            console.log("intent/open addon:", a.id);
          }} />
        ))}
      </div>
    </div>
  );
}
