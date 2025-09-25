# Debug routes (dev only)
Mount:
```ts
import { debugDlqRouter } from './routes/debug.dlq';
import { debugCircuitRouter } from './routes/debug.circuit';
app.use('/api', debugDlqRouter());
app.use('/api', debugCircuitRouter());
```
Prereqs:
- app.set('eventBus', busWithGetDLQ)
- app.set('financeConnector', resilientConnector)
