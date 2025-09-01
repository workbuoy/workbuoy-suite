import type { NextApiRequest, NextApiResponse } from 'next';
import { bus } from '../../../lib/events';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (data: any)=>{
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  const onEv = (ev: any)=> send(ev);
  bus.on('pipeline', onEv);
  req.on('close', ()=> bus.off('pipeline', onEv));
  send({ type: 'hello', ts: Date.now() });
}
