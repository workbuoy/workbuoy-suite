import React, { useState } from "react";
type ContactInput = { name: string; email?: string; phone?: string };
export default function ContactForm({ onSubmit }:{ onSubmit:(c:ContactInput)=>Promise<void>|void }) {
  const [form, setForm] = useState<ContactInput>({ name:"" });
  const [busy, setBusy] = useState(false);
  async function handleSubmit(e:React.FormEvent){
    e.preventDefault();
    if(!form.name.trim()) return;
    setBusy(true);
    try { await onSubmit(form); setForm({ name:"" }); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={handleSubmit} style={{display:"grid", gap:"var(--space-sm)"}}>
      <input placeholder="Navn" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}
             style={{padding:"10px 12px", borderRadius:"var(--radius-md)", border:"1px solid var(--stroke-subtle)", background:"transparent", color:"var(--fg-default)"}} />
      <input placeholder="E-post (valgfritt)" value={form.email||""} onChange={e=>setForm({...form, email:e.target.value})}
             style={{padding:"10px 12px", borderRadius:"var(--radius-md)", border:"1px solid var(--stroke-subtle)", background:"transparent", color:"var(--fg-default)"}} />
      <input placeholder="Telefon (valgfritt)" value={form.phone||""} onChange={e=>setForm({...form, phone:e.target.value})}
             style={{padding:"10px 12px", borderRadius:"var(--radius-md)", border:"1px solid var(--stroke-subtle)", background:"transparent", color:"var(--fg-default)"}} />
      <button className="chip" disabled={busy} style={{justifySelf:"start"}}>{busy?"Lagrer…":"Legg til kontakt"}</button>
    </form>
  );
}