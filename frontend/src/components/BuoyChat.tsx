import React, { useMemo, useState } from 'react';
import { parseToQuery } from '../buoy/parser';
import type { GlobalSearchQuery, BuoyCompletion } from '../buoy/types';
import { Chips } from './Chips';
import { ResultCard } from './ResultCard';
import { apiFetch } from '../api/client';

export default function BuoyChat(){
  const [text, setText] = useState('');
  const [query, setQuery] = useState<GlobalSearchQuery>({ text:'', filters:{}, scope:'team', viz:'table' });
  const [data, setData] = useState<any[]|null>(null);
  const [explanations, setExplanations] = useState<Array<any>>([]);
  const chips = useMemo(()=> Object.entries(query.filters).map(([k,v])=>({key:k, value:v as any})), [query]);

  async function run(){
    const q = parseToQuery(text);
    setQuery(q);
    const res = await apiFetch('/buoy/complete', { method:'POST', body: JSON.stringify({ intent: 'visualize', params: q }) });
    if (!res.ok) {
      setExplanations([{reasoning:'Policy denied or error', confidence:0}]);
      setData(null);
      return;
    }
    const body = await res.json() as BuoyCompletion;
    setExplanations(body.explanations || []);
    const arr = Array.isArray(body.result) ? body.result : [{kunde:q.filters['kunde']||'acme', deal: 120000, region: q.filters['region']||'vest'}];
    setData(arr);
  }

  function removeFilter(key:string){
    const next = { ...query, filters: { ...query.filters } };
    delete (next.filters as any)[key];
    setQuery(next);
  }

  return (
    <div>
      <div style={{display:'flex', gap:8}}>
        <input
          aria-label="buoy-input"
          value={text}
          onChange={e=>setText(e.target.value)}
          placeholder="Skriv forespørsel… (eks: vis acme siste 30 dager, region vest)"
          style={{flex:1, padding:8, borderRadius:8, border:'1px solid rgba(0,0,0,0.2)'}}
          onKeyDown={(e)=>{ if(e.key==='Enter'){ run(); } }}
        />
        <button onClick={run}>Kjør</button>
      </div>
      <Chips items={chips} onRemove={removeFilter} />
      <ResultCard query={query} data={data} onOpenNavi={()=>console.log('open navi…')} />
      {explanations.length>0 && (
        <details style={{marginTop:8}}>
          <summary>Hvorfor?</summary>
          <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(explanations, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
