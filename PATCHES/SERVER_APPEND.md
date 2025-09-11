Edit `src/server.ts` and add:

```ts
import taskRoutes from "./features/tasks/tasks.route";
import logRoutes from "./features/log/log.route";

app.use(taskRoutes);
app.use(logRoutes);
```
