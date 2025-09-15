import { Router } from 'express';
import { CRMConnector } from '../../connectors/crm/CRMConnector';
import { KnowledgeIndex } from '../../connectors/knowledge/KnowledgeIndex';

const r = Router();
const crm = new CRMConnector();
const ki = new KnowledgeIndex();

r.get('/crm/health', (_req, res)=> res.json(crm.health()));
r.post('/crm/simulate', async (req,res)=> res.json(await crm.simulate(req.body)));
r.post('/crm/dry-run', async (req,res)=> res.json(await crm.dryRun(req.body)));

r.get('/knowledge/health', async (_req,res)=> res.json(await ki.health()));
r.get('/knowledge/query', async (req,res)=> res.json(await ki.query({ q: String(req.query.q||'') })));

export default r;
