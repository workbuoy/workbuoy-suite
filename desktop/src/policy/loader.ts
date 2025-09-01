import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { Policy } from './types.js';
import os from 'os';
import path from 'path';

function safeExec(cmd: string): string | null {
  try { return execSync(cmd, { encoding: 'utf8' }).trim(); } catch { return null; }
}

export function loadPolicy(): Policy {
  const p: Policy = {};
  const overridePath = process.env.WB_POLICY_PATH;
  if (overridePath && existsSync(overridePath)) {
    try {
      const j = JSON.parse(readFileSync(overridePath, 'utf8'));
      return j as Policy;
    } catch {}
  }
  const plat = process.platform;
  if (plat === 'win32') {
    const base = 'HKLM\\Software\\WorkBuoy';
    const readReg = (name: string) => safeExec(`reg query "${base}" /v ${name}`);
    const parseVal = (out: string | null) => out ? out.split('\n').pop()?.split('    ').pop()?.trim() : undefined;
    const getBool = (v?: string) => (v ? v.toLowerCase() in { '1':1, 'true':1, 'yes':1 } : undefined);

    p.ApiBaseUrl = parseVal(readReg('ApiBaseUrl'));
    p.AutoUpdateChannel = (parseVal(readReg('AutoUpdateChannel')) as any) || undefined;
    p.TelemetryEnabled = getBool(parseVal(readReg('TelemetryEnabled')));
    p.ProxyURL = parseVal(readReg('ProxyURL'));
    p.OTELExporterEndpoint = parseVal(readReg('OTELExporterEndpoint'));
    p.SSOBaseUrl = parseVal(readReg('SSOBaseUrl'));
  } else if (plat === 'darwin') {
    const domain = 'com.workbuoy.desktop';
    const readDef = (k: string) => safeExec(`defaults read ${domain} ${k}`) || undefined;
    const getBool = (v?: string | null) => (v ? v.toLowerCase() in { '1':1, 'true':1, 'yes':1 } : undefined);

    p.ApiBaseUrl = readDef('ApiBaseUrl') || undefined;
    p.AutoUpdateChannel = (readDef('AutoUpdateChannel') as any) || undefined;
    p.TelemetryEnabled = getBool(readDef('TelemetryEnabled') || null);
    p.ProxyURL = readDef('ProxyURL') || undefined;
    p.OTELExporterEndpoint = readDef('OTELExporterEndpoint') || undefined;
    p.SSOBaseUrl = readDef('SSOBaseUrl') || undefined;
  } else {
    const etcPath = '/etc/workbuoy/policy.json';
    if (existsSync(etcPath)) {
      try {
        const j = JSON.parse(readFileSync(etcPath, 'utf8'));
        return j as Policy;
      } catch {}
    }
  }
  return p;
}

export function withEnvOverrides(p: Policy): Policy {
  return {
    ApiBaseUrl: process.env.API_BASE_URL || p.ApiBaseUrl,
    AutoUpdateChannel: (process.env.CHANNEL as any) || p.AutoUpdateChannel || 'stable',
    TelemetryEnabled: process.env.TELEMETRY_ENABLED ? process.env.TELEMETRY_ENABLED.toLowerCase() in {'1':1,'true':1,'yes':1} : (p.TelemetryEnabled ?? true),
    ProxyURL: process.env.HTTPS_PROXY || process.env.HTTP_PROXY || p.ProxyURL,
    OTELExporterEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || p.OTELExporterEndpoint,
    SSOBaseUrl: process.env.SSO_BASE_URL || p.SSOBaseUrl,
  };
}
