import React, { useEffect, useMemo, useState } from "react";
import ContactForm from "./ContactForm";
import ActionBar from "../buoy/ActionBar";
import type { ActionProposal } from "../buoy/types";
type Contact = { id:string; name:string; email?:string; phone?:string; crmId?:string; system:"hubspot"|"salesforce"|"superoffice"|"dynamics" };
export default function ContactsPanel({ onClose }:{ onClose:()=>void }) {
  const [all, setAll] = useState<Contact[]>([]);
  const [q, setQ] = useState("");
  useEffect(()=>{ refresh(); },[]);
  function refresh(){
    fetch("/api/crm/contacts").then(r=>r.json()).then(setAll).catch(()=>setAll([]));
  }
  async function createContact(c:{name:string;email?:string;phone?:string}){
    await fetch("/api/crm/contacts", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(c) });
    refresh();
  }
  const list = useMemo(()=>{
    const term=q.trim().toLowerCase();
    if(!term) return all;
    return all.filter(c => [c.name, c.email, c.phone].filter(Boolean).some(v => String(v).toLowerCase().includes(term)));
  },[q,all]);
  return (
    <div role="region" aria-label="Kontakter" style={{display:"grid", gridTemplateRows:"auto auto 1fr", gap:12, height:"100%"}}>
      <div style={{display:"flex", alignItems:"center", gap:8}}>
        <strong>Kontakter</strong>
        <span style={{flex:1}}/>
        <button className="chip" onClick={onClose}>Lukk</button>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
        <div>
          <input placeholder="Søk…" value={q} onChange={e=>setQ(e.target.value)}
                 style={{width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,.14)", background:"transparent", color:"var(--ink)"}} />
          <div style={{marginTop:12, display:"grid", gap:8, maxHeight:300, overflow:"auto"}}>
            {list.map(c=> <ContactRow key={c.id} c={c} />)}
            {!list.length && <div className="chip">Ingen treff</div>}
          </div>
        </div>
        <div>
          <div className="chip" style={{marginBottom:8}}>Legg til ny</div>
          <ContactForm onSubmit={createContact}/>
        </div>
      </div>
    </div>
  );
}
function ContactRow({ c }:{ c:Contact }){
  const proposal: ActionProposal = {
    id: crypto.randomUUID(),
    target: c.system,
    entity: "contact",
    operation: "email",
    entityId: c.crmId || c.id,
    payload: { template: "follow-up", to: c.email || "", name: c.name },
    preview: { after: { subject: "Oppfølging", to: c.email, body: `Hei ${c.name}, ...` }},
    provenance: ["Kilde: CRM", "Mønster: mangler oppfølging 14 dager"],
    idempotencyKey: crypto.randomUUID()
  };
  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr auto", gap:8, alignItems:"center", border:"1px solid rgba(255,255,255,.08)", borderRadius:10, padding:10}}>
      <div>
        <div style={{fontWeight:600}}>{c.name}</div>
        <div style={{opacity:.7, fontSize:12}}>{c.email || "—"} • {c.phone || "—"}</div>
      </div>
      <div style={{display:"grid", gap:8}}>
        <button className="chip" onClick={()=>alert(`(stub) Åpne i Buoy: send purring til ${c.name}`)}>Åpne i Buoy</button>
        <ActionBar proposal={proposal}/>
      </div>
    </div>
  );
}