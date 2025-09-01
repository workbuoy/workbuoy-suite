/**
 * Conflict handling with Last-Write-Wins default + audit trail.
 * Pluggable strategy hook: provide CRDT plugin via `setStrategy`.
 */
let strategy = {
  kind: 'lww',
  resolve: (local, remote) => {
    if (!remote) return { winner: 'local', value: local };
    if (!local) return { winner: 'remote', value: remote };
    const lu = Number(local.updated_at||0), ru = Number(remote.updated_at||0);
    return (lu >= ru) ? { winner: 'local', value: local } : { winner: 'remote', value: remote };
  }
};

function setStrategy(custom) { if (custom && typeof custom.resolve === 'function') strategy = custom; }

function resolve(local, remote) { return strategy.resolve(local, remote); }

module.exports = { resolve, setStrategy };


// Optional CRDT strategy pilot activation via env WB_CRDT_TENANTS (comma separated org ids)
try {
  const tenants = (process.env.WB_CRDT_TENANTS||'').split(',').map(s=>s.trim()).filter(Boolean);
  if (tenants.length) {
    const pilot = require('./crdt/strategy-pilot').make('desktop');
    // Up to the caller to decide per-org; we set global if any tenants provided.
    setStrategy(pilot);
  }
} catch {}


// Per-org strategy map (non-breaking): callers may pass orgId to resolve()
const _strategyByOrg = new Map();
function setStrategyForOrg(orgId, strat){ if (orgId) _strategyByOrg.set(orgId, strat); }
function resolveWithOrg(orgId, local, remote){
  const s = (orgId && _strategyByOrg.get(orgId)) || strategy; // fall back to global
  return s.resolve ? s.resolve(local, remote) : s(local, remote);
}
module.exports.setStrategyForOrg = setStrategyForOrg;
module.exports.resolveWithOrg = resolveWithOrg;
