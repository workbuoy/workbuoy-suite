import React, { useEffect, useRef } from "react";
import type { PeripheralState } from "./usePeripheralStatus";
export default function StatusEdge({ state }:{ state: PeripheralState }){
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el = ref.current; if (!el) return;
    el.style.setProperty("--wb-edge-color", state==="ok" ? "rgba(46, 204, 113, .75)"
      : state==="pending" ? "rgba(241, 196, 15, .85)"
      : "rgba(231, 76, 60, .85)");
  }, [state]);
  return (
    <div aria-hidden="true" ref={ref} style={{
      position:"absolute", inset:0, pointerEvents:"none",
      boxShadow:"0 0 0 3px var(--wb-edge-color) inset",
      borderRadius:16, transition:"box-shadow .35s ease",
      animation: state==="pending" ? "wb-breathe 2.6s ease-in-out infinite" : undefined
    }}/>
  );
}