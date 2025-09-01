const log = require('./logger');
const { span } = require('./otel');

async function runInsights(db, orgId) {
  return span('ai.insights.run', (sp)=>{
    // Very basic aggregation example (counts per entity)
    return new Promise((resolve) => {
      db.all(`SELECT 'deals' as t, COUNT(*) as c FROM deals WHERE org_id=?
              UNION ALL SELECT 'tickets', COUNT(*) FROM tickets WHERE org_id=?
              UNION ALL SELECT 'meetings', COUNT(*) FROM meetings WHERE org_id=?`, 
        [orgId, orgId, orgId], (err, rows)=>{
          if (err) { log.error('insights error', err.message); resolve(null); return; }
          resolve(rows || []);
        });
    });
  });
}

module.exports = { runInsights };
