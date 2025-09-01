export async function toolSearch({ fetchImpl, q, filter, limit=10, cursor=null, headers }){
  const body = { q, filter, limit, cursor };
  const res = await fetchImpl('/api/search/query', { method:'POST', headers:{ 'content-type':'application/json', ...(headers||{}) }, body: JSON.stringify(body) });
  if(!res.ok) throw new Error('search_failed');
  return await res.json();
}
