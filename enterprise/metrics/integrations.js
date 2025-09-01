import client from 'prom-client';

const integrationsSuggested = new client.Counter({
  name:'wb_integrations_suggested_total',
  help:'Integrations suggested to users',
  labelNames:['provider']
});
const integrationsConnectStarted = new client.Counter({
  name:'wb_integrations_connect_started_total',
  help:'Integration connect started',
  labelNames:['provider']
});
const integrationsConnected = new client.Counter({
  name:'wb_integrations_connected_total',
  help:'Integration connected successfully',
  labelNames:['provider']
});
const integrationsFailed = new client.Counter({
  name:'wb_integrations_failed_total',
  help:'Integration connection failed',
  labelNames:['provider']
});

export { integrationsSuggested, integrationsConnectStarted, integrationsConnected, integrationsFailed };
