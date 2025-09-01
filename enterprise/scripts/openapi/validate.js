const fs = require('fs'); const path = require('path'); const yaml = require('js-yaml');
try{
  const p = path.join(process.cwd(),'api','openapi.yaml');
  const doc = yaml.load(fs.readFileSync(p,'utf8'));
  if(!doc || !doc.paths) throw new Error('Invalid OpenAPI: missing paths');
  console.log('OpenAPI looks valid with', Object.keys(doc.paths).length, 'paths');
  process.exit(0);
}catch(e){ console.error('OpenAPI validation failed:', e.message); process.exit(1); }
