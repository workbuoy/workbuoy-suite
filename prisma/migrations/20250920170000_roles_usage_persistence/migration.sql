-- CreateEnum
CREATE TYPE "FeatureUsageAction" AS ENUM ('open', 'complete', 'dismiss');

-- CreateTable
CREATE TABLE "Role" (
    "roleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "inherits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featureCaps" JSONB,
    "scopeHints" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "defaultAutonomyCap" INTEGER NOT NULL DEFAULT 3,
    "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgRoleOverride" (
    "tenantId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "featureCaps" JSONB,
    "disabledFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgRoleOverride_pkey" PRIMARY KEY ("tenantId","roleId")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "primaryRole" TEXT NOT NULL,
    "secondaryRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "FeatureUsage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "action" "FeatureUsageAction" NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionSetting" (
    "tenantId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'flex',
    "killSwitch" BOOLEAN NOT NULL DEFAULT false,
    "secureTenant" BOOLEAN NOT NULL DEFAULT false,
    "maxOverride" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionSetting_pkey" PRIMARY KEY ("tenantId")
);

-- CreateIndex
CREATE INDEX "Role_title_idx" ON "Role"("title");

-- CreateIndex
CREATE INDEX "OrgRoleOverride_tenantId_idx" ON "OrgRoleOverride"("tenantId");

-- CreateIndex
CREATE INDEX "UserRole_primaryRole_idx" ON "UserRole"("primaryRole");

-- CreateIndex
CREATE INDEX "FeatureUsage_userId_idx" ON "FeatureUsage"("userId");

-- CreateIndex
CREATE INDEX "FeatureUsage_featureId_idx" ON "FeatureUsage"("featureId");

-- CreateIndex
CREATE INDEX "FeatureUsage_tenantId_userId_idx" ON "FeatureUsage"("tenantId", "userId");

