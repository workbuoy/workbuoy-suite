import React, { useEffect, useState } from "react";
import { apiFetch } from "@/api";

export const TasksPanel: React.FC<{ autonomy:number; role?:string }> = ({ autonomy, role }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  async function load() {
    const res = await apiFetch<any[]>('/api/tasks', { autonomyLevel: autonomy, role });
    setTasks(Array.isArray(res) ? res : (res as any)?.data?.items ?? []);
  }
  async function add() {
    await apiFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title }),
      autonomyLevel: autonomy,
      role
    });
    await load();
    setTitle("");
  }
  useEffect(()=>{ load(); },[]);
  return (
    <div>
      <h3>Tasks</h3>
      <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <button onClick={add}>Add</button>
      <ul>
        {tasks.map((t:any)=><li key={t.id}>{t.title} – {t.status}</li>)}
      </ul>
    </div>
  );
};
