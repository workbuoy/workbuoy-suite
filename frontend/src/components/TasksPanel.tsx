import React, { useEffect, useState } from "react";
import { api } from "../api/client";

export const TasksPanel: React.FC<{ autonomy:number; role?:string }> = ({ autonomy, role }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  async function load() {
    const r = await api("/api/tasks","GET", undefined, { "x-autonomy": String(autonomy), "x-role-id": role || "anon" });
    setTasks(r.data.items || []);
  }
  async function add() {
    const r = await api("/api/tasks","POST", { title }, { "x-autonomy": String(autonomy), "x-role-id": role || "anon" });
    if (r.status >= 400) alert("Denied: " + (r.data?.explanations?.[0]?.reason || r.status));
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
        {tasks.map(t=><li key={t.id}>{t.title} – {t.status}</li>)}
      </ul>
    </div>
  );
};
