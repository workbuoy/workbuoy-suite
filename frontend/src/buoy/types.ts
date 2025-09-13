export type Intent = 'list'|'brief'|'visualize'|'simulate'|'approve';
export type Viz = 'table'|'line'|'bar'|'pie'|'kpi';
export interface GlobalSearchQuery {
  text?: string;
  filters: Record<string, string|number|boolean|string[]>;
  scope: 'user'|'team'|'org';
  sort?: string;
  viz?: Viz;
}
export interface BuoyCompletion {
  result: unknown;
  explanations: Array<{reasoning:string; sources?:string[]; confidence:number; policyBasis?:string; impact?:string}>;
  confidence: number;
  correlationId: string;
}
