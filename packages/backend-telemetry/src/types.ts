export type TelemetryEvent = {
  userId: string;
  tenantId: string;
  featureId: string;
  action: string; // package accepts string; adapter maps to Prisma enum
  ts: Date;
  metadata?: Record<string, unknown>;
};

export interface TelemetryStorage {
  record(ev: TelemetryEvent): Promise<void>;
}
