import { NextRequest } from 'next/server';
import { stripe } from '@/lib/billing/stripe';
import { prisma } from '@/lib/db/prisma';
import { logAuditEvent } from '@/lib/audit/logger';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event;
  try {
    event = stripe!.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const tenantId = session.metadata?.tenantId;
    const plan = session.metadata?.plan;
    const topUpCredits = session.metadata?.topUpCredits;

    if (!tenantId) {
      return new Response('Missing tenantId metadata', { status: 400 });
    }

    if (plan) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { plan },
      });

      await logAuditEvent({
        tenantId,
        actorType: 'api_key',
        action: 'billing.plan_upgraded',
        resource: tenantId,
        metadata: { plan, sessionId: session.id },
      });
    }

    if (topUpCredits) {
      const credits = parseInt(topUpCredits, 10);
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { aiCreditLimit: { increment: credits } },
      });

      await logAuditEvent({
        tenantId,
        actorType: 'api_key',
        action: 'billing.credits_topped_up',
        resource: tenantId,
        metadata: { credits, sessionId: session.id },
      });
    }
  }

  return new Response('OK', { status: 200 });
}
