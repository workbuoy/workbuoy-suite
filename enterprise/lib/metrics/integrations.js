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


const wbOnboardingStarted = new client.Counter({
  name:'wb_onboarding_started_total',
  help:'Onboarding started'
});
const wbOnboardingCompleted = new client.Counter({
  name:'wb_onboarding_completed_total',
  help:'Onboarding completed'
});
const wbIntegrationConnect = new client.Counter({
  name:'wb_integration_connect_total',
  help:'Integration connect attempts with outcome',
  labelNames:['provider','status']
});
const wbAdminConsentRequests = new client.Counter({
  name:'wb_admin_consent_requests_total',
  help:'Admin consent link requests',
  labelNames:['provider']
});

export { wbOnboardingStarted, wbOnboardingCompleted, wbIntegrationConnect, wbAdminConsentRequests };
