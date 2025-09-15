# PR11 — Overdue → Reminder (suggest-only)

## Innhold
- `src/flows/overdue-to-reminder.ts` — kobler `finance.overdue.detected` → `orchestrator.suggestReminder`.
- `src/routes/finance.reminder.ts` — `POST /api/finance/reminder/suggest` for dev/test.
- `openapi/finance.yaml` — spes for reminderen.
- `tests/finance/reminder.e2e.test.ts` — supertest-røyk, forventer draftEmail i responsen.

## Montering i server
Gi app'en en finance-connector og mount ruten:
```ts
import { financeReminderRouter } from './routes/finance.reminder';
import { MockFinanceConnector } from './connectors/finance.mock';

app.set('financeConnector', new MockFinanceConnector()); // eller ekte connector senere
app.use('/api/finance', financeReminderRouter());
```

## Forventet
- `POST /api/finance/reminder/suggest` → `{ outcome: { draftEmail }, policy: {...} }` (policy L≥2).
- IntentLog får rader når orchestrator/runner er i bruk.
- Ingen auto-send; kun utkast i denne PR-en.
