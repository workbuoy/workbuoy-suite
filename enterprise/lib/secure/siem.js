'use strict';
const https = require('https');
const crypto = require('crypto');
const url = require('url');

function sign(body, secret){
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

function postJSON(targetUrl, payload, { secret, header = 'X-SIEM-Signature' } = {}){
  const body = JSON.stringify(payload);
  const sig = secret ? sign(body, secret) : null;
  const u = new url.URL(targetUrl);
  const opts = {
    hostname: u.hostname,
    port: u.port || 443,
    path: u.pathname + (u.search || ''),
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body)
    }
  };
  if (sig) opts.headers[header] = sig;

  return new Promise((resolve, reject)=>{
    const req = https.request(opts, (res)=>{
      let data='';
      res.on('data', d => data += d);
      res.on('end', ()=> resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function notifyCritical(event){
  const endpoint = process.env.SIEM_ENDPOINT;
  if (!endpoint) return;
  const secret = process.env.SIEM_HMAC_SECRET || '';
  try {
    await postJSON(endpoint, event, { secret });
  } catch (err){
    console.error('[siem] notify failed', err);
  }
}

module.exports = { postJSON, notifyCritical };
