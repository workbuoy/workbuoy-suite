# Wire DB flag into controllers

Example for Tasks controller:

```ts
import { dbEnabled } from "../../core/config/dbFlag";

// at top with stores
import * as mem from "./tasks.store";
let repo = mem;
try {
  if (dbEnabled()) {
    repo = require("../tasks/tasks.repo"); // prisma-backed repo
  }
} catch { /* fallback to mem */ }

// then use repo.list/create/patch/remove
```

Set in staging:
```
DB_ENABLED=true
```
