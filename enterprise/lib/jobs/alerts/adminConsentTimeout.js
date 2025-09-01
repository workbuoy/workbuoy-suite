import fetch from 'node-fetch';
import { getTenantIntegrationStatuses } from '../../integrations/status.js';
import { getLogger } from '../../logger.js';
const WEBHOOK = process.env.WB_SLACK_WEBHOOK;
const HOURS = parseInt(process.env.WB_ADMIN_CONSENT_TIMEOUT_HOURS || '24',10);
export async function runAdminConsentTimeoutCheck(){
  const log = getLogger?.('adminConsent');
  if(!WEBHOOK){ log?.warn?.('WB_SLACK_WEBHOOK not set; skipping Slack alerts'); return; }
  const tenants = await getTenantIntegrationStatuses?.();
  const now = Date.now();
  const pending = [];
  for(const t of tenants||[]){
    for(const it of (t.integrations||[])){
      if(it.status==='PENDING_ADMIN' && it.requestedAt){
        const ageH = (now - new Date(it.requestedAt).getTime())/3600000;
        if(ageH >= HOURS) pending.push({tenant:t.id, provider: it.provider, ageH: Math.floor(ageH)});
      }
    }
  }
  if(pending.length===0) return;
  const text = pending.map(p=>`• tenant=${p.tenant} provider=${p.provider} pending ~${p.ageH}h`).join('\n');
  try{
    await fetch(WEBHOOK, {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ text: `Admin consent pending >${HOURS}h:\n${text}` })});
  }catch(e){ log?.error?.('Slack webhook failed', e); }
}
