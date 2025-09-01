export function toolExportCSV({ results }){
  const rows = (results?.results||[]);
  const cols = ['id','type','title','source','timestamp','url'];
  const header = cols.join(',');
  const lines = rows.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(','));
  return [header, ...lines].join('\n');
}
