import { Router } from 'express';
import { getConnectorCircuitState, listConnectorCircuits } from '../../src/connectors/internal/circuitRegistry';

const router = Router();

router.get('/connectors/:name/health', (req, res) => {
  const name = String(req.params.name || '');
  const state = getConnectorCircuitState(name);
  if (!state) {
    return res.status(404).json({ connector: name, state: 'unknown' });
  }
  res.json({ connector: name, state });
});

router.get('/connectors/health', (_req, res) => {
  const connectors = listConnectorCircuits();
  res.json({ connectors });
});

export default router;
