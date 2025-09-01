export function classifyQuery(input){
  const q = String(input||'').trim();
  if(!q) return { mode:'empty', command:null };
  if(q.startsWith('/')){
    const [cmd, ...rest] = q.split(/\s+/);
    const arg = rest.join(' ').trim();
    return { mode:'command', command:cmd.toLowerCase(), arg };
  }
  const hasWhy = /(hvorfor|hvorleis|why|how|hvordan)/i.test(q);
  const hasAgg = /(oppsummer|trend|årsaker|finn mønster|top|værste|beste|root cause)/i.test(q);
  const looksLikeId = /(#\d+|\b[A-Z]{2,}-\d+\b|\b\d{6,}\b)/.test(q);
  if(looksLikeId && !hasWhy && !hasAgg) return { mode:'lookup', command:null };
  if(hasWhy || hasAgg) return { mode:'rag', command:null };
  return { mode:'ambiguous', command:null };
}
export const SLASH_COMMANDS = [
  { cmd:'/søk', desc:'Søk i data (fulltekst + filtre). Eksempel: /søk forsinket levering kundeX' },
  { cmd:'/search', desc:'English alias for /søk' },
  { cmd:'/kart', desc:'Vis resultater på kart om mulig' },
  { cmd:'/export', desc:'Eksporter resultater (CSV)' },
  { cmd:'/hjelp', desc:'Vis tilgjengelige kommandoer' }
];
