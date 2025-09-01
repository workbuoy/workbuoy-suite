import crypto from 'crypto';

function hmacSha256(secret: string, data: Buffer|string) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export function verifyProviderSignature(provider: string, secret: string, rawBody: Buffer, headers: Record<string, any>) {
  // Simplified HMAC-based verification for dev/enterprise usage.
  // Each provider uses a different header key; we accept a few common variants.
  const upper = Object.fromEntries(Object.entries(headers).map(([k,v])=>[k.toLowerCase(), String(v)]));

  let headerSig = '';
  if (provider === 'hubspot') {
    headerSig = upper['x-hubspot-signature'] || upper['x-signature'] || '';
  } else if (provider === 'salesforce') {
    headerSig = upper['x-salesforce-signature'] || upper['x-signature'] || '';
  } else if (provider === 'dynamics') {
    headerSig = upper['x-dynamics-signature'] || upper['x-signature'] || '';
  } else {
    headerSig = upper['x-signature'] || '';
  }
  if (!headerSig) return false;

  const expected = hmacSha256(secret, rawBody);
  // allow optional "sha256=" prefix
  const cleaned = headerSig.startsWith('sha256=') ? headerSig.slice(7) : headerSig;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(cleaned));
}
