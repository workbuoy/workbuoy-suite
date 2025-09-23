import React from "react";
export default function MiniDonut({ data, size=64 }:{ data:number[]; size?:number }) {
  if (!data.length) return null;
  const total = data.reduce((a,b)=>a+b,0) || 1;
  const cx=size/2, cy=size/2, r=size/2-4, circ=2*Math.PI*r;
  let acc=0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Andeler">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="8"/>
      {data.map((v,i)=>{
        const frac = v/total; const dash = Math.max(1, frac*circ-2);
        const gap = 2; const offset = -acc*circ;
        acc += frac;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="8"
          strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={offset}/>;
      })}
    </svg>
  );
}