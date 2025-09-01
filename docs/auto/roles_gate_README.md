# Roles Gate – How to Pass
1) Install validator deps: `npm i -D ajv ajv-formats`
2) Normalize + validate: `node core/roles/validate_roles.js`
3) If it fails: review `reports/roles/*.json` and optionally run `tools/roles/normalize_roles.py core/roles/roles.json out.json` and iterate.
4) Gate is green when:
   - all entries have `role_id`, `title`, `category`
   - `role_id` values are unique
