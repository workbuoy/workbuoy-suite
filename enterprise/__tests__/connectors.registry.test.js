import { buildEnabledConnectors, getConnector } from '../lib/connectors/index.js';

test('registry enables by env', ()=>{
  const prev = process.env.WB_CONNECTOR_SALESFORCE_ENABLED;
  process.env.WB_CONNECTOR_SALESFORCE_ENABLED = 'true';
  const list = buildEnabledConnectors({ logger: console, signals: { ingest: async()=>({inserted:0}) } });
  expect(list.find(c=>c.name==='salesforce')).toBeTruthy();
  process.env.WB_CONNECTOR_SALESFORCE_ENABLED = prev;
});

test('getConnector respects enablement', ()=>{
  const prev = process.env.WB_CONNECTOR_HUBSPOT_ENABLED;
  process.env.WB_CONNECTOR_HUBSPOT_ENABLED = 'false';
  const c = getConnector('hubspot', { logger: console, signals: { ingest: async()=>({inserted:0}) } });
  expect(c).toBeNull();
  process.env.WB_CONNECTOR_HUBSPOT_ENABLED = 'true';
  const c2 = getConnector('hubspot', { logger: console, signals: { ingest: async()=>({inserted:0}) } });
  expect(c2?.enabled()).toBe(true);
  process.env.WB_CONNECTOR_HUBSPOT_ENABLED = prev;
});
