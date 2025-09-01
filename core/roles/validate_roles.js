#!/usr/bin/env node
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const roles = require('./roles.json');
const schema = require('./role.schema.json');
const ajv = new Ajv({allErrors:true, strict:false}); addFormats(ajv);
const validate = ajv.compile(schema);
let ok = true; const ids = new Set();
for (const r of roles) {
  if(!validate(r)) { console.error(validate.errors); ok=false; }
  if(ids.has(r.role_id)) { console.error('duplicate role_id', r.role_id); ok=false; } else { ids.add(r.role_id); }
}
if(!ok){ process.exit(1);} else { console.log('Validated', roles.length, 'roles OK'); }
