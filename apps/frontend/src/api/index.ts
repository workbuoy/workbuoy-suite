// frontend/src/api/index.ts
// Compatibility bridge: legacy api(path, method, body, headers) -> apiFetch(path, opts)
import { apiFetch } from '@/lib/client';

type HeadersMap = Record<string, string> | undefined;

export const api = (path: string, method?: string, body?: any, headers?: HeadersMap) => {
  const opts: any = { method: method || 'GET', headers: { ...(headers || {}) } };
  if (body !== undefined && body !== null) {
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
    opts.headers['content-type'] = opts.headers['content-type'] || 'application/json';
  }
  return apiFetch(path, opts);
};

export default api;
export { apiFetch } from '@/lib/client';
export { fetchIntrospectionReport } from './introspection';
