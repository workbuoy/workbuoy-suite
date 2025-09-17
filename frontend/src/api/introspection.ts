import { apiFetch } from '@/api/client';

export type IntrospectionReport = {
  generatedAt: string;
  summary: string;
  signals: Array<{ id: string; status: string; detail: string }>;
  recommendations: string[];
};

export type IntrospectionResponse = {
  ok: boolean;
  awarenessScore: number;
  introspectionReport: IntrospectionReport;
};

export async function fetchIntrospectionReport(): Promise<IntrospectionResponse> {
  return apiFetch<IntrospectionResponse>('/genesis/introspection-report');
}
