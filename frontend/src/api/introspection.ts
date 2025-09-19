import { apiFetch } from '@/api/client';
import type { IntrospectionResponse } from '@/types/introspection';

export type { IntrospectionReport, IntrospectionResponse } from '@/types/introspection';

export async function fetchIntrospectionReport(): Promise<IntrospectionResponse> {
  return apiFetch<IntrospectionResponse>('/genesis/introspection-report');
}
