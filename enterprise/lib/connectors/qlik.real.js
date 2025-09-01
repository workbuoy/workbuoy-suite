import fetch from 'node-fetch';
import { withRetry } from './base.js';
import { getSecret } from '../secrets/index.js';

function makeXrfkey(){
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out=''; for(let i=0;i<16;i++){ out += chars[Math.floor(Math.random()*chars.length)]; }
  return out;
}
function qrsUrl(path){
  const host = process.env.QLIK_HOST || 'https://qlik.example.com';
  const vpx = process.env.QLIK_VPROXY || 'hdr';
  return host.replace(/\/$/,'') + `/${vpx}/qrs` + path;
}
function headersWithKey(xrfkey){
  const apiKey = process.env.QLIK_API_KEY || (awaitGet('QLIK_API_KEY'));
  const h = { 'X-Qlik-Xrfkey': xrfkey, 'Accept':'application/json' };
  if(apiKey) h['Authorization'] = `Bearer ${apiKey}`;
  return h;
}
function awaitGet(){ return null; }

export async function listApps(){
  const x = makeXrfkey();
  const url = qrsUrl('/app/full') + `?xrfkey=${x}`;
  const r = await withRetry(()=> fetch(url, { headers: headersWithKey(x) }));
  if(!r.ok){ const t = await r.text(); throw Object.assign(new Error('qlik_http_'+r.status), { status:r.status, body:t }); }
  return r.json();
}

export default { listApps };
