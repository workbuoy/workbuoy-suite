import React, { useState } from "react";
import Sparkline from "./viz/Sparkline";
import MiniBar from "./viz/MiniBar";
import MiniDonut from "./viz/MiniDonut";
import type { AssistantMessage, UserMessage } from "./types";

type Props = { msg: AssistantMessage | UserMessage };
export default function ChatMessage({ msg }: Props) {
  const isAssistant = (msg as any).role === "assistant";
  return (
    <div style={{margin:"8px 0", maxWidth:560}}>
      <div className="chip" style={{marginBottom:6}}>{isAssistant ? "Buoy" : "Du"}</div>
      {"viz" in (msg as any) && (msg as any).viz ? <AssistantWithViz msg={msg as AssistantMessage}/> : <p style={{margin:"4px 0 8px"}}>{(msg as any).text}</p>}
    </div>
  );
}

function AssistantWithViz({ msg }: { msg: AssistantMessage }) {
  const [open, setOpen] = useState(false);
  const v = msg.viz!;
  return (
    <>
      <p style={{margin:"4px 0 8px"}}>{msg.text}</p>
      {v.type === "spark" && <Sparkline data={v.values}/>}
      {v.type === "bar"   && <MiniBar data={v.values}/>}
      {v.type === "donut" && <MiniDonut data={v.values}/>}
      {msg.actions?.length ? (
        <div style={{display:"flex", gap:8, marginTop:8}}>
          {msg.actions.map(a => <button key={a.id} className="chip" style={{background:"transparent"}} onClick={()=>alert(`(stub) ${a.label}`)}>{a.label}</button>)}
        </div>
      ) : null}
      {msg.why?.length ? (
        <div>
          <button onClick={()=>setOpen(o=>!o)} aria-expanded={open} aria-controls={`why-${msg.id}`}
                  className="chip" style={{marginTop:8, background:"transparent"}}>Vis hvorfor</button>
          {open && (
            <div id={`why-${msg.id}`} role="region" aria-label="Forklaring" style={{marginTop:8, padding:12, border:"1px dashed rgba(255,255,255,.15)", borderRadius:10}}>
              <ul style={{margin:0, paddingLeft:18}}>{msg.why!.map((r,i)=><li key={i}>{r}</li>)}</ul>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}