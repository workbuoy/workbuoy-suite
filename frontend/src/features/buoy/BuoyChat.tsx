import React, { useRef, useState } from "react";
import { MiniBar, Sparkline } from "../../lib/ui/MicroViz";
import { useBuoyStub } from "./useBuoyStub";
export default function BuoyChat() {
  const { messages, send } = useBuoyStub();
  const [val, setVal] = useState(""); const endRef = useRef<HTMLDivElement>(null);
  const onSubmit = (e:React.FormEvent) => { e.preventDefault(); if(!val.trim()) return; send(val.trim()); setVal(""); setTimeout(()=>endRef.current?.scrollIntoView({behavior:"smooth"}), 0); };
  return (
    <div role="region" aria-label="Buoy chat" aria-live="polite" style={{display:"grid",gridTemplateRows:"1fr auto",height:"100%"}}>
      <div style={{overflow:"auto", padding:16}}>
        {messages.map(m => (
          <div key={m.id} style={{margin:"8px 0", maxWidth:560}}>
            <div className="chip" style={{marginBottom:6}}>{(m as any).role==="assistant"?"Buoy":"Du"}</div>
            {"viz" in (m as any) && (m as any).viz ? (
              <>
                <p style={{margin:"4px 0 8px"}}>{(m as any).text}</p>
                {(m as any).viz.type==="spark" ? <Sparkline data={(m as any).viz.values}/> : <MiniBar data={(m as any).viz.values}/>}
                {(m as any).why?.length ? <WhyDrawer reasons={(m as any).why}/> : null}
              </>
            ) : <p style={{margin:"4px 0 8px"}}>{(m as any).text}</p>}
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      <form onSubmit={onSubmit} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,padding:12}}>
        <label htmlFor="chat" className="sr-only">Skriv melding</label>
        <input id="chat" value={val} onChange={e=>setVal(e.target.value)}
               placeholder="Skriv en handling, f.eks. “vis oppgaver fra forrige uke”…"
               style={{padding:"12px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,.12)", background:"transparent", color:"var(--ink)"}}/>
        <button type="submit" style={{padding:"10px 14px",borderRadius:10, background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.14)"}}>
          Send
        </button>
      </form>
    </div>
  );
}
function WhyDrawer({reasons}:{reasons:string[]}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={()=>setOpen(o=>!o)} aria-expanded={open} aria-controls="why"
              className="chip" style={{marginTop:8, background:"transparent"}}>Vis hvorfor</button>
      {open && (
        <div id="why" role="region" aria-label="Forklaring" style={{marginTop:8, padding:12, border:"1px dashed rgba(255,255,255,.15)", borderRadius:10}}>
          <ul style={{margin:0, paddingLeft:18}}>{reasons.map((r,i)=><li key={i}>{r}</li>)}</ul>
        </div>
      )}
    </div>
  );
}