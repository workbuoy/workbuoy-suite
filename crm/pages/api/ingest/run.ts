import type { NextApiRequest, NextApiResponse } from 'next';
import { GmailIngest } from '../../../lib/crm/ingest/gmail';
import { CalendarIngest } from '../../../lib/crm/ingest/calendar';
import { SlackIngest } from '../../../lib/crm/ingest/slack';
import { runIngest } from '../../../lib/crm/ingest/run';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== 'POST'){ res.setHeader('Allow','POST'); return res.status(405).end(); }
  const only = String(req.query.source || '').toLowerCase();
  const sources = [
    new GmailIngest(),
    new CalendarIngest(),
    new SlackIngest()
  ].filter(s => !only || s.name() === only);
  const result = await runIngest(sources as any);
  return res.status(200).json({ ok: true, ...result });
}
