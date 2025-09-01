export async function triggerAlert(deps, payload) {
  try {
    if (deps?.siem?.forward) await deps.siem.forward({ kind:'integration_alert', ...payload });
    if (deps?.slack?.post) await deps.slack.post({
      channel: process.env.SLACK_ALERTS_CHANNEL || '#alerts',
      text: `⚠️ ${payload.severity?.toUpperCase()} [${payload.connector}] ${payload.metric}=${payload.value} (>${payload.threshold})\n${JSON.stringify(payload.context||{},null,2)}`
    });
  } catch (e) {
    deps?.logger?.error?.('alert_forward_failed', { err:e?.message, payload });
  }
}
const _state = new Map();
export function setConnectorStats(name, stats){ const { errorRate=0, p95ms=0, availability=1 } = stats||{}; _state.set(name, { errorRate, p95ms, availability, ts:Date.now() }); }
export async function snapshot(){ const out={}; for (const [k,v] of _state.entries()) out[k]={...v}; return out; }
export default { triggerAlert, setConnectorStats, snapshot };
