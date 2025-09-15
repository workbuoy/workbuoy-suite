import React, { useMemo, useState } from "react";
type Task = { id:string; title:string; due?:string; project?:string; status?:"todo"|"doing"|"done" };
const demo: Task[] = [
  { id:"t1", title:"Ring kunde A", due:"2025-09-18", project:"Q3 pipeline", status:"todo" },
  { id:"t2", title:"Send tilbud B", due:"2025-09-19", project:"Q3 pipeline", status:"doing" },
  { id:"t3", title:"Forbered statusmøte", due:"2025-09-22", project:"Account X", status:"todo" },
  { id:"t4", title:"Oppfølging faktura", due:"2025-09-23", project:"Billing", status:"todo" },
];
export default function SemanticZoom(){
  const [level, setLevel] = useState<0|1|2>(0);
  const byProject = useMemo(()=> {
    const m: Record<string, Task[]> = {};
    demo.forEach(t => { const k = t.project || "Uten prosjekt"; (m[k]||(m[k]=[])).push(t); });
    return m;
  }, []);
  return (
    <div className="cardbg" style={{borderRadius:12, padding:12, display:"grid", gap:10}}>
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <strong>Semantic Zoom</strong>
        <div style={{display:"flex", gap:6}}>
          <button className="chip" aria-pressed={level===0} onClick={()=>setLevel(0)}>Liste</button>
          <button className="chip" aria-pressed={level===1} onClick={()=>setLevel(1)}>Tidslinje</button>
          <button className="chip" aria-pressed={level===2} onClick={()=>setLevel(2)}>Strategi</button>
        </div>
      </header>
      {level===0 && <TaskList tasks={demo}/>}
      {level===1 && <WeekTimeline tasks={demo}/>}
      {level===2 && <StrategyOverview groups={byProject}/>}
    </div>
  );
}
function TaskList({ tasks }:{ tasks: Task[] }){
  return (
    <div style={{display:"grid", gap:8}}>
      {tasks.map(t => (
        <div key={t.id} className="row" style={{display:"grid", gridTemplateColumns:"1fr auto auto", alignItems:"center", gap:8}}>
          <div><div style={{fontWeight:600}}>{t.title}</div><div style={{opacity:.8, fontSize:12}}>{t.project||"—"}</div></div>
          <div style={{opacity:.8}}>{t.due||"—"}</div><span className="chip">{t.status||"todo"}</span>
        </div>
      ))}
    </div>
  );
}
function WeekTimeline({ tasks }:{ tasks: Task[] }){
  const days = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"];
  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:6}}>
      {days.map((d,i)=>(
        <div key={i} style={{padding:8, border:"1px solid rgba(255,255,255,.1)", borderRadius:8}}>
          <div style={{opacity:.8, marginBottom:6}}>{d}</div>
          {tasks.filter(t => new Date(t.due||"").getDay()===((i+1)%7)).map(t => (
            <div key={t.id} className="chip" style={{display:"block", marginBottom:6}}>{t.title}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
function StrategyOverview({ groups }:{ groups: Record<string, Task[]> }){
  const entries = Object.entries(groups);
  return (
    <div style={{display:"grid", gap:10}}>
      {entries.map(([project, list])=> (
        <div key={project} style={{border:"1px solid rgba(255,255,255,.1)", borderRadius:10, padding:10}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
            <strong>{project}</strong>
            <span className="chip">{list.length} oppgaver</span>
          </div>
          <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
            {list.map(t => <span key={t.id} className="chip">{t.title}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}