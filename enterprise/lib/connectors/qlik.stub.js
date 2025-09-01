// lib/connectors/qlik.stub.js
/**
 * Stub connector for Qlik Sense. Replace with real API integration.
 */
export async function stub_qlik() { 
  try {
    const metrics = await import('../metrics/registry.js').catch(()=>({}));
    const c = (metrics && (metrics.counters || {}).connector_stub_total) || null;
    if(c && c.inc) c.inc({ system: 'Qlik Sense' });
  } catch(_){
    // ignore metrics errors
  }
  return { ok: true, stub: 'Qlik Sense', items: [] };
}
export default { run: stub_qlik };

// Real implementation available; re-export
export { default } from './qlik.real.js';
