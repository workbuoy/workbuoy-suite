#!/bin/bash
echo "[merge] resolving conflicts with safe rules..."

for f in apps/backend/jest.meta.config.cjs apps/backend/package.json          apps/backend/routes/admin.roles.ts apps/backend/routes/admin.subscription.ts          apps/backend/routes/dev.runner.ts apps/backend/routes/features.ts          apps/backend/routes/proactivity.ts apps/backend/routes/usage.ts          prisma/schema.prisma src/core/proactivity/context.ts; do
  if [ -f "$f" ]; then
    echo "[merge] keeping local version of $f (HEAD)"
    git checkout --ours "$f"
    git add "$f"
  fi
done

echo "[merge] auto-resolve done."
