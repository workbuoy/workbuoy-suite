#!/usr/bin/env node
const fs = require('fs');
const { createRequire } = require('module');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const schema = require('./role.schema.json');
const requireFromHere = createRequire(__filename);
const rolesPath = requireFromHere.resolve('@workbuoy/roles-data/roles.json');
const roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
const ajv = new Ajv({allErrors:true, strict:false}); addFormats(ajv);
const validate = ajv.compile(schema);
let ok = true; const ids = new Set();
for (const r of roles) {
  if(!validate(r)) { console.error(validate.errors); ok=false; }
  if(ids.has(r.role_id)) { console.error('duplicate role_id', r.role_id); ok=false; } else { ids.add(r.role_id); }
}
if(!ok){ process.exit(1);} else { console.log('Validated', roles.length, 'roles from', rolesPath, 'OK'); }
