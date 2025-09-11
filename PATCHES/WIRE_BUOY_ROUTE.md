# Wire Buoy endpoint into Express app

Edit `src/server.ts` (or your main express setup):

```ts
import express from "express";
import buoyRoutes from "./core/http/routes/buoy";

const app = express();
app.use(express.json());

// ensure your requestContext (if any) runs BEFORE policy and routes
// app.use(requestContext);

app.use(buoyRoutes);

export default app;
```

Run the tests:
```
npm test -- --runTestsByPath tests/buoy/agent.test.ts tests/http/buoyRoutes.test.ts
```
