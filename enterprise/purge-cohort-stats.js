/**
 * Purge signal_cohort_stats older than 90 days.
 * We reuse the same SQLite DB (no new tables). If the table doesn't exist, no-op.
 */
import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
const db = new sqlite3.Database(DB_PATH);
db.serialize(()=>{
  db.run(`DELETE FROM signal_cohort_stats WHERE ts < datetime('now','-90 days')`, [], function(err){
    if(err){
      console.warn('[purge-cohort-stats] WARN', err.message);
    } else {
      console.log('[purge-cohort-stats] removed rows:', this.changes);
    }
  });
});
db.close();
