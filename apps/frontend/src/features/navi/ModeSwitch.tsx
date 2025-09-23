import React from "react";
import { useAutonomy } from "./AutonomyContext";
import { AUTONOMY_LABELS, type AutonomyMode } from "./policy";

const ORDER: AutonomyMode[] = ["passiv","proaktiv","ambisiøs","kraken"];

export default function ModeSwitch(){
  const { mode, setMode } = useAutonomy();
  return (
    <div role="group" aria-label="Autonomi" style={{display:"flex", gap:6, padding:4, border:"1px solid rgba(255,255,255,.12)", borderRadius:999}}>
      {ORDER.map(m => (
        <button key={m} onClick={()=>setMode(m)} className="chip"
          aria-pressed={mode===m}
          title={tooltipFor(m)}
          style={{background: mode===m ? "rgba(255,255,255,.10)" : "transparent"}}>
          {AUTONOMY_LABELS[m]}
        </button>
      ))}
    </div>
  );
}

function tooltipFor(m: AutonomyMode){
  switch(m){
    case "passiv": return "Vis kun forslag. Ingen handlinger.";
    case "proaktiv": return "Forslag + handlinger med ett klikk.";
    case "ambisiøs": return "Forbered utkast automatisk.";
    case "kraken": return "Kan auto-utføre (policy-styrt).";
  }
}