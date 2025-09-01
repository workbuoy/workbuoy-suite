import { recordFeedback } from '../../../lib/signals.learning.js';

export default async function handler(req, res){
  if(req.method !== 'POST'){
    res.status(405).json({ok:false, error:'Method not allowed'}); return;
  }
  try{
    const { signal_id, action, type } = req.body||{};
    if(!signal_id || !action){ res.status(400).json({ok:false, error:'Missing signal_id or action'}); return; }
    const user_id = (req.headers['x-user-id'] || 'demo').toString();
    recordFeedback({user_id, signal_id, type, action});

    const { default: sqlite3 } = await import('sqlite3');
    const { default: path } = await import('path');
    const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
    const db = new sqlite3.Database(DB_PATH);
    await new Promise(resolve=> db.run(`CREATE TABLE IF NOT EXISTS signal_feedback(
      user_id TEXT, signal_id TEXT, action TEXT, ts TEXT DEFAULT (datetime('now'))
    )`, [], resolve));
    await new Promise(resolve=> db.run(`INSERT INTO signal_feedback(user_id,signal_id,action) VALUES(?,?,?)`,
      [user_id, String(signal_id), String(action)], resolve));
    db.close();
    res.json({ok:true});
  }catch(e){
    res.status(500).json({ok:false, error: e.message });
  }
}
