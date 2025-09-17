import React, { useEffect, useMemo, useState } from "react";
import BuoyChat from "../features/buoy/BuoyChat";
import NaviGrid from "../features/navi/NaviGrid";
import { IntrospectionBadge } from "./IntrospectionBadge";
type Mode = "CHAT" | "NAVI";
export default function FlipCard() {
  const [mode, setMode] = useState<Mode>("CHAT");
  const flipped = mode === "NAVI";
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setMode(m => m==="CHAT" ? "NAVI" : "CHAT"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const ariaFront = useMemo(()=>({ "aria-hidden": flipped, "aria-label": "Buoy chat" }), [flipped]);
  const ariaBack  = useMemo(()=>({ "aria-hidden": !flipped, "aria-label": "Navi oversikt" }), [flipped]);
  return (
    <div className="perspective" style={{position:"relative", height:"min(82vh, 760px)"}}>
      <div className="flipcard cardbg" style={{position:"absolute", inset:0, borderRadius:16, transform: `rotateY(${flipped?180:0}deg)`}}>
        <section {...ariaFront} className="flipface" style={{padding:12}}>
          <Header side="Buoy" onFlip={()=>setMode("NAVI")} />
          <div style={{position:"absolute", inset:"56px 12px 12px 12px"}}><BuoyChat/></div>
        </section>
        <section {...ariaBack} className="flipface" style={{transform:"rotateY(180deg)", padding:12}}>
          <Header side="Navi" onFlip={()=>setMode("CHAT")} />
          <div style={{position:"absolute", inset:"56px 12px 12px 12px"}}><NaviGrid/></div>
        </section>
      </div>
    </div>
  );
}
function Header({side, onFlip}:{side:"Buoy"|"Navi"; onFlip:()=>void}) {
  return (
    <div style={{display:"flex", alignItems:"center", gap:10}}>
      <strong style={{letterSpacing:.3, opacity:.9}}>{side}</strong>
      <span style={{flex:1}}/>
      <IntrospectionBadge/>
      <HealthBadge/>
      <button onClick={onFlip} aria-label={side==="Buoy"?"Gå til Navi":"Gå til Buoy"} className="chip" style={{background:"transparent"}}>Flip</button>
    </div>
  );
}
function HealthBadge() {
  const [state, setState] = useState<"ok"|"wait"|"err">("wait");
  useEffect(() => {
    fetch("/api/health").then(r=>r.ok?r.json():Promise.reject()).then(()=>setState("ok")).catch(()=>setState("err"));
  }, []);
  const color = state==="ok"?"var(--ok)": state==="wait"?"var(--warn)":"var(--err)";
  const label = state==="ok"?"Backend OK": state==="wait"?"Sjekker…":"Feil";
  return <span className="chip" style={{borderColor:color, color}}>{label}</span>;
}