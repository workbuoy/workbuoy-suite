import path from 'path'; import sqlite3 from 'sqlite3';
const DB_PATH=process.env.DB_PATH||path.join(process.cwd(),'db','workbuoy.db');
export default function handler(req,res){
  const db=new sqlite3.Database(DB_PATH);
  db.get(`SELECT 1 as ok`, [], (e,row)=>{
    if(e){ res.status(503).json({ok:false,error:'db_unavailable'}); }
    else{ res.status(200).json({ok:true}); }
    db.close();
  });
}
