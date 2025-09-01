import cron from 'node-cron';
import { upsertSalesFacts } from '../lib/connectors/analytics.js';
import { generateAnalyticsSignals } from '../lib/rules/analytics.sales.js';
import { generateCrmSignals } from '../lib/rules/crm.sales.js';
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>cb(db));
  db.close();
}

async function runOnce(){
  const today = new Date().toISOString().slice(0,10);
  const demo = [
    { date:today, customer_id:'ACME', product_id:'Core',  ytd:920000, ly_ytd:1100000, qtd:200000, lq_qtd:250000, mtd:60000, lm_mtd:90000, target:300000 },
    { date:today, customer_id:'ACME', product_id:'AddOn', ytd:110000, ly_ytd:80000,   qtd:30000,  lq_qtd:20000,  mtd:10000, lm_mtd:5000,   target:50000  },
    { date:today, customer_id:'CONSOL', product_id:'Core',ytd:200000, ly_ytd:180000,  qtd:60000,  lq_qtd:40000,  mtd:20000, lm_mtd:21000,  target:90000  }
  ];
  upsertSalesFacts(demo);

  const sales = await generateAnalyticsSignals({date:today});
  const crm = await generateCrmSignals();
  const signals = [...sales, ...crm];

  withDb(db=>{
    db.run(`CREATE TABLE IF NOT EXISTS signals(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT DEFAULT (datetime('now')),
      type TEXT, title TEXT,
      urgency REAL, impact REAL, severity TEXT,
      payload TEXT
    )`);
    const stmt = db.prepare(`INSERT INTO signals(type,title,urgency,impact,severity,payload) VALUES(?,?,?,?,?,?)`);
    signals.forEach(s=> stmt.run([s.type, s.title, 0.6, 0.7, 'info', JSON.stringify(s.payload||{})]));
    stmt.finalize();
  });

  try{
    const { signalsEmitted } = await import('../lib/metrics/signals.js').catch(()=>({signalsEmitted:null}));
    if(signalsEmitted){ signals.forEach(s=> signalsEmitted.labels({type:s.type, source:'scheduler'}).inc()); }
  }catch(e){}
}

if(process.env.NODE_ENV !== 'test'){
  cron.schedule('*/30 * * * *', runOnce);
  runOnce();
}

export default runOnce;
