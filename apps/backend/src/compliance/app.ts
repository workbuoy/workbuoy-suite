import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pushAudit, getAudit, clearAudit } from './audit.js';
import { emitWebhook, getQueue, clearQueue } from './webhooks.js';

type ExportJob = { jobId: string; userId: string; status: 'started'|'processing'|'complete'|'failed'; url?: string };

export function buildComplianceApp(){
  const app = express();
  app.use(express.json());

  const exportJobs = new Map<string, ExportJob>();

  // Admin helpers for tests
  app.post('/_admin/reset', (_req,res)=>{ exportJobs.clear(); clearAudit(); clearQueue(); res.json({ ok:true }); });
  app.get('/_admin/audit', (_req,res)=>res.json(getAudit()));
  app.get('/_admin/webhooks', (_req,res)=>res.json(getQueue()));

  // Start export
  app.post('/api/v1/compliance/export', (req,res)=>{
    const userId = String(req.body?.userId || '');
    if (!userId) return res.status(400).json({ error:'userId required' });
    const jobId = uuidv4();
    exportJobs.set(jobId, { jobId, userId, status:'started' });
    pushAudit({ ts: Date.now(), actor: userId, action: 'export.start', subject: userId, jobId });
    emitWebhook('privacy.export.started', { userId, jobId });
    res.status(202).json({ jobId, status:'started' });
  });

  // Check export status
  app.get('/api/v1/compliance/export/:jobId', (req,res)=>{
    const job = exportJobs.get(req.params.jobId);
    if (!job) return res.status(404).json({ error:'not_found' });
    // Simulate completion on first status check
    if (job.status !== 'complete') {
      job.status = 'complete';
      job.url = `/downloads/export_${job.jobId}.json`;
      exportJobs.set(job.jobId, job);
      pushAudit({ ts: Date.now(), actor: job.userId, action: 'export.complete', subject: job.userId, jobId: job.jobId });
      emitWebhook('privacy.export.completed', { userId: job.userId, jobId: job.jobId, url: job.url });
    }
    res.json({ jobId: job.jobId, status: job.status, url: job.url });
  });

  // Start delete
  app.post('/api/v1/compliance/delete', (req,res)=>{
    const userId = String(req.body?.userId || '');
    const scope = String(req.body?.scope || 'all');
    if (!userId) return res.status(400).json({ error:'userId required' });
    const jobId = uuidv4();
    pushAudit({ ts: Date.now(), actor: userId, action: 'delete.start', subject: userId, jobId, payload:{ scope } });
    emitWebhook('privacy.delete.started', { userId, jobId, scope });
    // mock async accepted
    res.status(202).json({ jobId, accepted: true });
  });

  // Portability – return JSON dump synchronously (mock)
  app.post('/api/v1/compliance/portability', (req,res)=>{
    const userId = String(req.body?.userId || '');
    if (!userId) return res.status(400).json({ error:'userId required' });
    const dump = {
      userId,
      exportedAt: new Date().toISOString(),
      contacts: [{ id:'c1', name:'Example', email:'user@example.com' }],
      opportunities: []
    };
    pushAudit({ ts: Date.now(), actor: userId, action: 'portability.generate', subject: userId, payload:{ size: JSON.stringify(dump).length } });
    emitWebhook('privacy.portability.generated', { userId, size: JSON.stringify(dump).length });
    res.json({ metadata:{ format:'json', version:'1.0' }, data: dump });
  });

  return app;
}
