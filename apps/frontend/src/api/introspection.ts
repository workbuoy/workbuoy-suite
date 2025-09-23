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
  return {
    ok: true,
    awarenessScore: 0,
    introspectionReport: {
      generatedAt: new Date(0).toISOString(),
      summary: 'Introspection data unavailable in offline mode',
      signals: [],
      recommendations: [],
    },
  };
}
