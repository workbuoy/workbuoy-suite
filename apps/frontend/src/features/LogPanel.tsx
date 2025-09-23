import React, { useEffect, useState } from 'react';
import { api } from '@/api';

export const LogPanel: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const r = await api('/api/logs', 'GET');
      setLogs(r || []);
    })();
  }, []);

  return (
    <div className="p-4">
      <h2>Logs</h2>
      <ul>
        {logs.map(l => <li key={l.id}>{l.message}</li>)}
      </ul>
    </div>
  );
};
