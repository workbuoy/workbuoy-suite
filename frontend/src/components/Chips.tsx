import React from 'react';
type Chip = { key: string; value: string|number|boolean };
export function Chips({ items, onRemove }: { items: Chip[]; onRemove?: (key:string)=>void }) {
  return (
    <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
      {items.map(c => (
        <span key={c.key} style={{padding:'4px 8px', borderRadius:12, background:'rgba(0,0,0,0.05)'}}>
          {c.key}: {String(c.value)}{' '}
          {onRemove && <button aria-label={`remove-${c.key}`} onClick={()=>onRemove(c.key)} style={{marginLeft:6}}>×</button>}
        </span>
      ))}
    </div>
  );
}
