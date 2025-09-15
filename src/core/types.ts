/**
 * Core types for Workbuoy Suite
 * PR6 — Core types + Policy facade + IntentLog
 */

export type Autonomy = 1 | 2 | 3 | 4 | 5 | 6;
export type ModuleMode = 'integration' | 'simulate';

/** Result of a policy decision. */
export interface PolicyResponse {
  allowed: boolean;
  degraded_mode?: 'ask_approval' | 'read_only' | 'supervised';
  explanation: string;
  /** Labels describing which rules fired (local or OPA). */
  basis?: string[];
  /** Human/ROI-oriented impact estimates (used by WhyDrawer). */
  impact?: {
    minutesSaved?: number;
    dsoDeltaDays?: number;
    riskReduced?: string;
  };
}

/** Lightweight event contract used on the in-proc bus. */
export interface WorkbuoyEvent<T = any> {
  id: string;
  type: string;
  source: 'user' | 'buoy' | 'navi' | 'connector' | 'system';
  payload: T;
  ts: string;
  correlationId?: string;
  idempotencyKey?: string;
}
