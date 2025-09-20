import React, { useState, useRef, useEffect } from "react";
import { useBuoy } from "./useBuoy";
import { WhyDrawer } from "@/components/WhyDrawer";
import type { UserMessage, AssistantMessage } from "./types";
import MorphingInput from "@/components/MorphingInput";
import { buoyStrings as strings } from "./strings";
export default function BuoyChat() {
  const { messages, send } = useBuoy();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);
  function handleSend(e:React.FormEvent){
    e.preventDefault(); if (!input.trim()) return; send(input.trim()); setInput("");
  }
  return (
    <div role="region" aria-label={strings.regionLabel} aria-live="polite" style={{display:"grid", gridTemplateRows:"1fr auto", height:"100%"}}>
      <div style={{overflow:"auto", padding:16}}>
        {messages.map(m => <ChatMessage key={m.id} msg={m} />)}
        <div ref={endRef}/>
      </div>
      <form onSubmit={handleSend} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,padding:8}}>
        <MorphingInput
          value={input}
          onChange={setInput}
          placeholder={strings.inputPlaceholder}
          id="buoy-input"
          ariaLabel="buoy-input"
          hideLabel
          strings={{
            label: "buoy-input",
            contactPickerHeading: strings.contactPickerHeading,
            calculatorHeading: strings.calculatorHeading,
          }}
        />
        <button className="chip">{strings.send}</button>
      </form>
    </div>
  );
}
function ChatMessage({ msg }:{ msg: UserMessage|AssistantMessage }){
  if (msg.role==="user") {
    return <div style={{margin:"4px 0"}}><span className="chip" style={{marginRight:8}}>{strings.userLabel}</span>{msg.text}</div>;
  }
  const a = msg as AssistantMessage;
  return (
    <div style={{margin:"10px 0", padding:10, border:"1px solid rgba(255,255,255,.1)", borderRadius:10}}>
      <div style={{marginBottom:6}}><span className="chip" style={{marginRight:8}}>{strings.assistantLabel}</span>{a.text}</div>
      {a.actions?.length ? (
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          {a.actions.map(act=><button key={act.id} className="chip">{act.label}</button>)}
        </div>
      ) : null}
      <WhyDrawer explanations={a.why?.map((reason) => ({ reason }))} />
    </div>
  );
}