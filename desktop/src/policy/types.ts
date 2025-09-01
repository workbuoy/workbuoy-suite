export type Channel = 'stable'|'beta';
export interface Policy {
  ApiBaseUrl?: string;
  AutoUpdateChannel?: Channel;
  TelemetryEnabled?: boolean;
  ProxyURL?: string;
  OTELExporterEndpoint?: string;
  SSOBaseUrl?: string;
}
