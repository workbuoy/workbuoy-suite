# Dev Superprompt — Phase B + C (delta-mode, code included)

## Branch & apply
```
git checkout -b feat/superprompt-bc
# unzip here
git add .
git commit -m "feat(superprompt-bc): APIs (CRM/Tasks/Log), explain templates, policy cache, audit batching, spans, UI wiring, OpenAPI, tests, docs"
git push -u origin feat/superprompt-bc
```

## Wire routers
Add to `src/server.ts`:
```ts
import { crmRouter } from "./features/crm/contacts.controller";
import { tasksRouter } from "./features/tasks/tasks.controller";
import { logRouter } from "./features/log/log.controller";
import buoyRoutes from "./core/http/routes/buoy"; // if not already

app.use(crmRouter);
app.use(tasksRouter);
app.use(logRouter);
app.use(buoyRoutes);
```

## Run tests
```
npm ci
npm run typecheck
npm run lint
npm test
```

## OpenAPI lint
- Validate `openapi/*.yaml` with your CI job.

## Frontend
Drop `frontend/src/*` files into your Vite React app and import components in your Navi shell.
