/**
 * Very small CSV parser: expects UTF-8 text with header row.
 * Supports commas inside quotes and basic unescaping.
 * Returns array of objects keyed by headers.
 */
export function parseCSV(text){
  const rows = [];
  let i=0, field='', row=[], inQuotes=false;
  const pushField = ()=>{ row.push(field); field=''; };
  const pushRow = ()=>{ if (row.length>0) rows.push(row); row=[]; };
  while (i < text.length){
    const ch = text[i];
    if (inQuotes){
      if (ch === '"'){
        if (text[i+1] === '"'){ field += '"'; i+=2; continue; }
        inQuotes = false; i++; continue;
      } else { field += ch; i++; continue; }
    } else {
      if (ch === '"'){ inQuotes = true; i++; continue; }
      if (ch === ','){ pushField(); i++; continue; }
      if (ch === '\n'){ pushField(); pushRow(); i++; continue; }
      if (ch === '\r'){ i++; continue; }
      field += ch; i++; continue;
    }
  }
  pushField(); pushRow();
  const headers = rows.shift() || [];
  return rows.filter(r=>r.length && r.some(x=>x!=='')).map(r=>{
    const obj = {};
    headers.forEach((h,idx)=>{ obj[h.trim()] = r[idx] ?? ''; });
    return obj;
  });
}
