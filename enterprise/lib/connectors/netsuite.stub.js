// lib/connectors/netsuite.stub.js
/**
 * Stub connector for Oracle NetSuite. Replace with real API integration.
 */
export async function stub_netsuite() { 
  try {
    const metrics = await import('../metrics/registry.js').catch(()=>({}));
    const c = (metrics && (metrics.counters || {}).connector_stub_total) || null;
    if(c && c.inc) c.inc({ system: 'Oracle NetSuite' });
  } catch(_){
    // ignore metrics errors
  }
  return { ok: true, stub: 'Oracle NetSuite', items: [] };
}
export default { run: stub_netsuite };

// Real implementation available; re-export
export { default } from './netsuite.real.js';
