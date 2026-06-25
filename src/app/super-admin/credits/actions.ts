'use server';

import { requireSuperAdmin } from '../actions';
import { logAuditEvent } from '@/lib/audit/logger';
import {
  getAllCreditFeaturePricing,
  getCreditPricingGlobal,
  updateCreditFeaturePricing,
  updateCreditPricingGlobal,
  resetCreditPricingToDefaults,
  ensureCreditPricingSeeded,
} from '@/lib/credits/pricing';

export async function getCreditPricingAdminData() {
  await requireSuperAdmin();
  await ensureCreditPricingSeeded();
  const [global, features] = await Promise.all([
    getCreditPricingGlobal(),
    getAllCreditFeaturePricing(),
  ]);
  return { global, features };
}

export async function saveCreditMarkupMultiplier(multiplier: number) {
  const session = await requireSuperAdmin();
  const global = await updateCreditPricingGlobal(multiplier);

  await logAuditEvent({
    actorId: session.user.id,
    actorType: 'user',
    action: 'credits.markup_updated',
    metadata: { defaultMarkupMultiplier: multiplier },
  });

  return global;
}

export async function saveCreditFeaturePricing(
  featureKey: string,
  data: {
    providerCostCredits?: number;
    sellCredits?: number;
    useAutoMarkup?: boolean;
    enabled?: boolean;
  }
) {
  const session = await requireSuperAdmin();
  const updated = await updateCreditFeaturePricing(featureKey, data);

  await logAuditEvent({
    actorId: session.user.id,
    actorType: 'user',
    action: 'credits.feature_updated',
    metadata: { featureKey, changes: data },
  });

  return updated;
}

export async function resetAllCreditPricing() {
  const session = await requireSuperAdmin();
  await resetCreditPricingToDefaults();

  await logAuditEvent({
    actorId: session.user.id,
    actorType: 'user',
    action: 'credits.reset_defaults',
  });

  return { success: true };
}
