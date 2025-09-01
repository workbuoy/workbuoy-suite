import { getConnector } from '../../../../lib/connectors/index.js';
import signalsIngest from '../../../../lib/signals-ingest.js';

export default async function handler(req,res){
  const { name } = req.query || {};
  const connector = getConnector(name, { logger: console, signals: signalsIngest }, {});
  if(!connector) return res.status(404).json({ error:'connector_not_found_or_disabled' });
  try{
    if(req.method==='POST'){
      const result = await connector.handleWebhook(req,res);
      if(!res.writableEnded) res.json(result||{ ok:true });
    } else if(req.method==='GET'){
      res.json({ ok:true, connector:name, status:'listening' });
    } else {
      res.status(405).end();
    }
  }catch(e){
    res.status(500).json({ error:'webhook_error', message:e?.message });
  }
}
