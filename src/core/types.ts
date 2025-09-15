export type Autonomy = 1|2|3|4|5|6;
export type ModuleMode = 'integration'|'simulate';

export interface PolicyResponse {
  allowed: boolean;
  degraded_mode?: 'ask_approval' | 'read_only' | 'supervised';
  explanation: string;
  basis?: string[]; // hvilke "regler" slo inn (labels)
  impact?: { minutesSaved?: number; dsoDeltaDays?: number; riskReduced?: string };
}

export interface WorkbuoyEvent<T=any> {
  id: string;
  type: string;
  source: 'user'|'buoy'|'navi'|'connector'|'system';
  payload: T;
  ts: string;
  correlationId?: string;
  idempotencyKey?: string;
}
