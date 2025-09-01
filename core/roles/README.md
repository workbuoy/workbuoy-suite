# Move Role Library to Core

- Source: `/mnt/data/repo_core_check/enterprise/data/roles/roles.json`
- Target: `core/roles/roles.json`

## How to apply
1) Create directory `core/roles/` in repo.
2) Move roles.json there (from source above).
3) Add `core/roles/index.js`, `role.schema.json`, `validate_roles.js` (files in this patch).
4) If Enterprise had its own roles module, replace its content with:
```js
module.exports = require('../../core/roles');
```
5) Add CI step:
```bash
npm i -D ajv ajv-formats
node core/roles/validate_roles.js
```
