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
