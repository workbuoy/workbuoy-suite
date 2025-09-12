import React from "react";
export default function Sparkline({ data, width=160, height=40 }:{ data:number[]; width?:number; height?:number }) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const norm = (v:number) => max === min ? 0.5 : (v - min) / (max - min);
  const step = width / (data.length - 1 || 1);
  const d = data.map((v,i)=>`${i*step},${height - norm(v)*height}`).join(" ");
  return <svg width={width} height={height} role="img" aria-label="Trend">
    <polyline points={d} fill="none" stroke="currentColor" strokeWidth="2"/>
  </svg>;
}