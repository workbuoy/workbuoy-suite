// Generate release/manifest.json with sha256 for files in ./release_artifacts
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ART_DIR = process.argv[2] || 'release_artifacts';
const outDir = 'release';
fs.mkdirSync(outDir, { recursive: true });

function sha256(file){
  const h = crypto.createHash('sha256');
  h.update(fs.readFileSync(file));
  return h.digest('hex');
}

function walk(dir){
  const entries = [];
  for (const name of fs.readdirSync(dir)){
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) entries.push(...walk(p));
    else entries.push(p);
  }
  return entries;
}

const files = fs.existsSync(ART_DIR) ? walk(ART_DIR) : [];
const manifest = {
  version: fs.existsSync('VERSION') ? fs.readFileSync('VERSION','utf8').trim() : '0.0.0',
  createdAt: new Date().toISOString(),
  artifacts: files.map(f=>({ file: f.replace(/^\.\//,''), sha256: sha256(f), size: fs.statSync(f).size }))
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Wrote release/manifest.json with', manifest.artifacts.length, 'artifacts');
