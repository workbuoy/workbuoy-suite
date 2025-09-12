import React from "react";
import FlipCard from "./components/FlipCard";
export default function App() {
  return (
    <div style={{display:"grid", placeItems:"center", height:"100%", padding:16}}>
      <div style={{width:"min(1100px, 92vw)"}}>
        <h1 style={{margin:"8px 0 14px", fontSize:18, fontWeight:600, opacity:.9}}>Workbuoy</h1>
        <FlipCard/>
        <div style={{marginTop:12, display:"flex", gap:10, alignItems:"center"}}>
          <span className="chip">Space/Enter: flip</span>
          <span className="chip">Bestemor-vennlig, clean UI</span>
        </div>
      </div>
    </div>
  );
}