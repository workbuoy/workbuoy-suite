import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>cb(db));
  db.close();
}

export function readAccounts(limit=100){
  return Promise.resolve([
    { id:'ACME', name:'ACME Corp', segment:'key_accounts', renewalDate: daysFromNow(20) },
    { id:'CONSOL', name:'Consolidated', segment:'standard', renewalDate: daysFromNow(5) }
  ]);
}

export function readOpportunities(stalledDays=14){
  return Promise.resolve([
    { id:'OPP-1001', accountId:'ACME', name:'Expansion EU', amount:120000, stage:'Proposal', daysSinceActivity: 18 },
    { id:'OPP-1002', accountId:'CONSOL', name:'Renewal 2025', amount:45000, stage:'Negotiation', daysSinceActivity: 3 }
  ]).then(list=> list.filter(x=>x.daysSinceActivity>=stalledDays));
}

function daysFromNow(d){
  const dt = new Date(Date.now()+d*24*3600*1000);
  return dt.toISOString().slice(0,10);
}
