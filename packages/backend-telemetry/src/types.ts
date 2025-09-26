export type FeatureUsageAction = 'open' | 'complete' | 'dismiss' | (string & {});

export interface FeatureUsageEvent {
  userId: string;
  tenantId?: string;
  featureId: string;
  action: FeatureUsageAction;
  ts?: Date;
  metadata?: Record<string, unknown>;
}

export interface TelemetryStore {
  recordFeatureUsage(event: FeatureUsageEvent): Promise<void> | void;
  aggregateFeatureUseCount(
    userId: string,
    tenantId?: string,
  ): Promise<Record<string, number>> | Record<string, number>;
}
