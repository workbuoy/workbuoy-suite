import { getRegistry } from '../../../lib/metrics/registry.js';
import '../../../lib/bootstrap.js';

export default async function handler(req, res) {
  try {
    const registry = getRegistry();
    res.setHeader('Content-Type', registry.contentType || 'text/plain; version=0.0.4');
    const body = await registry.metrics();
    res.status(200).send(body);
  } catch (err) {
    res.status(500).send(`# metrics error\n${(err && err.message) || 'unknown'}`);
  }
}
