import React from "react";
export default function MiniBar({ data, width=180, height=60 }:{ data:number[]; width?:number; height?:number }) {
  if (!data.length) return null;
  const max = Math.max(...data), gap = 6;
  const bw = (width - gap*(data.length-1)) / data.length;
  return <svg width={width} height={height} role="img" aria-label="Fordeling">
    {data.map((v,i)=>{ const h = Math.round((v/max)*(height-10));
      return <g key={i} transform={`translate(${i*(bw+gap)},${height-h})`}><rect width={bw} height={h} rx="2"/><title>{v}</title></g>;
    })}
  </svg>;
}