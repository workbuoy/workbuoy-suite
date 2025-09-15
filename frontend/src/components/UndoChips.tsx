import React, { useState } from "react";
import { useSmartUndo } from "../core/SmartUndo";
import WhyDrawer from "../features/buoy/WhyDrawer";

export default function UndoChips(){
  const { suggestions, consume } = useSmartUndo();
  const [why, setWhy] = useState<string[]|null>(null);

  if (!suggestions.length) return null;

  return (
    <div style={{marginTop:12, display:"flex", gap:8, flexWrap:"wrap"}}>
      {suggestions.map(s => (
        <button key={s.id} className="chip" onClick={()=> setWhy(s.explanation)}>
          {s.label}
        </button>
      ))}
      {why && <WhyDrawer explanations={why} onClose={()=>setWhy(null)}/>}
    </div>
  );
}