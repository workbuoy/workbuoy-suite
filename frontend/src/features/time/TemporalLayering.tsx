import React, { useEffect, useMemo, useRef, useState } from "react";

type Item = { id:string; title:string; when:string; kind?: "past"|"now"|"future"; };

const demo: Item[] = [
  { id:"p1", title:"Avsluttet avtale — Kunde A", when:"2025-08-20", kind:"past" },
  { id:"p2", title:"Sendte tilbud — Kunde B", when:"2025-09-01", kind:"past" },
  { id:"n0", title:"I dag — statusmøte 14:00", when:new Date().toISOString().slice(0,10), kind:"now" },
  { id:"f1", title:"Fornyelse — Kunde C", when:"2025-09-19", kind:"future" },
  { id:"f2", title:"Kampanje kickoff", when:"2025-10-03", kind:"future" },
];

function cmp(a:Item,b:Item){ return a.when.localeCompare(b.when); }

export default function TemporalLayering(){
  const ref = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<"past"|"now"|"future">("now");

  useEffect(()=>{
    const el = ref.current; if (!el) return;
    function onWheel(e: WheelEvent){
      if (e.deltaY < -15) setLayer("past");
      else if (e.deltaY > 15) setLayer("future");
    }
    el.addEventListener("wheel", onWheel, { passive:true });
    return ()=> el.removeEventListener("wheel", onWheel as any);
  }, []);

  useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if (e.key === "PageUp" || e.key === "ArrowUp") setLayer("past");
      if (e.key === "PageDown" || e.key === "ArrowDown") setLayer("future");
      if (e.key === "Home") setLayer("now");
    }
    window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  }, []);

  const past = useMemo(()=> demo.filter(d=> d.kind==="past").sort(cmp), []);
  const future = useMemo(()=> demo.filter(d=> d.kind==="future").sort(cmp), []);
  const today = useMemo(()=> demo.filter(d=> d.kind==="now"), []);

  return (
    <div ref={ref} className="cardbg" role="region" aria-label="Temporal view"
      style={{borderRadius:12, padding:12, display:"grid", gap:10, position:"relative"}}>
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <strong>Tidsperspektiv</strong>
        <div style={{display:"flex", gap:6}}>
          <button className="chip" aria-pressed={layer==="past"} onClick={()=>setLayer("past")}>Fortid (↑)</button>
          <button className="chip" aria-pressed={layer==="now"} onClick={()=>setLayer("now")}>Nå (Home)</button>
          <button className="chip" aria-pressed={layer==="future"} onClick={()=>setLayer("future")}>Fremtid (↓)</button>
        </div>
      </header>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12}}>
        <Column title="Fortid" active={layer==="past"} items={past} />
        <Column title="Nå" active={layer==="now"} items={today} />
        <Column title="Planlagt" active={layer==="future"} items={future} />
      </div>

      <div aria-live="polite" style={{position:"absolute", bottom:8, right:12, opacity:.7}}>
        {layer==="past"?"Fortid": layer==="future"?"Planlagt":"Nå"}
      </div>
    </div>
  );
}

function Column({ title, active, items }:{ title:string; active:boolean; items:Item[] }){
  return (
    <div style={{border:"1px solid rgba(255,255,255,.12)", borderRadius:10, padding:10,
                 background: active ? "rgba(255,255,255,.03)" : "transparent",
                 outline: active ? "2px solid rgba(122,162,255,.4)" : "none"}}>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
        <strong>{title}</strong><span className="chip">{items.length}</span>
      </div>
      <div style={{display:"grid", gap:6}}>
        {items.map(it => <div key={it.id} className="row" style={{display:"grid", gridTemplateColumns:"1fr auto", gap:8}}>
          <span>{it.title}</span><span style={{opacity:.8}}>{it.when}</span>
        </div>)}
      </div>
    </div>
  );
}