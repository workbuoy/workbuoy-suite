import client from 'prom-client';
import express from 'express';

const Registry = client.Registry;
export const register = new Registry();

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
