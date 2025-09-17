export type ProbeStatus = 'ok' | 'warn' | 'fail';

export interface ProbeResult {
  name: string;
  status: ProbeStatus;
  latency_ms: number;
  reason?: string;
}

export interface Probe {
  name: string;
  check(): Promise<ProbeResult>;
}
