// api/data-quality.js
import { ValidationRulesEngine } from '../lib/data-quality/validation-rules.js';
import { DataHygieneEngine } from '../lib/data-quality/hygiene-engine.js';

// Assumes an Express-like app and existing middlewares for RBAC/Tenant and policy gates
export default function registerDataQualityRoutes(app, deps) {
  const { rbac, tenant, policy, audit, metrics, siem, connectors, aiService, cache } = deps;
  const rules = new ValidationRulesEngine();
  const hygiene = new DataHygieneEngine(connectors, aiService);

  app.post('/api/data-quality/validate',
    tenant.enforce(),
    rbac.require(['dq:read']),
    async (req, res) => {
      try {
        const { entity_type, data, source } = req.body || {};
        if (!entity_type || !data) return res.status(400).json({ error: 'entity_type and data required' });

        // Run hygiene + validation
        const processed = await hygiene.processInboundData(data, source || 'api', entity_type);
        const validations = await rules.validateRecord(entity_type, processed);

        // Minimal metrics
        metrics.increment('wb_dq_validate_total');
        if (processed._quality?.score < 0.7) metrics.increment('wb_dq_low_quality_total');

        // Optionally SIEM-forward high-severity issues
        const severe = (processed._quality?.issues || []).filter(i => ['critical','high'].includes(i.severity));
        if (severe.length) siem.forward('dq_issue', { tenant: tenant.get(), source, entity_type, issues: severe });

        return res.json({
          entity_type,
          source,
          issues: processed._quality?.issues || [],
          suggestions: {
            close_date: processed.close_date_suggested,
            amount: processed.amount_suggested,
            merge_candidates: processed._merge_candidates
          },
          validations,
          _quality: processed._quality
        });
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    }
  );

  app.get('/api/data-quality/metrics',
    tenant.enforce(),
    rbac.require(['dq:read']),
    async (_req, res) => {
      try {
        const dashboard = new (await import('../lib/data-quality/quality-dashboard.js')).QualityDashboard(deps.db);
        const data = await dashboard.getQualityMetrics('7 days');
        return res.json(data);
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    }
  );
}
