import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { extractFeatureCandidates } from '../../../src/ingest/jobboards/pipeline.js';

const r = Router();
r.get('/dev/jobboards/proposals', (_req,res)=>{
  const p = path.resolve(process.cwd(), 'dev/jobboards/mock.json');
  const ads = JSON.parse(fs.readFileSync(p,'utf8'));
  res.json(extractFeatureCandidates(ads));
});
export default r;
