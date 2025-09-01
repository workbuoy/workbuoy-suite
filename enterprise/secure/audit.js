const __fs_mod = await import('fs'); const fs = __fs_mod.default || __fs_mod;
const __path_mod = await import('path'); const path = __path_mod.default || __path_mod;
const __crypto_mod = await import('crypto'); const crypto = __crypto_mod.default || __crypto_mod;
const { SiemClient } = require('./siem');

const LOG_DIR = process.env.AUDIT_LOG_DIR || path.join(process.cwd(), 'logs', 'worm');
fs.mkdirSync(LOG_DIR, { recursive: true });

function hash(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

function getLogFile() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return path.join(LOG_DIR, `${y}-${m}-${day}.jsonl`);
}

let lastHash = null;
function loadLastHash(file) {
  try {
    const data = fs.readFileSync(file, 'utf8');
    const lastLine = data.trim().split('\n').pop();
    if (!lastLine) return null;
    const parsed = JSON.parse(lastLine);
    return parsed.chain.hash;
  } catch (_) {
    return null;
  }
}

async function writeAudit(event) {
  const file = getLogFile();
  if (lastHash === null) lastHash = loadLastHash(file);
  const entry = { ts: new Date().toISOString(), event, chain: { prev: lastHash } };
  entry.chain.hash = hash(entry);
  fs.appendFileSync(file, JSON.stringify(entry) + '\n', { encoding: 'utf8', mode: 0o600 });
  lastHash = entry.chain.hash;

  try {
    const siem = new SiemClient();
    await siem.stream({ ...event, _worm: { ts: entry.ts, hash: entry.chain.hash, prev: entry.chain.prev } });
  } catch (err) {
    const fallback = path.join(LOG_DIR, 'siem-forward-errors.jsonl');
    fs.appendFileSync(fallback, JSON.stringify({ ts: new Date().toISOString(), error: String(err) }) + '\n');
  }

  return entry;
}

module.exports = { writeAudit };
