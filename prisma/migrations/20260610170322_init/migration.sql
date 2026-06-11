-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'custom',
    "defaultLocale" TEXT NOT NULL DEFAULT 'en-US',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "normalizedUrl" TEXT NOT NULL,
    "pageType" TEXT NOT NULL DEFAULT 'generic',
    "targetKeyword" TEXT,
    "locale" TEXT NOT NULL,
    "lastScoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "scopes" TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotaUsage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT,
    "endpoint" TEXT NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 1,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuotaUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreSnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "pageId" TEXT,
    "url" TEXT NOT NULL,
    "normalizedUrl" TEXT NOT NULL,
    "scoreVersion" TEXT NOT NULL DEFAULT 'seosuite-score-v1.1',
    "finalScore" INTEGER NOT NULL,
    "scoreBand" TEXT NOT NULL,
    "pageType" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreModuleResult" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "scoreSnapshotId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreModuleResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditIssue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "scoreSnapshotId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "evidenceJson" JSONB NOT NULL,
    "recommendation" TEXT NOT NULL,
    "implementationHint" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "scoreSnapshotId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "implementationHint" TEXT,
    "estimatedEffort" TEXT NOT NULL,
    "estimatedImpact" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "siteId" TEXT,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "encryptedCreds" TEXT NOT NULL,
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderEnrichment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "scoreSnapshotId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestMetaJson" JSONB,
    "responseMetaJson" JSONB,
    "normalizedDataJson" JSONB,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderEnrichment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalLinkOpportunity" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "scoreSnapshotId" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "anchorSuggestion" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternalLinkOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiVisibilityCheck" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "scoreSnapshotId" TEXT NOT NULL,
    "aiVisibilityReadinessScore" INTEGER NOT NULL,
    "answerability" DOUBLE PRECISION NOT NULL,
    "citationReadiness" DOUBLE PRECISION NOT NULL,
    "entityClarity" DOUBLE PRECISION NOT NULL,
    "aiParseability" DOUBLE PRECISION NOT NULL,
    "brandTrustSignals" DOUBLE PRECISION NOT NULL,
    "platformReadinessJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiVisibilityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "Site_tenantId_idx" ON "Site"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Site_tenantId_domain_key" ON "Site"("tenantId", "domain");

-- CreateIndex
CREATE INDEX "Page_tenantId_idx" ON "Page"("tenantId");

-- CreateIndex
CREATE INDEX "Page_siteId_idx" ON "Page"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_siteId_normalizedUrl_key" ON "Page"("siteId", "normalizedUrl");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_tenantId_idx" ON "ApiKey"("tenantId");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "QuotaUsage_tenantId_idx" ON "QuotaUsage"("tenantId");

-- CreateIndex
CREATE INDEX "QuotaUsage_tenantId_date_idx" ON "QuotaUsage"("tenantId", "date");

-- CreateIndex
CREATE INDEX "ScoreSnapshot_tenantId_idx" ON "ScoreSnapshot"("tenantId");

-- CreateIndex
CREATE INDEX "ScoreSnapshot_siteId_idx" ON "ScoreSnapshot"("siteId");

-- CreateIndex
CREATE INDEX "ScoreSnapshot_pageId_idx" ON "ScoreSnapshot"("pageId");

-- CreateIndex
CREATE INDEX "ScoreModuleResult_tenantId_idx" ON "ScoreModuleResult"("tenantId");

-- CreateIndex
CREATE INDEX "ScoreModuleResult_scoreSnapshotId_idx" ON "ScoreModuleResult"("scoreSnapshotId");

-- CreateIndex
CREATE INDEX "AuditIssue_tenantId_idx" ON "AuditIssue"("tenantId");

-- CreateIndex
CREATE INDEX "AuditIssue_scoreSnapshotId_idx" ON "AuditIssue"("scoreSnapshotId");

-- CreateIndex
CREATE INDEX "Recommendation_tenantId_idx" ON "Recommendation"("tenantId");

-- CreateIndex
CREATE INDEX "Recommendation_scoreSnapshotId_idx" ON "Recommendation"("scoreSnapshotId");

-- CreateIndex
CREATE INDEX "Integration_tenantId_idx" ON "Integration"("tenantId");

-- CreateIndex
CREATE INDEX "Integration_siteId_idx" ON "Integration"("siteId");

-- CreateIndex
CREATE INDEX "ProviderEnrichment_tenantId_idx" ON "ProviderEnrichment"("tenantId");

-- CreateIndex
CREATE INDEX "ProviderEnrichment_scoreSnapshotId_idx" ON "ProviderEnrichment"("scoreSnapshotId");

-- CreateIndex
CREATE INDEX "InternalLinkOpportunity_tenantId_idx" ON "InternalLinkOpportunity"("tenantId");

-- CreateIndex
CREATE INDEX "InternalLinkOpportunity_scoreSnapshotId_idx" ON "InternalLinkOpportunity"("scoreSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "AiVisibilityCheck_scoreSnapshotId_key" ON "AiVisibilityCheck"("scoreSnapshotId");

-- CreateIndex
CREATE INDEX "AiVisibilityCheck_tenantId_idx" ON "AiVisibilityCheck"("tenantId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotaUsage" ADD CONSTRAINT "QuotaUsage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreModuleResult" ADD CONSTRAINT "ScoreModuleResult_scoreSnapshotId_fkey" FOREIGN KEY ("scoreSnapshotId") REFERENCES "ScoreSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditIssue" ADD CONSTRAINT "AuditIssue_scoreSnapshotId_fkey" FOREIGN KEY ("scoreSnapshotId") REFERENCES "ScoreSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_scoreSnapshotId_fkey" FOREIGN KEY ("scoreSnapshotId") REFERENCES "ScoreSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderEnrichment" ADD CONSTRAINT "ProviderEnrichment_scoreSnapshotId_fkey" FOREIGN KEY ("scoreSnapshotId") REFERENCES "ScoreSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalLinkOpportunity" ADD CONSTRAINT "InternalLinkOpportunity_scoreSnapshotId_fkey" FOREIGN KEY ("scoreSnapshotId") REFERENCES "ScoreSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiVisibilityCheck" ADD CONSTRAINT "AiVisibilityCheck_scoreSnapshotId_fkey" FOREIGN KEY ("scoreSnapshotId") REFERENCES "ScoreSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
