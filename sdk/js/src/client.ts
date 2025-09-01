import { ClientOptions, ListResult, Contact, Pipeline, Opportunity } from './types.js';
import { ensureIdempotencyKey, withTimeout } from './utils.js';

export class WorkBuoy {
  baseUrl: string;
  apiKey: string;
  tenantId: string;
  timeoutMs: number;

  constructor(opts: ClientOptions) {
    this.baseUrl = opts.baseUrl;
    this.apiKey = opts.apiKey;
    this.tenantId = opts.tenantId;
    this.timeoutMs = opts.timeoutMs ?? 15000;
  }

  private headers(extra: Record<string,string> = {}) {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'x-tenant-id': this.tenantId,
      ...extra,
    };
  }

  private async get<T>(path: string): Promise<T> {
    const res = await withTimeout(fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.headers()
    }), this.timeoutMs);
    if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
    return await res.json() as T;
  }

  private async mutate<T>(method: 'POST'|'PUT'|'PATCH', path: string, body: any): Promise<T> {
    const headers = ensureIdempotencyKey(this.headers());
    const res = await withTimeout(fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: JSON.stringify(body)
    }), this.timeoutMs);
    if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`);
    return await res.json() as T;
  }

  pipelines = {
    list: () => this.get<ListResult<Pipeline>>('/api/v1/crm/pipelines'),
    create: (p: Pipeline) => this.mutate<Pipeline>('POST', '/api/v1/crm/pipelines', p),
    update: (id: string, p: Pipeline) => this.mutate<Pipeline>('PUT', `/api/v1/crm/pipelines/${id}`, p),
    patch: (id: string, p: Partial<Pipeline>) => this.mutate<Pipeline>('PATCH', `/api/v1/crm/pipelines/${id}`, p),
  };

  contacts = {
    list: (q?: { limit?: number; cursor?: string }) => {
      const params = new URLSearchParams();
      if (q?.limit) params.set('limit', String(q.limit));
      if (q?.cursor) params.set('cursor', q.cursor);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return this.get<ListResult<Contact>>(`/api/v1/crm/contacts${qs}`);
    },
    create: (c: Contact) => this.mutate<Contact>('POST', '/api/v1/crm/contacts', c),
    update: (id: string, c: Contact) => this.mutate<Contact>('PUT', `/api/v1/crm/contacts/${id}`, c),
    patch: (id: string, c: Partial<Contact>) => this.mutate<Contact>('PATCH', `/api/v1/crm/contacts/${id}`, c),
  };

  opportunities = {
    list: (q?: { limit?: number; cursor?: string }) => {
      const params = new URLSearchParams();
      if (q?.limit) params.set('limit', String(q.limit));
      if (q?.cursor) params.set('cursor', q.cursor);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return this.get<ListResult<Opportunity>>(`/api/v1/crm/opportunities${qs}`);
    },
    create: (o: Opportunity) => this.mutate<Opportunity>('POST', '/api/v1/crm/opportunities', o),
    update: (id: string, o: Opportunity) => this.mutate<Opportunity>('PUT', `/api/v1/crm/opportunities/${id}`, o),
    patch: (id: string, o: Partial<Opportunity>) => this.mutate<Opportunity>('PATCH', `/api/v1/crm/opportunities/${id}`, o),
  };
}
