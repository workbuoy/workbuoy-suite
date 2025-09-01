import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

export async function runTool(baseUrl: string, apiKey: string, method: string, path: string, body?: any) {
  const url = new URL(path, baseUrl).toString();
  const headers: any = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'Idempotency-Key': uuidv4(),
  };
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, headers: Object.fromEntries(res.headers.entries()), body: json };
}
