
import path from 'path'; import sqlite3 from 'sqlite3';
import { requireTenant } from '../../../lib/middleware/tenant.js';
const DB_PATH=process.env.DB_PATH||path.join(process.cwd(),'db','workbuoy.db');
export default function handler(req,res){
  const tenant_id=requireTenant(req,res); if(!tenant_id) return;
  const db=new sqlite3.Database(DB_PATH);
  if(req.method==='GET'){
    db.get(`SELECT recognize_other_buoy FROM tenant_settings WHERE tenant_id=?`, [tenant_id], (e,row)=>{
      if(e) return res.status(500).json({error:'db_error'});
      res.json({ recognize_other_buoy: row?.recognize_other_buoy===1 });
    });
  }else if(req.method==='POST'){
    const { recognize_other_buoy=false } = req.body||{};
    db.run(`INSERT INTO tenant_settings(tenant_id,recognize_other_buoy) VALUES(?,?) ON CONFLICT(tenant_id) DO UPDATE SET recognize_other_buoy=excluded.recognize_other_buoy`, [tenant_id, recognize_other_buoy?1:0], (e)=>{
      if(e) return res.status(500).json({error:'db_error'});
      res.json({ok:true});
    });
  }else{
    res.status(405).json({error:'method_not_allowed'});
  }
}
