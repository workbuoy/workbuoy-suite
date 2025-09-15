# Upload guide (src-layout)

1) Create PR branch (e.g. `cleanup/unify-eventbus`) → **Add file → Upload files**.
2) Upload the *contents* of this archive into the **repo root**.
3) Open PR. After merge, run the app and smoke-test:

```
npm run dev
curl -s http://localhost:3000/_debug/bus | jq .
curl -s http://localhost:3000/api/addons | jq .
```
