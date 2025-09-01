import crypto from 'crypto';
import sqlite3 from 'sqlite3';
import path from 'path';
import { signToken } from '../../../lib/auth.js';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

export default function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'method_not_allowed'});
  const { email, password } = req.body || {};
  if(!email || !password) return res.status(400).json({error:'missing_credentials'});
  const db = new sqlite3.Database(DB_PATH);
  db.get(`SELECT email,password_sha256,roles FROM users WHERE email=?`, [email], (err, row)=>{
    if(err){ console.error(err); return res.status(500).json({error:'db_error'}); }
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if(!row || row.password_sha256 !== hash) return res.status(401).json({error:'invalid_credentials'});
    const token = signToken({ email: row.email, roles: row.roles.split(','), policies: {} });
    res.json({ token });
    db.close();
  });
}
