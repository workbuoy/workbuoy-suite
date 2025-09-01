import crypto from 'crypto'; import sqlite3 from 'sqlite3'; import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
export default function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  const { email } = req.body||{}; if(!email) return res.status(400).json({error:'missing_email'});
  const token = crypto.randomBytes(24).toString('hex');
  const db=new sqlite3.Database(DB_PATH);
  db.run(`INSERT INTO magic_links(token,email) VALUES(?,?)`, [token,email], (err)=>{
    if(err) return res.status(500).json({error:'db_error'});
    const url = `${req.headers.origin||''}/portal/onboarding?token=${token}`; res.json({ ok:true, magic_link:url });
  });
}
