import { wbAdminConsentRequests } from '../../../lib/metrics/integrations.js';
import path from 'path';

const ADMIN_CONSENT_BASE = {
  'microsoft-graph': (tenant)=> `https://login.microsoftonline.com/${tenant||'common'}/v2.0/adminconsent`,
  'google-workspace': ()=> `https://admin.google.com/ac/owl/domainwidedelegation`,
  'workday': ()=> `https://community.workday.com/articles/175876`,
  'sap-s4hana': ()=> `https://help.sap.com/docs/`,
  'oracle-netsuite': ()=> `https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1515740733.html`
};

export default async function handler(req,res){
  const provider = String(req.query.provider||'').toLowerCase();
  if(!provider){ res.status(400).json({ok:false, error:'Missing provider'}); return; }
  const tenantHint = req.query.tenant || 'common';
  const url = (ADMIN_CONSENT_BASE[provider] && ADMIN_CONSENT_BASE[provider](tenantHint)) || `https://example.com/admin-consent/${provider}`;
  wbAdminConsentRequests.labels(provider||'unknown').inc();
  res.json({ ok:true, data:{ url } });
}
