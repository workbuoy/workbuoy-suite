export function toolMap({ results }){
  const withGeo = (results?.results||[]).filter(r => r.geo || (r.address && r.address.lat && r.address.lng));
  return { ok:true, count: withGeo.length };
}
