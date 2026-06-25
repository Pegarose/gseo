-- Credit pricing system: global markup, per-feature pricing, ledger

CREATE TABLE IF NOT EXISTS "CreditPricingGlobal" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "defaultMarkupMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CreditPricingGlobal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CreditFeaturePricing" (
    "id" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerCostCredits" INTEGER NOT NULL DEFAULT 0,
    "sellCredits" INTEGER NOT NULL DEFAULT 1,
    "useAutoMarkup" BOOLEAN NOT NULL DEFAULT true,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CreditFeaturePricing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CreditFeaturePricing_featureKey_key" ON "CreditFeaturePricing"("featureKey");
CREATE INDEX IF NOT EXISTS "CreditFeaturePricing_category_idx" ON "CreditFeaturePricing"("category");
CREATE INDEX IF NOT EXISTS "CreditFeaturePricing_provider_idx" ON "CreditFeaturePricing"("provider");

CREATE TABLE IF NOT EXISTS "CreditLedgerEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "provider" TEXT,
    "providerCost" INTEGER NOT NULL DEFAULT 0,
    "sellCredits" INTEGER NOT NULL,
    "cached" BOOLEAN NOT NULL DEFAULT false,
    "siteId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CreditLedgerEntry_tenantId_idx" ON "CreditLedgerEntry"("tenantId");
CREATE INDEX IF NOT EXISTS "CreditLedgerEntry_tenantId_createdAt_idx" ON "CreditLedgerEntry"("tenantId", "createdAt");
CREATE INDEX IF NOT EXISTS "CreditLedgerEntry_featureKey_idx" ON "CreditLedgerEntry"("featureKey");

ALTER TABLE "CreditLedgerEntry" ADD CONSTRAINT "CreditLedgerEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuotaUsage" ADD COLUMN IF NOT EXISTS "featureKey" TEXT;
ALTER TABLE "QuotaUsage" ADD COLUMN IF NOT EXISTS "provider" TEXT;
ALTER TABLE "QuotaUsage" ADD COLUMN IF NOT EXISTS "providerCost" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "QuotaUsage" ADD COLUMN IF NOT EXISTS "cached" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "QuotaUsage_featureKey_idx" ON "QuotaUsage"("featureKey");
