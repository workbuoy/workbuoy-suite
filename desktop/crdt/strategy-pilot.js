const { incCRDT, observeResolutionTime } = require('../metrics');
/** Simple CRDT register using (ts, nodeId) ordering; falls back to LWW */
function compare(a,b) {
  const ta = Number(a.ts||a.updated_at||0), tb = Number(b.ts||b.updated_at||0);
  if (ta!==tb) return ta - tb;
  const na = (a.nodeId||''); const nb = (b.nodeId||'');
  return na < nb ? -1 : (na>nb?1:0);
}
function make(nodeId='desktop') {
  return {
    kind: 'crdt-pilot',
    resolve(local, remote) {
      const t0 = Date.now();
      if (!remote) { incCRDT(1); observeResolutionTime(Date.now()-t0); return { winner:'local', value: local }; }
      if (!local)  { incCRDT(1); observeResolutionTime(Date.now()-t0); return { winner:'remote', value: remote }; }
      const w = compare(local, remote) >= 0 ? { winner:'local', value: local } : { winner:'remote', value: remote };
      incCRDT(1); observeResolutionTime(Date.now()-t0);
      return w;
    }
  };
}
module.exports = { make };
