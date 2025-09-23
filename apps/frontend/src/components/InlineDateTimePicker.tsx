import React, { useState } from "react";
export type DateTimeValue = { date: string; time?: string };
function pad(n:number){ return n<10 ? `0${n}` : `${n}`; }
function toISODate(d: Date){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
export default function InlineDateTimePicker({ initial, onPick, onCancel }:{ initial?: DateTimeValue; onPick:(v:DateTimeValue)=>void; onCancel?:()=>void }){
  const now = new Date();
  const [date, setDate] = useState<string>(initial?.date || toISODate(now));
  const [time, setTime] = useState<string>(initial?.time || "");
  return (
    <div className="cardbg" role="dialog" aria-label="Velg dato og tid" style={{borderRadius:"var(--radius-lg)", padding:"var(--space-md)", display:"grid", gap:"var(--space-sm)", maxWidth:360}}>
      <label style={{display:"grid", gap:"var(--space-xs)"}}>
        <span style={{opacity:.9}}>Dato</span>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)}
               style={{padding:"var(--space-xs) var(--space-sm)", borderRadius:"var(--radius-md)", border:"1px solid var(--stroke-subtle)", background:"transparent", color:"var(--fg-default)"}}/>
      </label>
      <label style={{display:"grid", gap:"var(--space-xs)"}}>
        <span style={{opacity:.9}}>Tid (valgfritt)</span>
        <input type="time" value={time} onChange={e=>setTime(e.target.value)}
               style={{padding:"var(--space-xs) var(--space-sm)", borderRadius:"var(--radius-md)", border:"1px solid var(--stroke-subtle)", background:"transparent", color:"var(--fg-default)"}}/>
      </label>
      <div style={{display:"flex", gap:"var(--space-sm)", justifyContent:"flex-end"}}>
        {onCancel && <button className="chip" onClick={onCancel}>Avbryt</button>}
        <button className="chip" onClick={()=>onPick({ date, time: time||undefined })}>OK</button>
      </div>
    </div>
  );
}