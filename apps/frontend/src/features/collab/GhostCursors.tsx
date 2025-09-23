import React, { useEffect, useRef } from "react";

type Ghost = { id:string; x:number; y:number; label:string };

// Demo: enkle "varme punkter" som beveger seg sakte rundt relevante UI-områder
const demo: Ghost[] = [
  { id:"g1", x: 0.20, y: 0.25, label:"Sales"},
  { id:"g2", x: 0.70, y: 0.35, label:"Finance"},
];

export default function GhostCursors(){
  const ref = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const el = ref.current; if (!el) return;
    const nodes = demo.map(g => {
      const n = document.createElement("div");
      n.className = "ghost-cursor";
      n.style.position = "absolute";
      n.style.left = (g.x*100) + "%";
      n.style.top = (g.y*100) + "%";
      n.style.transform = "translate(-50%,-50%)";
      n.style.width = "14px"; n.style.height="14px";
      n.style.border = "2px solid rgba(122,162,255,.8)";
      n.style.borderRadius = "50%";
      n.style.opacity = "0.6";
      n.style.pointerEvents = "none";
      const tag = document.createElement("div");
      tag.textContent = g.label;
      tag.style.position="absolute"; tag.style.top="16px"; tag.style.left="0";
      tag.style.fontSize="11px"; tag.style.opacity="0.75";
      n.appendChild(tag);
      el.appendChild(n);
      return { g, n };
    });
    return ()=> { nodes.forEach(n => n.n.remove()); };
  }, []);

  return <div ref={ref} aria-hidden="true" style={{position:"absolute", inset:0, pointerEvents:"none"}}/>;
}