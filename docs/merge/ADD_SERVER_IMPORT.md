# Mounting V2 routes safely

Add this single line near other route imports in `src/server.ts`:

```ts
import { maybeMountPersistenceV2 } from './src/routes/_autoload.persistence.v2';
```

and after the app is created and core middleware are mounted:

```ts
maybeMountPersistenceV2(app);
```

- This is no-op unless `FF_PERSISTENCE==='true'`.
- No existing routes are affected.
