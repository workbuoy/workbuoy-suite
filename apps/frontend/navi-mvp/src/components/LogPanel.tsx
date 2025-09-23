import React from 'react';
import { api } from '../api';

export function LogPanel({ autonomy, setExplanation }:{ autonomy:number; setExplanation:(e:any)=>void }) {
  const [msg, setMsg] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);

  async function refresh() {
    const r = await api('/api/log');
    if (r.ok) setItems(r.data.items||[]);
  }
  React.useEffect(()=>{ refresh(); }, []);

  async function append() {
    const r = await api('/api/log', { method:'POST', body: JSON.stringify({ level:'info', msg }) }, autonomy);
    if (!r.ok && r.status===403) setExplanation(r.explanation);
    setMsg('');
    refresh();
  }

  return (
    <div style={{border:'1px solid #ddd', padding:12}}>
      <h3>Log</h3>
      <div style={{display:'flex', gap:8}}>
        <input placeholder="Message" value={msg} onChange={e=>setMsg(e.target.value)} />
        <button onClick={append}>Append</button>
      </div>
      <ul>
        {items.map((it,idx)=>(
          <li key={idx}>
            {it.ts} · {it.level} · {it.msg} · <small>{it.hash?.slice(0,8)}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
