import { withAuth } from '../../../lib/auth/oidc';
import fetch from 'node-fetch';
import { getSecret } from '../../../lib/config/secrets';

async function pingHubSpot(apiKey){
  const r = await fetch('https://api.hubapi.com/integrations/v1/me', { headers: { 'Authorization': `Bearer ${apiKey}` } });
  return r.ok;
}
async function pingJira(baseUrl, email, apiToken){
  const r = await fetch(`${baseUrl}/rest/api/3/myself`, { headers: { 'Authorization': 'Basic ' + Buffer.from(`${email}:${apiToken}`).toString('base64') } });
  return r.ok;
}
async function pingGitHub(token){
  const r = await fetch('https://api.github.com/user', { headers: { 'Authorization': `Bearer ${token}`, 'User-Agent':'workbuoy' } });
  return r.ok;
}

export default withAuth(async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end();
  const { connector, secretRef, jiraBaseUrl } = req.body || {};
  if (!connector || !secretRef) return res.status(400).json({ ok:false, error:'missing_params' });
  try {
    const secret = await getSecret(secretRef);
    let reachable = false;
    if (connector === 'hubspot') reachable = await pingHubSpot(secret.token || secret.apiKey || secret);
    else if (connector === 'jira') reachable = await pingJira(jiraBaseUrl || secret.baseUrl, secret.email, secret.apiToken || secret.token);
    else if (connector === 'github') reachable = await pingGitHub(secret.token || secret);
    else if (connector === 'notion') { const r = await fetch('https://api.notion.com/v1/users/me', { headers: { 'Authorization': `Bearer ${secret.token||secret}`, 'Notion-Version':'2022-06-28' } }); reachable = r.ok; } else if (connector === 'd365') { const r = await fetch((secret.baseUrl||'') + '/api/data/v9.2/WhoAmI', { headers: { 'Authorization': `Bearer ${secret.token||secret}` } }); reachable = r.ok; } else if (connector === 'netsuite') { const r = await fetch((secret.baseUrl||'https://<account>.suitetalk.api.netsuite.com') + '/services/rest/record/v1/meta/roles', { headers: { 'Authorization': `Bearer ${secret.token||secret}` } }); reachable = r.ok; }
else if (connector === 'infor_m3') { const r = await fetch((secret.baseUrl||'https://<tenant>.ionapi.infor.com') + '/M3/m3api-rest/v2/execute', { method:'POST', headers: { 'Authorization': `Bearer ${secret.token||secret}`, 'Content-Type':'application/json' }, body: JSON.stringify({ program:'MMS200', transaction:'Lst' }) }); reachable = r.ok || r.status===400; }
else if (connector === 'qlik') { const r = await fetch((secret.baseUrl||'https://<tenant>.qlikcloud.com') + '/api/v1/users/me', { headers: { 'Authorization': `Bearer ${secret.token||secret}` } }); reachable = r.ok; }
else return res.status(400).json({ ok:false, error:'unsupported_connector' });
    return res.status(200).json({ ok:true, connector, reachable });
  } catch (e){
    return res.status(200).json({ ok:false, connector, reachable:false, error:'ping_failed' });
  }
}, { roles: ['admin','owner'] });
