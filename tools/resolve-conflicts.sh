#!/bin/bash
echo "[merge] resolving conflicts with safe rules..."

for f in backend/jest.meta.config.cjs backend/package.json          backend/routes/admin.roles.ts backend/routes/admin.subscription.ts          backend/routes/dev.runner.ts backend/routes/features.ts          backend/routes/proactivity.ts backend/routes/usage.ts          prisma/schema.prisma src/core/proactivity/context.ts; do
  if [ -f "$f" ]; then
    echo "[merge] keeping local version of $f (HEAD)"
    git checkout --ours "$f"
    git add "$f"
  fi
done

echo "[merge] auto-resolve done."
