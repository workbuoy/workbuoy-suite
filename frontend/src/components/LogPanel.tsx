import React, { useEffect, useState } from "react";
import { api } from "../api/client";

export const LogPanel: React.FC<{ autonomy:number; role?:string }> = ({ autonomy, role }) => {
  const [logs, setLogs] = useState<any[]>([]);
  async function load() {
    const r = await api("/api/logs","GET", undefined, { "x-autonomy": String(autonomy), "x-role-id": role || "anon" });
    setLogs(r.data.items || r.data.items || []);
  }
  useEffect(()=>{ load(); },[]);
  return (
    <div>
      <h3>Logs</h3>
      <ul>
        {logs.map((l, idx)=><li key={idx}>{l.ts} • {l.level} • {l.msg}</li>)}
      </ul>
    </div>
  );
};
