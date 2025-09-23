import React from "react";
export function Sparkline({ data, width=160, height=40 }:{ data:number[]; width?:number; height?:number }) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const norm = (v:number) => max === min ? 0.5 : (v - min) / (max - min);
  const step = width / (data.length - 1 || 1);
  const d = data.map((v,i)=>`${i*step},${height - norm(v)*height}`).join(" ");
  return <svg width={width} height={height} role="img" aria-label="Trend">
    <polyline points={d} fill="none" stroke="currentColor" strokeWidth="2"/>
  </svg>;
}
export function MiniBar({ data, width=180, height=60 }:{ data:number[]; width?:number; height?:number }) {
  if (!data.length) return null;
  const max = Math.max(...data), gap = 6;
  const bw = (width - gap*(data.length-1)) / data.length;
  return <svg width={width} height={height} role="img" aria-label="Fordeling">
    {data.map((v,i)=>{ const h = Math.round((v/max)*(height-10));
      return <g key={i} transform={`translate(${i*(bw+gap)},${height-h})`}><rect width={bw} height={h} rx="2"/><title>{v}</title></g>;
    })}
  </svg>;
}