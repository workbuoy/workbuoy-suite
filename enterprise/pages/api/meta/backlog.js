import { auditLog } from '../../../lib/audit.js';
let BACKLOG=[];
export default function handler(req,res){
  if(req.method==='GET'){ return res.json({ backlog: BACKLOG }); }
  if(req.method==='POST'){
    const item = { id: 'm'+Date.now(), ...req.body, status:'proposed' };
    BACKLOG.push(item); auditLog({ action:'meta:backlog:add', details:item });
    return res.json({ ok:true, item });
  }
  res.status(405).end();
}
