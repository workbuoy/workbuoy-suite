import React from 'react';

export function WhyDrawer({ explanation, onClose }:{ explanation:any; onClose:()=>void }) {
  if (!explanation) return null;
  const { mode, reason, confidence, impact, alternatives } = explanation || {};
  return (
    <div style={{position:'fixed', right:0, top:0, bottom:0, width:360, background:'#111', color:'#fff', padding:16}}>
      <button onClick={onClose} style={{float:'right'}}>×</button>
      <h3>Why?</h3>
      <p><b>mode:</b> {mode}</p>
      <p><b>reason:</b> {reason}</p>
      {confidence!=null && <p><b>confidence:</b> {confidence}</p>}
      {impact && <p><b>impact:</b> {impact}</p>}
      {!!(alternatives?.length) && (
        <div>
          <b>alternatives:</b>
          <ul>{alternatives.map((a:string, i:number)=><li key={i}>{a}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
