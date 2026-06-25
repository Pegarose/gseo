import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { checkQuotaLimit } from '@/lib/auth/quota';
import { resolveSellCredits } from './pricing';

export class InsufficientCreditsError extends Error {
  used: number;
  limit: number;
  required: number;

  constructor(used: number, limit: number, required: number) {
    super(
      `Kredi limiti aşıldı. Gerekli: ${required}, kullanılan: ${used}/${limit === 0 ? '∞' : limit}`
    );
    this.name = 'InsufficientCreditsError';
    this.used = used;
    this.limit = limit;
    this.required = required;
  }
}

export interface ChargeCreditsInput {
  tenantId: string;
  featureKey: string;
  siteId?: string;
  endpoint?: string;
  cached?: boolean;
  providerUnits?: number;
  metadata?: Record<string, unknown>;
}

export interface ChargeCreditsResult {
  charged: number;
  cached: boolean;
  providerCost: number;
  featureKey: string;
  label: string;
  balance: { used: number; limit: number };
}

function todayUtc(): Date {
  return new Date(new Date().toISOString().split('T')[0]);
}

export async function chargeTenantCredits(
  input: ChargeCreditsInput
): Promise<ChargeCreditsResult> {
  const { tenantId, featureKey, siteId, cached = false, providerUnits, metadata } = input;

  if (cached) {
    const quota = await checkQuotaLimit(tenantId, 0);
    const pricing = await resolveSellCredits(featureKey, { providerUnits });
    return {
      charged: 0,
      cached: true,
      providerCost: 0,
      featureKey,
      label: pricing.label,
      balance: { used: quota.used, limit: quota.limit },
    };
  }

  const pricing = await resolveSellCredits(featureKey, { providerUnits });
  const amount = pricing.sellCredits;

  const quota = await checkQuotaLimit(tenantId, amount);
  if (!quota.success) {
    throw new InsufficientCreditsError(quota.used, quota.limit, amount);
  }

  const endpoint = input.endpoint ?? featureKey;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.quotaUsage.create({
      data: {
        tenantId,
        siteId,
        endpoint,
        featureKey,
        provider: pricing.provider,
        providerCost: pricing.providerCost,
        units: amount,
        cached: false,
        date: todayUtc(),
      },
    });
    await tx.creditLedgerEntry.create({
      data: {
        tenantId,
        featureKey,
        provider: pricing.provider,
        providerCost: pricing.providerCost,
        sellCredits: amount,
        cached: false,
        siteId,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
    return tx.tenant.update({
      where: { id: tenantId },
      data: { aiCreditUsed: { increment: amount } },
      select: { aiCreditUsed: true, aiCreditLimit: true },
    });
  });

  return {
    charged: amount,
    cached: false,
    providerCost: pricing.providerCost,
    featureKey,
    label: pricing.label,
    balance: {
      used: updated.aiCreditUsed,
      limit: updated.aiCreditLimit,
    },
  };
}

export async function assertTenantHasCredits(
  tenantId: string,
  featureKey: string,
  options?: { providerUnits?: number; cached?: boolean }
): Promise<void> {
  if (options?.cached) return;

  const pricing = await resolveSellCredits(featureKey, {
    providerUnits: options?.providerUnits,
  });
  const quota = await checkQuotaLimit(tenantId, pricing.sellCredits);
  if (!quota.success) {
    throw new InsufficientCreditsError(quota.used, quota.limit, pricing.sellCredits);
  }
}
