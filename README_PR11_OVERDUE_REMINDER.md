
# PR11 — Overdue → Reminder (suggest-only)

## Innhold
- `src/flows/overdue-to-reminder.ts` — lytter på `finance.overdue.detected` og kaller `finance.suggestReminder` (autonomy 3, suggest-only)
- `src/core/http/routes/finance.reminder.ts` — `POST /api/finance/reminder/suggest` → `{ outcome: { draftEmail }, policy, mode }`
- `src/core/http/routes/finance.overdue.dev.ts` — dev: `POST /api/_dev/finance/overdue` som emitter event på bus
- `tests/e2e/finance.reminder.test.ts` — supertest-røyk

## Wiring
I `src/server.ts`:
```ts
import { financeReminderRouter } from './core/http/routes/finance.reminder';
import { financeOverdueDevRouter } from './core/http/routes/finance.overdue.dev';
import { registerOverdueToReminder } from './flows/overdue-to-reminder';
import { FinanceOrchestrator } from './finance/orchestrator';
import { MockFinanceConnector } from './connectors/finance.mock';

app.use(financeReminderRouter());
if (process.env.NODE_ENV !== 'production') {
  app.use(financeOverdueDevRouter());
}

if (process.env.FF_FINANCE_REMINDER === '1') {
  registerOverdueToReminder(new FinanceOrchestrator(MockFinanceConnector));
}
```

## Røyk
```bash
curl -X POST http://localhost:3000/api/finance/reminder/suggest   -H 'content-type: application/json' -d '{"invoiceId":"INV-77"}'

curl -X POST http://localhost:3000/api/_dev/finance/overdue   -H 'content-type: application/json' -d '{"invoiceId":"INV-77"}'
```
