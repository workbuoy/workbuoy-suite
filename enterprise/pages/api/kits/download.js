import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

export default function handler(req,res){
  const { token } = req.query || {};
  if(!token) return res.status(400).json({error:'missing_token'});
  const db = new sqlite3.Database(path.join(process.cwd(),'db','workbuoy.db'));
  db.get(`SELECT * FROM purchases WHERE download_token=?`, [token], (err,row)=>{
    if(err) return res.status(500).json({error:'db_error'});
    if(!row) return res.status(404).json({error:'not_found'});
    const filePath = path.join(process.cwd(),'public','downloads', `${token}.pdf`);
    if(!fs.existsSync(filePath)) return res.status(404).json({error:'file_not_ready'});
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="kit.pdf"');
    fs.createReadStream(filePath).pipe(res);
  });
}
