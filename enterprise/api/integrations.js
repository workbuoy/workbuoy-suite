// api/integrations.js
import { IntegrationMonitoring } from '../lib/integration/monitoring.js';

export default function registerIntegrationRoutes(app, deps) {
  const { rbac, tenant, metrics, siem } = deps;
  const monitoring = deps.integrationMonitoring || new IntegrationMonitoring();

  app.get('/api/integrations/health',
    tenant.enforce(),
    rbac.require(['integrations:read']),
    async (_req, res) => {
      try {
        const status = monitoring.getHealthStatus();
        // Calculate rolled up metrics for response, raise alerts on thresholds
        for (const [connector, data] of Object.entries(status)) {
          const { overall_health } = data;
          if (overall_health !== 'healthy') {
            siem.forward('integration_health_alert', { connector, overall_health, at: new Date().toISOString() });
          }
        }
        return res.json(status);
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    }
  );
}
