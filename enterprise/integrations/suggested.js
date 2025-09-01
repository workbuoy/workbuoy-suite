import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(),'db','workbuoy.db');

function withDb(cb){
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(()=>cb(db));
  db.close();
}

function readLastScan(user_id){
  return new Promise(resolve=>{
    withDb(db=>{
      db.get(`SELECT snapshot FROM last_seen WHERE user_id=? AND entity_type='integration_scan' AND entity_id=?`,
        [user_id, user_id], (err,row)=>{
          if(row && row.snapshot){
            try{ resolve(JSON.parse(row.snapshot)); }catch(_){ resolve(null); }
          } else resolve(null);
      });
    });
  });
}

function readStatus(user_id){
  return new Promise(resolve=>{
    withDb(db=>{
      db.all(`SELECT provider,status FROM integrations_status WHERE user_id=?`, [user_id], (err,rows)=>{
        const map = {}; (rows||[]).forEach(r=> map[r.provider]=r.status); resolve(map);
      });
    });
  });
}

function loadCatalog(){
  try{
    const p = path.join(process.cwd(),'public','config','integrations.catalog.json');
    return JSON.parse(fs.readFileSync(p,'utf-8'));
  }catch(e){ return {providers:[]}; }
}

export default async function handler(req,res){
  const user_id = (req.headers['x-user-id'] || 'demo').toString();
  try{
    const scan = await readLastScan(user_id);
    const statusMap = await readStatus(user_id);
    const catalog = loadCatalog().providers;
    const suggestions = [];

    const domain = (scan && scan.email_domain) || '';
    const found = (scan && scan.found) || [];

    function push(id, reason){
      const p = catalog.find(x=>x.id===id);
      if(!p) return;
      suggestions.push({ id:p.id, label:p.label, scopes:p.scopes, reason, status: statusMap[p.id] || 'not_connected' });
    }

    if(/google|gmail/.test(domain)) push('google-workspace',['email_domain_google']);
    if(/microsoft|outlook|office|live/.test(domain)) { push('microsoft-graph',['email_domain_m365']); push('teams',['email_domain_m365']); }

    found.forEach(f=>{
      const v=(f.vendor||'').toLowerCase(), pr=(f.product||'').toLowerCase();
      if(v==='slack') push('slack',['slack_found']);
      if(v==='atlassian'|| pr==='jira') push('jira',['jira_found']);
      if(v==='github') push('github',[(f.auth?'github_cli_authed':'github_found')]);
      if(v==='microsoft' && (pr==='m365'||pr==='teams')) { push('microsoft-graph',['m365_found']); push('teams',['teams_found']); }
      if(v==='google' && pr==='workspace') push('google-workspace',['workspace_found']);
    });

    ['d365','salesforce','hubspot','powerbi','qlik','tableau','jira','github','gitlab','slack','zoom'].forEach(id=>{
      if(!suggestions.find(s=>s.id===id)) push(id,['standard_recommendation']);
    });

    res.json({ ok:true, data:{ suggested: suggestions } });
  }catch(e){
    res.status(500).json({ok:false, error: e.message});
  }
}
