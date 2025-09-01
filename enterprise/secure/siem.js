import { getSecret } from '../config/secrets.js';
import https from 'https';

async function postWebhook(url, payload){
  return await new Promise((resolve) => {
    try{
      const data = JSON.stringify(payload);
      const u = new URL(url);
      const opts = { method:'POST', hostname:u.hostname, path: u.pathname+u.search, headers:{'content-type':'application/json','content-length': Buffer.byteLength(data)} };
      const req = https.request(opts, (res)=>{ res.on('data', ()=>{}); res.on('end', ()=> resolve(true)); });
      req.on('error', ()=> resolve(false));
      req.write(data); req.end();
    }catch(e){ resolve(false); }
  });
}

export async function notifyCritical(event, details){
  try{
    const slackUrl = await getSecret('WB_SIEM_SLACK_WEBHOOK_URL');
    if(!slackUrl) return false;
    const payload = { text: `:rotating_light: ${event} :: ${new Date().toISOString()}`, blocks: [ { type:'section', text:{ type:'mrkdwn', text: `*${event}*\n\n\`${JSON.stringify(details).slice(0,1900)}\`` } } ] };
    return await postWebhook(slackUrl, payload);
  }catch(e){ return false; }
}
