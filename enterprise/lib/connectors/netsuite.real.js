import fetch from 'node-fetch';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { withRetry, withIncrementalSync } from './base.js';
import { getState, setState } from '../db/state.js';
import { getSecret } from '../secrets/index.js';

function tbaHeader({ url, method, account, consumerKey, consumerSecret, tokenKey, tokenSecret }){
  const oauth = new OAuth({
    consumer: { key: consumerKey, secret: consumerSecret },
    signature_method: 'HMAC-SHA256',
    hash_function: (base_string, key) => crypto.createHmac('sha256', key).update(base_string).digest('base64')
  });
  const requestData = { url, method };
  const token = { key: tokenKey, secret: tokenSecret };
  const auth = oauth.toHeader(oauth.authorize(requestData, token));
  // NetSuite realm
  auth.Authorization += `, realm="${account}"`;
  return auth.Authorization;
}

async function suiteql({ account, base, auth, q, offset=0, limit=1000 }){
  const url = `${base}/services/rest/query/v1/suiteql`;
  const headers = { 'Content-Type':'application/json', 'Accept':'application/json', 'Authorization': auth };
  const body = JSON.stringify({ q, limit, offset });
  const r = await withRetry(()=> fetch(url, { method:'POST', headers, body }));
  if(!r.ok){ const t = await r.text(); throw Object.assign(new Error('netsuite_http_'+r.status), { status:r.status, body:t }); }
  return r.json();
}

export async function testConnection(){
  const account = await getSecret('NS_ACCOUNT');
  const base = process.env.NS_REST_BASE || `https://${account}.suitetalk.api.netsuite.com`;
  const auth = tbaHeader({
    url: base + '/services/rest/platform/v1/metadata',
    method:'GET',
    account,
    consumerKey: await getSecret('NS_CONSUMER_KEY'),
    consumerSecret: await getSecret('NS_CONSUMER_SECRET'),
    tokenKey: await getSecret('NS_TOKEN_KEY'),
    tokenSecret: await getSecret('NS_TOKEN_SECRET')
  });
  const r = await fetch(base + '/services/rest/platform/v1/metadata', { headers:{ 'Authorization': auth, 'Accept':'application/json' }});
  if(!r.ok) throw new Error('netsuite_auth_failed_'+r.status);
  return true;
}

export async function sync_customers_orders({ tenant, since }){
  const account = await getSecret('NS_ACCOUNT');
  const base = process.env.NS_REST_BASE || `https://${account}.suitetalk.api.netsuite.com`;
  const authCommon = {
    account,
    consumerKey: await getSecret('NS_CONSUMER_KEY'),
    consumerSecret: await getSecret('NS_CONSUMER_SECRET'),
    tokenKey: await getSecret('NS_TOKEN_KEY'),
    tokenSecret: await getSecret('NS_TOKEN_SECRET')
  };
  const name = 'NetSuite';

  return withIncrementalSync({
    tenant, name, sinceKey:'since',
    fetchPage: async ({ since, cursor })=>{
      const limit = 200; const offset = parseInt(cursor||'0',10)||0;
      const filter = since ? ` WHERE lastModifiedDate >= TO_DATE('${since.replace('T',' ').replace('Z','')}', 'YYYY-MM-DD HH24:MI:SS')` : '';
      const q = `SELECT id, entityid, email, lastModifiedDate FROM customer${filter} ORDER BY lastModifiedDate ASC`;
      const auth = tbaHeader({ url: base + '/services/rest/query/v1/suiteql', method:'POST', ...authCommon });
      const data = await suiteql({ account, base, auth, q, offset, limit });
      const items = (data.items||data.rows||[]).map(r=> (r || {}));
      const last = items.length ? (items[items.length-1].lastModifiedDate || since) : since;
      return { items, hasMore: items.length===limit, nextCursor: String(offset + items.length), nextSince: last };
    },
    pushItems: async (items)=>{ /* upsert into internal store – left as integration point */ },
    getState, setState
  });
}

export default { testConnection, sync: sync_customers_orders };
