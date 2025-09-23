import React from 'react';
import { api } from '../api';

export function TasksPanel({ autonomy, setExplanation }:{ autonomy:number; setExplanation:(e:any)=>void }) {
  const [title, setTitle] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);

  async function refresh() {
    const r = await api('/api/tasks');
    if (r.ok) setItems(r.data.items||[]);
  }
  React.useEffect(()=>{ refresh(); }, []);

  async function create() {
    const r = await api('/api/tasks', { method:'POST', body: JSON.stringify({ title }) }, autonomy);
    if (!r.ok && r.status===403) setExplanation(r.explanation);
    setTitle('');
    refresh();
  }

  async function remove(id:string) {
    const r = await api('/api/tasks/'+id, { method:'DELETE' }, autonomy);
    if (!r.ok && r.status===403) setExplanation(r.explanation);
    refresh();
  }

  return (
    <div style={{border:'1px solid #ddd', padding:12}}>
      <h3>Tasks</h3>
      <div style={{display:'flex', gap:8}}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <button onClick={create}>Add</button>
      </div>
      <ul>
        {items.map(it=>(
          <li key={it.id} style={{display:'flex', justifyContent:'space-between'}}>
            <span>{it.title} · <i>{it.status}</i></span>
            <button onClick={()=>remove(it.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
