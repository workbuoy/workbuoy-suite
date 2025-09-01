// lib/meta/rollback-gate.js
// Bridge module so lib/meta/experiments.js can call rollback/promote without import path ambiguity
export async function rollbackExperiment(id, reason){
  const mod = await import('./rollback.js');
  if(mod.rollbackExperiment){
    return mod.rollbackExperiment(id, reason);
  }
  if(mod.restoreSnapshot){
    // Fallback: restore most recent snapshot
    const snaps = mod.listSnapshots?.() || [];
    if(snaps.length){
      await mod.restoreSnapshot(snaps[snaps.length-1].path);
      return true;
    }
  }
  return true;
}

export async function promoteExperiment(id){
  // Placeholder — in your system this could "promote" the variant to default config
  return true;
}
