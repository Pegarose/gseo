import { prisma } from '@/lib/db/prisma';
import {
  CREDIT_FEATURE_CATALOG,
  DEFAULT_MARKUP_MULTIPLIER,
  type CreditFeatureDef,
} from './catalog';

export class CreditFeatureDisabledError extends Error {
  constructor(featureKey: string) {
    super(`Credit feature disabled: ${featureKey}`);
    this.name = 'CreditFeatureDisabledError';
  }
}

export class CreditFeatureNotFoundError extends Error {
  constructor(featureKey: string) {
    super(`Unknown credit feature: ${featureKey}`);
    this.name = 'CreditFeatureNotFoundError';
  }
}

export async function ensureCreditPricingSeeded(): Promise<void> {
  const global = await prisma.creditPricingGlobal.findUnique({ where: { id: 1 } });
  if (!global) {
    await prisma.creditPricingGlobal.create({
      data: { id: 1, defaultMarkupMultiplier: DEFAULT_MARKUP_MULTIPLIER },
    });
  }

  for (const def of CREDIT_FEATURE_CATALOG) {
    await prisma.creditFeaturePricing.upsert({
      where: { featureKey: def.featureKey },
      create: {
        featureKey: def.featureKey,
        label: def.label,
        category: def.category,
        provider: def.provider,
        providerCostCredits: def.providerCostCredits,
        sellCredits: def.sellCredits,
        useAutoMarkup: def.useAutoMarkup,
        description: def.description,
      },
      update: {},
    });
  }
}

export async function getCreditPricingGlobal() {
  await ensureCreditPricingSeeded();
  return prisma.creditPricingGlobal.findUniqueOrThrow({ where: { id: 1 } });
}

export async function getAllCreditFeaturePricing() {
  await ensureCreditPricingSeeded();
  return prisma.creditFeaturePricing.findMany({
    orderBy: [{ category: 'asc' }, { label: 'asc' }],
  });
}

export async function getCreditFeaturePricing(featureKey: string) {
  await ensureCreditPricingSeeded();
  const row = await prisma.creditFeaturePricing.findUnique({ where: { featureKey } });
  if (!row) throw new CreditFeatureNotFoundError(featureKey);
  return row;
}

export function computeSellCredits(
  feature: {
    providerCostCredits: number;
    sellCredits: number;
    useAutoMarkup: boolean;
  },
  markupMultiplier: number,
  providerUnits = 1
): number {
  const units = Math.max(1, providerUnits);
  const baseCost = feature.providerCostCredits * units;

  if (feature.useAutoMarkup && baseCost > 0) {
    return Math.max(1, Math.ceil(baseCost * markupMultiplier));
  }

  if (feature.useAutoMarkup && baseCost === 0) {
    return feature.sellCredits;
  }

  return Math.max(0, feature.sellCredits);
}

export async function resolveSellCredits(
  featureKey: string,
  options?: { providerUnits?: number }
): Promise<{
  sellCredits: number;
  providerCost: number;
  provider: string;
  label: string;
}> {
  const [feature, global] = await Promise.all([
    getCreditFeaturePricing(featureKey),
    getCreditPricingGlobal(),
  ]);

  if (!feature.enabled) {
    throw new CreditFeatureDisabledError(featureKey);
  }

  const providerUnits = options?.providerUnits ?? 1;
  const providerCost = feature.providerCostCredits * Math.max(1, providerUnits);
  const sellCredits = computeSellCredits(feature, global.defaultMarkupMultiplier, providerUnits);

  return {
    sellCredits,
    providerCost,
    provider: feature.provider,
    label: feature.label,
  };
}

export async function updateCreditPricingGlobal(defaultMarkupMultiplier: number) {
  if (!Number.isFinite(defaultMarkupMultiplier) || defaultMarkupMultiplier < 1) {
    throw new Error('Markup çarpanı en az 1 olmalı.');
  }

  await ensureCreditPricingSeeded();

  const global = await prisma.creditPricingGlobal.update({
    where: { id: 1 },
    data: { defaultMarkupMultiplier },
  });

  const features = await prisma.creditFeaturePricing.findMany({
    where: { useAutoMarkup: true, providerCostCredits: { gt: 0 } },
  });

  for (const f of features) {
    const sellCredits = computeSellCredits(f, defaultMarkupMultiplier);
    await prisma.creditFeaturePricing.update({
      where: { id: f.id },
      data: { sellCredits },
    });
  }

  return global;
}

export async function updateCreditFeaturePricing(
  featureKey: string,
  data: {
    providerCostCredits?: number;
    sellCredits?: number;
    useAutoMarkup?: boolean;
    enabled?: boolean;
    label?: string;
    description?: string;
  }
) {
  await ensureCreditPricingSeeded();
  const global = await getCreditPricingGlobal();
  const existing = await getCreditFeaturePricing(featureKey);

  const providerCostCredits = data.providerCostCredits ?? existing.providerCostCredits;
  const useAutoMarkup = data.useAutoMarkup ?? existing.useAutoMarkup;
  let sellCredits = data.sellCredits ?? existing.sellCredits;

  if (useAutoMarkup) {
    sellCredits = computeSellCredits(
      { providerCostCredits, sellCredits, useAutoMarkup: true },
      global.defaultMarkupMultiplier
    );
  }

  return prisma.creditFeaturePricing.update({
    where: { featureKey },
    data: {
      ...(data.label !== undefined && { label: data.label }),
      ...(data.description !== undefined && { description: data.description }),
      providerCostCredits,
      useAutoMarkup,
      sellCredits,
      ...(data.enabled !== undefined && { enabled: data.enabled }),
    },
  });
}

export async function resetCreditPricingToDefaults() {
  await ensureCreditPricingSeeded();
  const global = await getCreditPricingGlobal();

  for (const def of CREDIT_FEATURE_CATALOG) {
    const sellCredits = def.useAutoMarkup
      ? computeSellCredits(def, global.defaultMarkupMultiplier)
      : def.sellCredits;

    await prisma.creditFeaturePricing.update({
      where: { featureKey: def.featureKey },
      data: {
        label: def.label,
        category: def.category,
        provider: def.provider,
        providerCostCredits: def.providerCostCredits,
        sellCredits,
        useAutoMarkup: def.useAutoMarkup,
        enabled: true,
        description: def.description ?? null,
      },
    });
  }

  await prisma.creditPricingGlobal.update({
    where: { id: 1 },
    data: { defaultMarkupMultiplier: DEFAULT_MARKUP_MULTIPLIER },
  });
}

export type { CreditFeatureDef };
