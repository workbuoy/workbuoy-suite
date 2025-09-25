# PR AD: Security & Hardening polish

## Endringsplan
- **Helmet**: streng CSP + security headers (`src/security/helmet.ts`)
- **CORS**: allowlist-basert (`src/security/cors.ts`)
- **Rate limiting**: egne limiter for API og webhooks (`src/security/rateLimit.ts`)
- **Secrets-rotasjon**: filbasert secrets store med rotasjonsdeteksjon (`src/security/secrets.ts`)
- **RBAC e2e-test**: `backend/tests/rbac_policy.test.ts`
- **Webhook rate limit test**: `backend/tests/rate_limit_webhook.test.ts`
- **Secrets-rotasjon test**: `backend/tests/secrets_rotation.test.ts`
- **Docs**: `docs/SECURITY_HARDENING.md`
- **CI**: `.github/workflows/security-hardening-tests.yml`

## Bruk i app
I din `app.ts`:
```ts
import { buildHelmet } from './security/helmet';
import { buildCors } from './security/cors';
import { buildApiLimiter, buildWebhookLimiter } from './security/rateLimit';

app.use(buildHelmet());
app.use(buildCors());
app.use('/api', buildApiLimiter());
app.use('/api/v1/connectors', buildWebhookLimiter());
```

## Kommandoer
```bash
cd backend
npm ci
npm run build
npm test
node dist/index.js
```

## Rollback
- Ta ut limiter og CORS-middleware fra `app.ts` om nødvendig, eller justér terskler via miljøvariabler.
