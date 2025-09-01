'use strict';
const crypto = require('crypto');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function hmacSHA256(payload, secret){
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function timingSafeEqual(a,b){
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

async function seenNonce(source, nonce){
  const res = await pool.query('SELECT 1 FROM webhook_events WHERE source=$1 AND nonce=$2 AND ts > now() - interval '24 hours'', [source, nonce]);
  return res.rowCount > 0;
}

async function storeNonce(source, nonce){
  await pool.query('INSERT INTO webhook_events(source, nonce) VALUES ($1,$2) ON CONFLICT DO NOTHING', [source, nonce]);
}

function ensureRecent(tsMs){
  const now = Date.now();
  return Math.abs(now - tsMs) < 5 * 60 * 1000; // 5 min
}

/**
 * Generic verifier for HMAC-signed webhooks.
 * Expects headers: x-wb-signature (hex), x-wb-timestamp (ms), x-wb-nonce
 */
function withVerifiedWebhook(handler, { secret, source }){
  return async (req, res) => {
    try {
      const sig = req.headers['x-wb-signature'];
      const ts = parseInt(req.headers['x-wb-timestamp'] || '0',10);
      const nonce = String(req.headers['x-wb-nonce'] || '');
      if (!sig || !ts || !nonce) throw new Error('missing_headers');
      if (!ensureRecent(ts)) throw new Error('stale');
      if (await seenNonce(source, nonce)) throw new Error('replay');

      const chunks = [];
      await new Promise((resolve,reject)=>{
        req.on('data', c=>chunks.push(Buffer.from(c)));
        req.on('end', resolve);
        req.on('error', reject);
      });
      const body = Buffer.concat(chunks);
      const computed = hmacSHA256(body, secret);
      if (!timingSafeEqual(computed, sig)) throw new Error('bad_signature');

      await storeNonce(source, nonce);
      req.rawBody = body;
      return handler(req, res);
    } catch (e){
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'invalid_webhook' }));
    }
  };
}

module.exports = { withVerifiedWebhook };
