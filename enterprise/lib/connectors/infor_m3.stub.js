// lib/connectors/infor_m3.stub.js
/**
 * Stub connector for Infor M3. Replace with real API integration.
 */
export async function stub_infor_m3() { 
  try {
    const metrics = await import('../metrics/registry.js').catch(()=>({}));
    const c = (metrics && (metrics.counters || {}).connector_stub_total) || null;
    if(c && c.inc) c.inc({ system: 'Infor M3' });
  } catch(_){
    // ignore metrics errors
  }
  return { ok: true, stub: 'Infor M3', items: [] };
}
export default { run: stub_infor_m3 };

// Real implementation available; re-export
export { default } from './infor_m3.real.js';
