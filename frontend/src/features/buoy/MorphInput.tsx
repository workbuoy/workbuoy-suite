import React, { useEffect, useMemo, useRef, useState } from "react";
import { parseCommand, type ParsedIntent } from "./commandParser";

type Props = {
  onSubmit: (value: string, intent?: ParsedIntent) => void;
};

type Contact = { id:string; name:string; email?:string };

function useContactsSuggest(term: string){
  const [items, setItems] = useState<Contact[]>([]);
  useEffect(()=>{
    let active = true;
    if (!term || term.length < 2) { setItems([]); return; }
    fetch("/api/crm/contacts").then(r=>r.json()).then((all: Contact[])=>{
      if (!active) return;
      const t = term.toLowerCase();
      setItems(all.filter(c => c.name.toLowerCase().includes(t) || (c.email||"").toLowerCase().includes(t)).slice(0,5));
    }).catch(()=> setItems([]));
    return ()=>{ active=false };
  }, [term]);
  return items;
}

function evalCalc(expr: string): string | null {
  try{
    // very naive — allow numbers, operators, parentheses, dot/comma
    if (!/^[=]?[-+*/().,0-9\s]+$/.test(expr)) return null;
    const safe = expr.replace(/^=/, "").replace(/,/g, ".");
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${safe})`)();
    if (typeof val === "number" && isFinite(val)) return String(val);
    return null;
  }catch{ return null; }
}

export default function MorphInput({ onSubmit }: Props){
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  const isCalc = useMemo(()=> /^=|^[\d\s.+\-/*()]+$/.test(value.trim()) && evalCalc(value) !== null, [value]);
  const contactTerm = useMemo(()=> value.startsWith("@") ? value.slice(1) : "", [value]);
  const contacts = useContactsSuggest(contactTerm);
  const dateHint = useMemo(()=>{
    const v = value.trim().toLowerCase();
    if (/(mon|tue|wed|thu|fri|sat|sun|man|tir|ons|tor|fre|lør|søn)/.test(v) || /\b\d{1,2}[:.]\d{2}\b/.test(v)) {
      return "Dato/klokkeslett oppdaget – vi foreslår kalender i neste PR";
    }
    return null;
  }, [value]);

  const intent = useMemo(()=> parseCommand(value), [value]);
  const calcResult = useMemo(()=> isCalc ? evalCalc(value) : null, [isCalc, value]);

  function submit(e: React.FormEvent){
    e.preventDefault();
    onSubmit(value.trim(), intent);
    setValue("");
  }

  return (
    <div>
      <form onSubmit={submit} style={{display:"grid", gridTemplateColumns:"1fr auto", gap:8}}>
        <input
          value={value}
          onChange={e=>setValue(e.target.value)}
          onFocus={()=>setFocused(true)}
          onBlur={()=>setTimeout(()=>setFocused(false), 150)}
          placeholder="Skriv en handling… (@navn, =kalkyle, ‘show me tasks from last week’)"
          aria-label="Skriv kommando eller melding"
          style={{padding:"10px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,.14)", background:"transparent", color:"var(--ink)"}}
        />
        <button className="chip">Send</button>
      </form>

      {/* Command pill */}
      {value && intent?.kind !== "unknown" && (
        <div className="chip" title="Gjenkjent kommando" style={{marginTop:6}}>
          Intent: {intent.kind.replace(".", " → ")}
        </div>
      )}

      {/* Calculator */}
      {focused && calcResult && (
        <div className="chip" style={{marginTop:6}} aria-live="polite">= {calcResult}</div>
      )}

      {/* Contacts */}
      {focused && contactTerm && contacts.length>0 && (
        <div role="listbox" aria-label="Forslag: kontakter"
             className="cardbg" style={{marginTop:6, borderRadius:10, padding:6, display:"grid", gap:6}}>
          {contacts.map(c=> (
            <button key={c.id} className="chip" onMouseDown={(e)=>{ e.preventDefault(); setValue(`@${c.name}`); }}>
              {c.name} {c.email ? `• ${c.email}` : ""}
            </button>
          ))}
        </div>
      )}

      {/* Date hint */}
      {focused && dateHint && (
        <div className="chip" style={{marginTop:6}}>{dateHint}</div>
      )}
    </div>
  );
}