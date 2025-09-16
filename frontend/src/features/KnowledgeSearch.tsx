import React, { useState } from 'react';

export const KnowledgeSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const search = async () => {
    const r = await fetch(`/api/knowledge/search?q=${encodeURIComponent(query)}`);
    const j = await r.json();
    setResults(j.results || []);
  };

  return (
    <div className="p-4">
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search knowledge..." />
      <button onClick={search}>Search</button>
      <ul>
        {results.map(r=>(<li key={r.id}>{r.title}</li>))}
      </ul>
    </div>
  );
};
