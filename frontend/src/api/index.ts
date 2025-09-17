// frontend/src/api/index.ts
// Compatibility bridge: legacy api(path, method, body, headers) -> apiFetch(path, opts)
import { apiFetch } from '@/api/client';

export function api(path:string, method?:string, body?:any, headers?:Record<string,string>) {
  const opts: any = { method: method || 'GET', headers: { ...(headers||{}) } };
  if (body !== undefined && body !== null) {
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
    opts.headers['content-type'] = opts.headers['content-type'] || 'application/json';
  }
  return apiFetch(path, opts);
}

export default api;
export { apiFetch } from '@/api/client';
export { fetchIntrospectionReport } from './introspection';
