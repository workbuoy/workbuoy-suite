import { apiFetch } from '@/api';

export type IntrospectionSignal = {
  id: string;
  status: string;
  detail: string;
};

export type IntrospectionReport = {
  generatedAt: string;
  summary: string;
  signals: IntrospectionSignal[];
  recommendations: string[];
};

export type IntrospectionResponse = {
  ok: boolean;
  awarenessScore: number;
  introspectionReport: IntrospectionReport;
};

export async function fetchIntrospectionReport(): Promise<IntrospectionResponse> {
  try {
    return await apiFetch<IntrospectionResponse>('/api/introspection');
  } catch (error) {
    return apiFetch<IntrospectionResponse>('/genesis/introspection-report');
  }
}
