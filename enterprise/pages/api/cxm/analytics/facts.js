import { readSalesFacts } from '../../../../lib/connectors/analytics.js';

export default async function handler(req,res){
  const date = (req.query.date || new Date().toISOString().slice(0,10));
  const rows = await readSalesFacts({date});
  res.json({ ok:true, data: rows });
}
