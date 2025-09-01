export class DataQualityMonitor {
  constructor(eventBus, alertSystem) {
    this.events = eventBus;
    this.alerts = alertSystem;
    this.thresholds = {
      quality_score_min: 0.7,
      duplicate_rate_max: 0.05,
      missing_data_rate_max: 0.15
    };
  }

