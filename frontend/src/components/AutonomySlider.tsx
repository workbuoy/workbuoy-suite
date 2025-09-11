import React from "react";
type Props = { value: number; onChange: (v:number)=>void };
export const AutonomySlider: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div>
      <label>Autonomy: {value}</label>
      <input type="range" min={0} max={2} value={value} onChange={(e)=>onChange(Number(e.target.value))} />
    </div>
  );
};
