import React, { useEffect, useState } from 'react';
import { api } from '@/api';

export const TasksPanel: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const r = await api('/api/tasks', 'GET');
      setTasks(r || []);
    })();
  }, []);

  return (
    <div className="p-4">
      <h2>Tasks</h2>
      <ul>
        {tasks.map(t => <li key={t.id}>{t.title}</li>)}
      </ul>
    </div>
  );
};
