import { EventEmitter } from 'events';

export interface RbacDeniedEvent {
  resource: string;
  action: string;
}

export interface FeatureUsedEvent {
  feature: string;
  action: string;
}

export type MetricsEventMap = {
  'rbac:denied': RbacDeniedEvent;
  'rbac:policy_change': { op: string };
  'telemetry:feature_used': FeatureUsedEvent;
};

type EventKey = keyof MetricsEventMap;

class MetricsEventEmitter extends EventEmitter {
  override on<T extends EventKey>(event: T, listener: (payload: MetricsEventMap[T]) => void): this {
    return super.on(event, listener);
  }

  override emit<T extends EventKey>(event: T, payload: MetricsEventMap[T]): boolean {
    return super.emit(event, payload);
  }
}

export const metricsEvents = new MetricsEventEmitter();

export function emitMetricsEvent<T extends EventKey>(event: T, payload: MetricsEventMap[T]): void {
  metricsEvents.emit(event, payload);
}
