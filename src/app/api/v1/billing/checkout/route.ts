import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { stripe, isStripeConfigured } from '@/lib/billing/stripe';
import { prisma } from '@/lib/db/prisma';
import { getPlanLimits } from '@/lib/plans/plans';
import { checkRateLimit } from '@/lib/rate-limit';
import { createRateLimitResponse } from '@/lib/utils/rate-limit';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  const rl = await checkRateLimit(context.tenantId, 'billing/checkout', 30, req.headers.get('x-forwarded-for') || 'unknown');
  if (!rl.success) {
    return createRateLimitResponse(rl.info, context.requestId);
  }

  if (!isStripeConfigured()) {
    return errorResponse('Billing is not configured.', 'BILLING_NOT_CONFIGURED', 503, {}, context.requestId);
  }

  const body = await req.json().catch(() => ({}));
  const { plan, topUpCredits } = body;

  const tenant = await prisma.tenant.findUnique({
    where: { id: context.tenantId },
  });

  if (!tenant) {
    return errorResponse('Tenant not found.', 'NOT_FOUND', 404, {}, context.requestId);
  }

  // Plan upgrade flow
  if (plan && typeof plan === 'string') {
    const limits = getPlanLimits(plan);
    if (!limits.stripePriceId) {
      return errorResponse('Invalid plan or missing Stripe price ID.', 'VALIDATION_ERROR', 400, {}, context.requestId);
    }

    const session = await stripe!.checkout.sessions.create({
      mode: 'subscription',
      customer_email: undefined,
      line_items: [{ price: limits.stripePriceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?checkout=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?checkout=cancel`,
      metadata: { tenantId: tenant.id, plan },
      subscription_data: { metadata: { tenantId: tenant.id, plan } },
    });

    return successResponse({ checkoutUrl: session.url }, Date.now() - startTime, context.requestId);
  }

  // Top-up flow
  if (topUpCredits && typeof topUpCredits === 'number') {
    const unitAmount = 10; // $0.10 per credit
    const session = await stripe!.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `AI Credit Top-up (${topUpCredits} credits)` },
            unit_amount: unitAmount,
          },
          quantity: topUpCredits,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?topup=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?topup=cancel`,
      metadata: { tenantId: tenant.id, topUpCredits: String(topUpCredits) },
    });

    return successResponse({ checkoutUrl: session.url }, Date.now() - startTime, context.requestId);
  }

  return errorResponse('Missing plan or topUpCredits.', 'VALIDATION_ERROR', 400, {}, context.requestId);
}

export const POST = withAuth(handler, 'site:read');
