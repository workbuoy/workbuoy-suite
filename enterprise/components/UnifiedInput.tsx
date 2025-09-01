import React, {useEffect, useMemo, useRef, useState} from 'react';

type Result = {
  id: string; type: string; title: string; source: string; timestamp?: string; url?: string;
  geo?: {lat:number; lng:number};
};

const COMMANDS = ['/søk','/kart','/hjelp','/export'];

export default function UnifiedInput() {
  const [q, setQ] = useState('');
  const [suggests, setSuggests] = useState<string[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [checklist, setChecklist] = useState<boolean[]>(() => JSON.parse(localStorage.getItem('wb_checklist')||'[false,false,false,false,false]'));
  useEffect(() => {
    if (!localStorage.getItem('wb_info_shown')) {
      setShowBanner(true);
      localStorage.setItem('wb_info_shown','1');
    }
  }, []);
  useEffect(()=>{
    localStorage.setItem('wb_checklist', JSON.stringify(checklist));
  },[checklist]);

  useEffect(()=>{
    if(q.startsWith('/')){
      const s = COMMANDS.filter(c=>c.startsWith(q.toLowerCase()));
      setSuggests(s);
    } else setSuggests([]);
  },[q]);

  async function run() {
    const mode = q.startsWith('/kart')? 'kart' : q.startsWith('/søk')? 'søk' : q.startsWith('/export')? 'export' : 'hjelp';
    const res = await fetch('/api/ai/ask', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({q})});
    if(!res.ok){ return; }
    const data = await res.json();
    if (mode==='export' && data && data.url){
      window.location.href = data.url;
      return;
    }
    if (data && data.results) setResults(data.results);
    if ((!data || !data.results || data.results.length===0) && !q.startsWith('/søk')){
      alert('Mente du å søke? Skriv /søk <ditt søk>, eller still et spørsmål.');
    }
  }

  async function openSource(r: Result){
    await fetch('/api/telemetry/result-open', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({source:r.source})});
    if(r.url){ window.open(r.url, '_blank'); }
  }

  return (
    <div style={{padding:16}}>
      {showBanner && (
        <div style={{background:'#fff7e6', border:'1px solid #ffe58f', padding:12, borderRadius:8, marginBottom:12}}>
          Viktig: Workbuoy kan gjøre feil. Sjekk viktig informasjon før du handler. <a href="/portal/info">Mer info</a>
        </div>
      )}
      <div style={{display:'flex', gap:8}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Skriv /søk, /kart, /hjelp, /export …" style={{flex:1, padding:'10px 12px', borderRadius:8, border:'1px solid #ccc'}}/>
        <button onClick={run} style={{padding:'10px 14px', borderRadius:8}}>Kjør</button>
      </div>
      {suggests.length>0 && (
        <div style={{marginTop:8, display:'flex', gap:8, flexWrap:'wrap'}}>
          {suggests.map(s=>(<span key={s} style={{padding:'4px 8px', border:'1px solid #ddd', borderRadius:999}}>{s}</span>))}
        </div>
      )}
      <div style={{marginTop:16}}>
        {results.length===0 && <div style={{color:'#666'}}>Mente du å søke? Skriv /søk &lt;ditt søk&gt;, eller still et spørsmål.</div>}
        {results.map(r=>(
          <div key={r.id} style={{border:'1px solid #eee', padding:12, borderRadius:8, marginBottom:10}}>
            <div style={{fontWeight:600}}>{r.title}</div>
            <div style={{display:'flex', gap:8, marginTop:6}}>
              <span style={{fontSize:12, padding:'2px 6px', border:'1px solid #ddd', borderRadius:999}}>{r.source}</span>
            </div>
            <div style={{display:'flex', gap:8, marginTop:10}}>
              <button onClick={()=>openSource(r)}>Åpne i kilde</button>
              <form method="POST" action="/api/search/export">
                <input type="hidden" name="q" value={q} />
                <button type="submit">Eksporter CSV</button>
              </form>
              {r.geo && <a href={'/portal/map?q='+encodeURIComponent(q)}><button>Åpne i kart</button></a>}
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:24}}>
        <div style={{fontWeight:600, marginBottom:8}}>Onboarding sjekkliste</div>
        {[0,1,2,3,4].map(i=> (
          <label key={i} style={{display:'block', marginBottom:6}}>
            <input type="checkbox" checked={!!checklist[i]} onChange={e=>{
              const c=[...checklist]; c[i]=e.target.checked; setChecklist(c);
            }} /> Punkt {i+1}
          </label>
        ))}
      </div>
    </div>
  );
}
