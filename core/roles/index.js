// Core roles loader with tolerant parsing (trailing commas / multiple arrays)
const fs = require('fs');
const { createRequire } = require('module');

const requireFromHere = createRequire(__filename);

function loadRoles() {
  const p = requireFromHere.resolve('@workbuoy/roles-data/roles.json');
  try {
    // First try strict JSON
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    // Fallback: sanitize and merge if multiple arrays exist
    let txt = fs.readFileSync(p, 'utf8');
    // Remove trailing commas before ] or }
    txt = txt.replace(/,\s*(\]|\})/g, '$1');
    // If multiple arrays present, merge them
    const arrays = txt.match(/\[[\s\S]*?\]/g);
    if (arrays && arrays.length > 1) {
      const items = arrays.map(a => {
        try { return JSON.parse(a); } catch { return []; }
      }).flat();
      return items;
    }
    // Last attempt
    return JSON.parse(txt);
  }
}

const roles = loadRoles();
module.exports = { roles };
