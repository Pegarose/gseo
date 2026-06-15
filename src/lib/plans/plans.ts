export interface PlanLimits {
  name: string;
  monthlyScoreLimit: number;
  monthlyAiCreditLimit: number;
  maxSites: number;
  maxUsers: number;
  allowedFeatures: string[];
  stripePriceId?: string;
}

export const PLANS: Record<string, PlanLimits> = {
  free: {
    name: 'Free',
    monthlyScoreLimit: 25,
    monthlyAiCreditLimit: 100,
    maxSites: 1,
    maxUsers: 1,
    allowedFeatures: ['score:read', 'site:read', 'site:write', 'semantic:read'],
  },
  starter: {
    name: 'Starter',
    monthlyScoreLimit: 500,
    monthlyAiCreditLimit: 500,
    maxSites: 3,
    maxUsers: 3,
    allowedFeatures: ['score:read', 'site:read', 'site:write', 'semantic:read', 'ai:read', 'links:read'],
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
  professional: {
    name: 'Professional',
    monthlyScoreLimit: 5000,
    monthlyAiCreditLimit: 2500,
    maxSites: 10,
    maxUsers: 10,
    allowedFeatures: ['score:read', 'site:read', 'site:write', 'semantic:read', 'ai:read', 'links:read', 'webhook:write'],
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL,
  },
  agency: {
    name: 'Agency',
    monthlyScoreLimit: 50000,
    monthlyAiCreditLimit: 10000,
    maxSites: 100,
    maxUsers: 50,
    allowedFeatures: ['score:read', 'site:read', 'site:write', 'semantic:read', 'ai:read', 'links:read', 'webhook:write', 'internal-api'],
    stripePriceId: process.env.STRIPE_PRICE_AGENCY,
  },
};

export function getPlanLimits(planKey: string): PlanLimits {
  return PLANS[planKey] ?? PLANS.free;
}

export function isFeatureAllowed(planKey: string, feature: string): boolean {
  return getPlanLimits(planKey).allowedFeatures.includes(feature);
}
