import client from 'prom-client';
import express from 'express';
import pkg from '../../package.json' assert { type: 'json' };
import { getDefaultLabels } from './metricsConfig.js';

type PackageJson = { version?: string };

const packageJson = pkg as PackageJson;
const baseLabels: Record<string, string> = {
  service_name: 'workbuoy-backend',
  version: typeof packageJson?.version === 'string' ? packageJson.version : 'dev',
};

const Registry = client.Registry;
export const register = new Registry();

const mergedLabels = { ...baseLabels, ...getDefaultLabels() };
register.setDefaultLabels(mergedLabels);
client.collectDefaultMetrics({ register });

export const importCounter = new client.Counter({
  name: 'crm_import_total',
  help: 'Total CRM import rows processed',
  labelNames: ['entity','status'],
  registers: [register],
});

export const exportCounter = new client.Counter({
  name: 'crm_export_total',
  help: 'Total CRM export rows served',
  labelNames: ['entity'],
  registers: [register],
});

export const metricsApp = express();
metricsApp.get('/metrics', async (_req,res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
