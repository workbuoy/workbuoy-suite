import React from 'react';

export function AutonomySlider({ value, onChange }:{ value:number; onChange:(v:number)=>void }) {
  return (
    <div style={{display:'grid', gap:6}}>
      <label>Autonomy: {value}</label>
      <input type="range" min={0} max={2} step={1} value={value} onChange={e=>onChange(parseInt(e.target.value,10))}/>
      <small>0 = ask_approval · 1 = read_only · 2 = supervised</small>
    </div>
  );
}
