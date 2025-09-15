import React from "react";

export default function SmartSkeleton({ text }:{ text?: string }){
  return (
    <div role="status" aria-busy="true"
         style={{border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:12}}>
      <div style={{opacity:.8, marginBottom:8}}>{text || "Laster…"} </div>
      <div style={{display:"grid", gap:8}}>
        <Bar/><Bar w="80%"/><Bar w="60%"/>
      </div>
    </div>
  );
}

function Bar({ w="100%" }:{ w?:string }){
  return <div style={{
    width:w, height:10, borderRadius:6,
    background:"linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.14), rgba(255,255,255,.06))",
    backgroundSize:"200% 100%", animation:"wb-skel 1.4s linear infinite"
  }}/>;
}