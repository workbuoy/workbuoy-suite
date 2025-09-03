import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [ping, setPing] = useState<{ ok: boolean; ts: number } | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/v1/ai/ping')
      .then(res => res.json())
      .then(data => setPing(data));
    fetch('/api/v1/navi/options')
      .then(res => res.json())
      .then(data => setOptions(data.items || []));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Hello Workbuoy</h1>
      {ping && (
        <p>
          AI ping: ok={String(ping.ok)} ts={ping.ts}
        </p>
      )}
      <h2>Navi options</h2>
      <ul>
        {options.map(option => (
          <li key={option}>{option}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
