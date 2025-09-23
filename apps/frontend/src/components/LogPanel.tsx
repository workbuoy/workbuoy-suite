import React, { useEffect, useState } from "react";
import { apiFetch } from "@/api";

export const LogPanel: React.FC<{ autonomy:number; role?:string }> = ({ autonomy, role }) => {
  const [logs, setLogs] = useState<any[]>([]);
  async function load() {
    const res = await apiFetch<any[]>('/api/logs', { autonomyLevel: autonomy, role });
    setLogs(Array.isArray(res) ? res : (res as any)?.items ?? []);
  }
  useEffect(()=>{ load(); },[]);
  return (
    <div>
      <h3>Logs</h3>
      <ul>
        {logs.map((l: any, idx)=><li key={idx}>{l.ts} • {l.level} • {l.message || l.msg}</li>)}
      </ul>
    </div>
  );
};
