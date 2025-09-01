
// Per-connector circuit breaker with cooldowns
import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');
function withDb(cb){ const db=new sqlite3.Database(DB_PATH); db.serialize(()=>cb(db)); db.close(); }

const STATES = { CLOSED:'closed', OPEN:'open', HALF:'half_open' };
const THRESHOLD = 5;
const COOLDOWN_SEC = 60;

function now(){ return Math.floor(Date.now()/1000); }

export class CircuitBreaker{
  constructor(connector){
    this.connector = connector;
    this.state = STATES.CLOSED;
    this.failures = 0;
    this.lastFailure = 0;
    this.lastSuccess = 0;
  }
  static ensureTable(){
    withDb(db=>{
      db.run(`CREATE TABLE IF NOT EXISTS integration_health(
        connector TEXT PRIMARY KEY, status TEXT, last_success_at TEXT,
        open_errors INTEGER DEFAULT 0, p95_ms REAL DEFAULT 0, updated_at TEXT DEFAULT (datetime('now'))
      )`);
    });
  }
  recordSuccess(latencyMs=0){
    this.failures = 0;
    this.state = STATES.CLOSED;
    this.lastSuccess = now();
    withDb(db=>{
      db.run(`INSERT OR REPLACE INTO integration_health(connector,status,last_success_at,open_errors,p95_ms,updated_at) VALUES(?,?,?,?,?,datetime('now'))`,
        [this.connector, 'healthy', new Date(this.lastSuccess*1000).toISOString(), 0, latencyMs]);
    });
  }
  recordFailure(){
    this.failures += 1;
    this.lastFailure = now();
    if(this.failures >= THRESHOLD){
      this.state = STATES.OPEN;
      withDb(db=>{
        db.run(`INSERT OR REPLACE INTO integration_health(connector,status,last_success_at,open_errors,p95_ms,updated_at) VALUES(?,?,?,?,?,datetime('now'))`,
          [this.connector, 'open', new Date(this.lastSuccess*1000).toISOString(), this.failures, 0]);
      });
    }
  }
  canAttempt(){
    if(this.state===STATES.CLOSED) return true;
    if(this.state===STATES.OPEN){
      if(now() - this.lastFailure > COOLDOWN_SEC){
        this.state = STATES.HALF;
        return true;
      }
      return false;
    }
    if(this.state===STATES.HALF) return true;
    return true;
  }
}

const breakers = new Map();
export function getBreaker(connector){
  if(!breakers.has(connector)) breakers.set(connector, new CircuitBreaker(connector));
  return breakers.get(connector);
}
export function reportHealth(){
  return new Promise(resolve=>{
    withDb(db=>{
      db.all(`SELECT * FROM integration_health ORDER BY connector`, [], (e, rows)=>{
        resolve(rows||[]);
      });
    });
  });
}
