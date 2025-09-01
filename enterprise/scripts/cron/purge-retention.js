const fs = require('fs');
const path = require('path');
const { getDB } = require('../../lib/secure/dsr');

function days(n) { return n * 24 * 60 * 60 * 1000; }

function loadRules() {
  const jsonPath = process.env.RETENTION_CONFIG || path.join(process.cwd(), 'config', 'retention.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Retention config missing at ${jsonPath}`);
  }
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

function run() {
  const rules = loadRules();
  const db = getDB();
  const tables = rules.tables || {};

  Object.entries(tables).forEach(([table, cfg]) => {
    const keep = Number(cfg.keep_days || 0);
    const tscol = cfg.ts_column || 'created_at';
    const cutoff = new Date(Date.now() - keep * 86400000).toISOString();
    try {
      const stmt = db.prepare(`DELETE FROM ${table} WHERE ${tscol} < ?`);
      const info = stmt.run(cutoff);
      console.log(`[retention] ${table}: deleted ${info.changes} rows older than ${cutoff}`);
    } catch (err) {
      console.warn(`[retention] skipping ${table}: ${err.message}`);
    }
  });
}

if (require.main === module) {
  try { run(); process.exit(0); }
  catch (e) { console.error(e); process.exit(1); }
}

module.exports = { run };
