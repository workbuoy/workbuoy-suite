CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FeatureUsageAction') THEN
    CREATE TYPE "FeatureUsageAction" AS ENUM ('open', 'complete', 'dismiss');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Role" (
  "role_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "inherits" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "featureCaps" JSONB,
  "scopeHints" JSONB,
  "profile" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

CREATE TABLE IF NOT EXISTS "Feature" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "defaultAutonomyCap" INTEGER NOT NULL DEFAULT 3,
  "capabilities" TEXT[] NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OrgRoleOverride" (
  "tenant_id" TEXT NOT NULL,
  "role_id" TEXT NOT NULL,
  "featureCaps" JSONB,
  "disabledFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrgRoleOverride_pkey" PRIMARY KEY ("tenant_id", "role_id")
);

CREATE INDEX IF NOT EXISTS "OrgRoleOverride_role_id_idx" ON "OrgRoleOverride" ("role_id");

CREATE TABLE IF NOT EXISTS "UserRole" (
  "user_id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "primaryRole" TEXT NOT NULL,
  "secondaryRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE IF NOT EXISTS "FeatureUsage" (
  "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
  "userId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "featureId" TEXT NOT NULL,
  "action" "FeatureUsageAction" NOT NULL,
  "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  CONSTRAINT "FeatureUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FeatureUsage_userId_idx" ON "FeatureUsage" ("userId");
CREATE INDEX IF NOT EXISTS "FeatureUsage_featureId_idx" ON "FeatureUsage" ("featureId");
CREATE INDEX IF NOT EXISTS "FeatureUsage_tenantId_idx" ON "FeatureUsage" ("tenantId");
